import { Injectable, Logger } from '@nestjs/common';
import { AuthHelper } from './helper';
import { AuthRepo } from './repository';

@Injectable()
export class AuthGoogleService {
  private readonly logger = new Logger(AuthGoogleService.name);

  constructor(
    private readonly helper: AuthHelper,
    private readonly authRepo: AuthRepo,
  ) {}

  async googleSignIn(token: string) {
    const googleUser = await this.helper.verifyToken(token);

    // check if user exists
    let user = await this.authRepo.findByEmail(googleUser.email!);
    if (!user) {
      user = await this.authRepo.create({
        firstname: googleUser.firstname!,
        lastname: googleUser.lastname!,
        username: `${googleUser.firstname}${Math.random().toString(36).substring(2, 6)}`,
        email: googleUser.email!,
        isEmailVerified: googleUser.emailVerified,
        googleSignIn: true,
      });
    }

    // if user exists and mfa is enabled send temporary jwt and wait for mfa verifcation
    if (user.mfaEnabled) {
      const { accessToken } = await this.helper.generateTemporaryToken({
        email: user.email,
        id: user.id,
      });
      this.logger.log('jwt tokens generated');

      return {
        user: this.helper.sanitizeObject(user),
        accessToken,
      };
    }
    // if mfa isnt enabled send regular jwt and complete login
    const { accessToken, refreshToken } = await this.helper.generateTokens({
      email: user.email,
      id: user.id,
    });
    await this.authRepo
      .update(user.id, { refreshToken })
      .then(() => this.logger.log('refresh token saved to DB'));

    return {
      user: this.helper.sanitizeObject(user),
      accessToken,
      refreshToken,
    };
  }
}
