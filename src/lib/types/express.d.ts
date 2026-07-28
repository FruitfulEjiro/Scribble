import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: Omit<
        User,
        'password' | 'otp' | 'otpExpiresAt' | 'mfaSecret' | 'backupCodes'
      >;
    }
  }

  namespace PrismaJson {
    type ImageDto = {
      secure_url?: string;
      public_id?: string;
    };
    type SocialLinks = {
      github?: string;
      x?: string;
      linkedin?: string;
      website?: string;
      behance?: string;
    };
  }
}
