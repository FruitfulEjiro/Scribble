import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dtos';
import { AuthHelper } from './helper';
import EventEmitter2 from 'eventemitter2';
import { AuthRepo } from './repository';
import { AuthEvents, EVENTS } from 'src/shared/events';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly authRepo: AuthRepo,
    private readonly helper: AuthHelper,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async signup(data: CreateUserDto) {
    const { firstname, lastname, email, username, password } = data;

    const existingUser = await this.authRepo.findByEmail(email);
    if (existingUser) throw new BadRequestException('user already exists');

    const hashedPassword = await this.helper.bcryptHash(password);
    const newUser = await this.authRepo.create({
      firstname,
      lastname,
      email,
      username,
      password: hashedPassword,
    });
    if (!newUser)
      throw new InternalServerErrorException('failed to create new user');
    this.logger.log(`new user created with ID: ${newUser.id}`);

    // send signnup email
    const otp = this.helper.generateOTP();
    const hashedOtp = await this.helper.bcryptHash(otp);
    await this.authRepo
      .update(newUser.id, {
        otp: hashedOtp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      })
      .then(() => this.logger.log('otp saved to DB'));

    this.eventEmitter.emit(
      EVENTS.SIGN_UP_OTP,
      new AuthEvents.SignupOtp(newUser.email, otp),
    );

    return {
      user: this.helper.sanitizeObject(newUser),
    };
  }

  async login(email: string, password: string) {
    const userExists = await this.authRepo.findOne({ email });
    if (
      !userExists ||
      !(await this.helper.bcryptVerify(password, userExists.password!))
    )
      throw new NotFoundException('incorrect email or password');

    if (!userExists.isEmailVerified) {
      const otp = this.helper.generateOTP();
      const hashedOtp = await this.helper.bcryptHash(otp);
      await this.authRepo
        .update(userExists.id, {
          otp: hashedOtp,
          otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
        })
        .then(() => this.logger.log('otp saved to DB'));

      this.eventEmitter.emit(
        EVENTS.SIGN_UP_OTP,
        new AuthEvents.SignupOtp(userExists.email, otp),
      );

      return {
        message: 'otp sent to user email',
        user: this.helper.sanitizeObject(userExists),
      };
    }

    // if mfa is enabled send temporary jwt and wait for mfa verifcation
    if (userExists.mfaEnabled) {
      const { accessToken } = await this.helper.generateTemporaryToken({
        email: userExists.email,
        id: userExists.id,
      });
      this.logger.log('jwt tokens generated');

      return {
        user: this.helper.sanitizeObject(userExists),
        accessToken,
        message: 'input code from verification app',
      };
    }
    // if mfa isnt enabled send regular jwt and complete login
    const { accessToken, refreshToken } = await this.helper.generateTokens({
      email: userExists.email,
      id: userExists.id,
    });
    await this.authRepo
      .update(userExists.id, { refreshToken })
      .then(() => this.logger.log('refresh token saved to DB'));

    return {
      user: this.helper.sanitizeObject(userExists),
      accessToken,
      refreshToken,
    };
  }

  async resendOtp(email: string) {
    const otp = this.helper.generateOTP();
    const hashedOtp = await this.helper.bcryptHash(otp);

    await this.authRepo
      .updateByEmail(email, {
        otp: hashedOtp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      })
      .then(() => this.logger.log('otp saved to DB'));

    this.eventEmitter.emit(
      EVENTS.SIGN_UP_OTP,
      new AuthEvents.SignupOtp(email, otp),
    );

    return {
      message: 'otp resend successfully',
    };
  }

  async verifyOtp(email: string, otp: string) {
    const user = await this.authRepo.findOne({ email });
    if (!user) throw new NotFoundException('user not found');
    
    if (!user.otp) throw new ForbiddenException('invalid or expired otp code');

    if (!(await this.helper.bcryptVerify(otp, user.otp)))
      throw new ForbiddenException('invalid otp code');

    const { accessToken, refreshToken } = await this.helper.generateTokens({
      email: user.email,
      id: user.id,
    });
    this.logger.log('jwt tokens generated');

    const verifiedUser = await this.authRepo
      .update(user.id, {
        otp: null,
        refreshToken: await this.helper.bcryptHash(refreshToken),
        otpExpiresAt: null,
        isEmailVerified: true,
      })
      .then((data) => {
        this.logger.log('otp and refresh token saved to DB');
        return data;
      });

    return {
      user: this.helper.sanitizeObject(verifiedUser!),
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(userId: number, currentRefreshToken: string) {
    const user = await this.authRepo.findById(userId.toString());
    // 1. check if user exists and has a refresh token
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }
    // 2. verify is token is the same with the one in the database
    const isTokenMatching = this.helper.bcryptVerify(
      currentRefreshToken,
      user.refreshToken,
    );
    // 3. check if token is valid
    if (!isTokenMatching) {
      await this.authRepo.update(userId.toString(), { refreshToken: null });
      throw new ForbiddenException(
        'invalid refresh token. Please log in again.',
      );
    }
    // 4. generate new tokens and retate DB tokens
    const { accessToken, refreshToken } = await this.helper.generateTokens({
      email: user.email,
      id: user.id,
    });
    const hashedRt = await this.helper.bcryptHash(refreshToken);
    await this.authRepo
      .update(user.id, { refreshToken: hashedRt })
      .then(() =>
        this.logger.log('new refresh tokens generated and saved to DB'),
      );

    return {
      accessToken,
      refreshToken,
    };
  }

  async changePassword(id: string, OldPassword: string, newPassword: string) {
    const user = await this.authRepo.findById(id);

    const isPasswordCorrect = await this.helper.bcryptVerify(
      OldPassword,
      user?.password!,
    );
    if (!isPasswordCorrect) throw new ForbiddenException('incorrect password');

    const hashedPassword = await this.helper.bcryptHash(newPassword);
    await this.authRepo.update(id, {
      password: hashedPassword,
      passwordChangedAt: new Date(Date.now()),
    });
  }

  async forgotPassword(email: string) {
    const user = await this.authRepo.findOne({ email });
    if (!user)
      return {
        message: 'if email is valid, code has been sent to email',
      };

    const code = this.helper.generateOTP();
    const hashedOtp = await this.helper.bcryptHash(code);

    await this.authRepo
      .updateByEmail(email, {
        otp: hashedOtp,
        otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      })
      .then(() => this.logger.log('otp saved to DB'));

    this.eventEmitter.emit(
      EVENTS.RESET_PASSWORD,
      new AuthEvents.SignupOtp(email, code),
    );

    return {
      message: 'if email is valid, code has been sent to email',
    };
  }

  async resetPassword(code: string, email: string, newPassword: string) {
    const user = await this.authRepo.findOne({ email });
    if (!user || !(await this.helper.bcryptVerify(code, user.otp!)))
      throw new NotFoundException('user not found');

    const hashedPassword = await this.helper.bcryptHash(newPassword);
    await this.authRepo
      .updateByEmail(email, { password: hashedPassword })
      .then(() => this.logger.log('password reset successful'));

    return {
      message: 'password reset successful, proceed to login with new password',
    };
  }

  async logout(userId: string) {
    const userExists = await this.authRepo.findById(userId);
    if (!userExists) throw new NotFoundException("user doesn't exist");

    const { accessToken, refreshToken } = await this.helper.generateTokens({
      email: userExists.email,
      id: userExists.id,
    });
    this.logger.log('jwt tokens generated');

    await this.authRepo
      .updateByEmail(userExists.email, { refreshToken: null })
      .then(() => this.logger.log('token removed from DB'));

    return {
      user: null,
    };
  }
}
