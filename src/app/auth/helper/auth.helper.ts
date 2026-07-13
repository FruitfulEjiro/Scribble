import {
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import crypto, { randomInt } from 'crypto';
import { OAuth2Client } from 'google-auth-library';

const ALGORITHM = 'aes-256-gcm';
const KEY = Buffer.from(process.env['MFA_ENCRYPTION_KEY']!, 'hex');

@Injectable()
export class AuthHelper {
  private client: OAuth2Client;
  private readonly logger = new Logger(AuthHelper.name);

  constructor(private readonly jwt: JwtService) {
    this.client = new OAuth2Client(process.env['GOOGLE_CLIENT_ID']);
  }

  async bcryptHash(data: string) {
    try {
      return await bcrypt.hash(data, 12);
    } catch (err) {
      this.logger.error('has not successful', err);
      throw new InternalServerErrorException("couldn't hash password");
    }
  }

  async bcryptVerify(data: string, DBData: string) {
    try {
      return await bcrypt.compare(data, DBData);
    } catch (err) {
      this.logger.error("couldn't verify password", err);
      throw new InternalServerErrorException("couldn't verify password");
    }
  }

  sanitizeObject(user: Record<string, any>) {
    const {
      refreshToken,
      password,
      otp,
      otpExpiresAt,
      mfaSecret,
      backupCodes,
      ...result
    } = user;
    return result;
  }

  generateOTP() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let otp = '';

    for (let i = 0; i < 6; i++) {
      const randomIndex = randomInt(0, chars.length);
      otp += chars[randomIndex];
    }

    return otp;
  }

  async generateTokens(data: { email: string; id: string }) {
    const payload = {
      email: data.email,
      id: data.id,
    };

    const accessToken = await this.jwt.sign(payload, {
      secret: process.env['ACCESS_TOKEN_SECRET'],
      expiresIn: '1h',
    });

    const refreshToken = await this.jwt.sign(payload, {
      secret: process.env['REFRESH_TOKEN_SECRET'],
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async generateTemporaryToken(data: { email: string; id: string }) {
    const payload = {
      email: data.email,
      id: data.id,
    };

    const accessToken = await this.jwt.sign(payload, {
      secret: process.env['ACCESS_TOKEN_SECRET'],
      expiresIn: '10m',
    });

    return {
      accessToken,
    };
  }

  async verifyAccessToken(token: string) {
    return await this.jwt.verify(token, {
      secret: process.env['ACCESS_TOKEN_SECRET'],
    });
  }

  async verifyRefreshToken(token: string) {
    return await this.jwt.verify(token, {
      secret: process.env['REFRESH_TOKEN_SECRET'],
    });
  }

  hashCode(code: string) {
    return crypto.createHash('sha256').update(code).digest('hex');
  }

  encryptMfaSecret(code: string) {
    const iv = crypto.randomBytes(12); // 12 bytes for GCM
    const cipher = crypto.createCipheriv(ALGORITHM, KEY, iv);

    const encrypted = Buffer.concat([
      cipher.update(code, 'utf8'),
      cipher.final(),
    ]);
    const authTag = cipher.getAuthTag(); // GCM integrity check

    // Store iv + authTag + encrypted together as one string
    return Buffer.concat([iv, authTag, encrypted]).toString('hex');
  }

  decryptMfaSecret(DBSecret: string) {
    const buf = Buffer.from(DBSecret, 'hex');
    const iv = buf.subarray(0, 12);
    const authTag = buf.subarray(12, 28);
    const encrypted = buf.subarray(28);

    const decipher = crypto.createDecipheriv(ALGORITHM, KEY, iv);
    decipher.setAuthTag(authTag);

    return Buffer.concat([
      decipher.update(encrypted),
      decipher.final(),
    ]).toString('utf8');
  }

  async verifyToken(token: string) {
    try {
      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: process.env['GOOGLE_CLIENT_ID'],
      });

      const payload = ticket.getPayload();
      if (!payload) throw new UnauthorizedException('empty token payload');
      if (!payload.email_verified)
        throw new UnauthorizedException('google email not verified');

      return {
        googleId: payload.sub,
        email: payload.email,
        firstname: payload.given_name,
        lastname: payload.family_name,
        emailVerified: payload.email_verified,
      };
    } catch (err) {
      this.logger.debug(err);
      throw new UnauthorizedException('Invalid or expired Google token');
    }
  }
}
