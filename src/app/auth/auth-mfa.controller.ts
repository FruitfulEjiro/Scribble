import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthMfaService } from './auth-mfa.service';
import { CurrentUser } from '../../lib/decorators';
import { AuthenticatedUser } from 'src/lib/types/auth.types';

@Controller('mfa')
export class AuthMfaController {
  constructor(private readonly mfaService: AuthMfaService) {}

  @Post('setup-mfa')
  @HttpCode(HttpStatus.OK)
  async setupMfa(@CurrentUser() user: AuthenticatedUser) {
    return await this.mfaService.setup(user.id, user.email);
  }

  @Post('confirm-mfa')
  @HttpCode(HttpStatus.OK)
  async confirmMfa(
    @CurrentUser() user: AuthenticatedUser,
    @Body() { code }: { code: string },
  ) {
    return this.mfaService.confirmMfaSetup(user.id, code);
  }

  @Post('verify-mfa')
  @HttpCode(HttpStatus.OK)
  async verifyMfa(
    @CurrentUser() user: AuthenticatedUser,
    @Body() { code }: { code: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const {
      user: userData,
      accessToken,
      refreshToken,
    } = await this.mfaService.verifyMfaCode(user.id, code);
    if (!userData)
      return {
        success: false,
        data: null,
      };

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: +process.env['ACCESS_TOKEN_COOKIE_EXPIRES_IN']! * 60 * 60 * 1000,
      path: '/',
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge:
        +process.env['REFRESH_TOKEN_COOKIE_EXPIRES_IN']! * 24 * 60 * 60 * 1000,
      path: '/auth/refresh-tokens',
    });

    return {
      status: 'success',
      message: 'verification successful',
      data: userData,
    };
  }

  @Post('disable-mfa')
  @HttpCode(HttpStatus.OK)
  async disableMfa(@CurrentUser() user: AuthenticatedUser) {
    return this.mfaService.disableMfa(user.id);
  }
}
