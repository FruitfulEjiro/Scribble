import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
} from '@nestjs/common';
import { AuthGoogleService } from './auth-google.service';

@Controller('google')
export class GoogleController {
  constructor(private readonly googleService: AuthGoogleService) {}

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  async googleSignIn(
    @Body() { token }: { token: string },
    @Res({ passthrough: true }) res: any,
  ) {
    const { user, accessToken, refreshToken } =
      await this.googleService.googleSignIn(token);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: +process.env['ACCESS_TOKEN_COOKIE_EXPIRES_IN']! * 60 * 60 * 1000,
      path: refreshToken ? '/' : '/mfa/verify-mfa',
    });

    if (refreshToken) {
      res.cookie('refresh_token', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge:
          +process.env['ACCESS_TOKEN_COOKIE_EXPIRES_IN']! * 24 * 60 * 60 * 1000,
        path: '/auth/refresh-tokens',
      });
    }

    return {
      status: 'success',
      message: 'login successful',
      data: user,
    };
  }
}
