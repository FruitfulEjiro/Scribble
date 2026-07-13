import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import speakeasy from 'speakeasy';
import crypto from 'crypto';
import qrcode from 'qrcode';
import { AuthHelper } from './helper';
import { AuthRepo } from './repository';

@Injectable()
export class AuthMfaService {
  private readonly logger = new Logger(AuthMfaService.name);
  constructor(
    private readonly authRepo: AuthRepo,
    private readonly helper: AuthHelper,
  ) {}

  async setup(userId: string, email: string) {
    // generate secret
    const secret = speakeasy.generateSecret({
      name: `Verifi (${email})`,
      issuer: 'Verifi',
      length: 32,
    });
    const encryptedMfaSecret = this.helper.encryptMfaSecret(secret.base32);

    // generate backup codes
    const backupCodes = Array.from({ length: 10 }, () =>
      crypto.randomBytes(4).toString('hex').toUpperCase(),
    );
    const hashedCodes = backupCodes.map((code) => this.helper.hashCode(code));

    // save backupcodes and mfa secret to DB
    await this.authRepo
      .update(userId, {
        backupCodes: hashedCodes,
        mfaSecret: encryptedMfaSecret,
      })
      .then(() => this.logger.log('mfa secret and backup codes saved to DB'));

    const qrDataUrl = await qrcode.toDataURL(secret.otpauth_url);

    return {
      qrDataUrl,
      secret: secret.base32,
      backupCodes,
    };
  }

  async confirmMfaSetup(userId: string, code: string) {
    const user = await this.authRepo.findById(userId);
    if (!user || !user.mfaSecret)
      throw new NotFoundException(
        "user doesn't exist or mfa setup not initiated",
      );

    const decodedMfaSecret = this.helper.decryptMfaSecret(user.mfaSecret);
    const isValid = speakeasy.totp.verify({
      secret: decodedMfaSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (!isValid) throw new ForbiddenException('invalid code');

    await this.authRepo
      .update(userId, { mfaEnabled: true })
      .then(() => this.logger.log('mfa auhthentication enabled'));

    return true;
  }

  async verifyMfaCode(userId: string, code: string) {
    const user = await this.authRepo.findById(userId);
    if (!user || !user.mfaSecret)
      throw new NotFoundException(
        "user doesn't exist or mfa setup not initiated",
      );

    // decode and verify mfa secret
    const decodedMfaSecret = this.helper.decryptMfaSecret(user.mfaSecret);
    const isValid = speakeasy.totp.verify({
      secret: decodedMfaSecret,
      encoding: 'base32',
      token: code,
      window: 1,
    });
    if (!isValid) {
      // fallback to backup code
      const hashToken = this.helper.hashCode(code);
      const idx = user.backupCodes.indexOf(hashToken);
      if (idx === -1) return { user: null };

      const updatedBackupCodes = [...user.backupCodes];
      updatedBackupCodes.splice(idx, 1);
      await this.authRepo.update(userId, { backupCodes: updatedBackupCodes });
    }

    const { accessToken, refreshToken } = await this.helper.generateTokens({
      email: user.email,
      id: user.id,
    });
    await this.authRepo
      .update(user.id, { refreshToken })
      .then(() => this.logger.log('refresh token saved to DB'));

    //  return jwt tokens
    return {
      user: this.helper.sanitizeObject(user),
      accessToken,
      refreshToken,
    };
  }

  async disableMfa(userId: string) {
    await this.authRepo
      .update(userId, {
        backupCodes: [],
        mfaEnabled: false,
        mfaSecret: null,
      })
      .then(() => this.logger.log('mfa disabled successfully'));

    return true;
  }
}
