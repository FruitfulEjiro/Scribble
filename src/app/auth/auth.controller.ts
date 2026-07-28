import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos';
import { Response } from 'express';
import { CurrentUser, Public } from '../../lib/decorators';
import { AuthenticatedUser } from 'src/lib/types/auth.types';
import { JwtRefreshGuard } from 'src/lib/guards';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() data: CreateUserDto) {
    const { user } = await this.authService.signup(data);

    return {
      status: 'success',
      message: 'signup successful',
      data: user,
    };
  }

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() { email, password }: { email: string; password: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken, message } =
      await this.authService.login(email, password);

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
      message: message || 'login successful',
      data: user,
    };
  }

  @Public()
  @Post('resend-otp')
  @HttpCode(HttpStatus.OK)
  async resendOtp(@Body('email') email: string) {
    return await this.authService.resendOtp(email);
  }

  @Public()
  @Post('verify-otp')
  @HttpCode(HttpStatus.OK)
  async verifyOtp(
    @Body() { email, otp }: { email: string; otp: string },
    @Res({ passthrough: true }) res: Response,
  ) {
    const { user, accessToken, refreshToken } =
      await this.authService.verifyOtp(email, otp);

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: +process.env['ACCESS_TOKEN_COOKIE_EXPIRES_IN']! * 60 * 60 * 1000,
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
      message: 'otp verification successful',
      data: user,
    };
  }

  @Post('refresh-tokens')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userId = user.id;
    const refresh_token = user.refreshToken;

    const { accessToken, refreshToken } = await this.authService.refreshTokens(
      +userId,
      refresh_token,
    );

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: +process.env['ACCESS_TOKEN_COOKIE_EXPIRES_IN']! * 60 * 60 * 1000,
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
      status: true,
      message: 'tokens refreshed',
    };
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Body()
    { oldPassword, newPassword }: { oldPassword: string; newPassword: string },
    @CurrentUser() user: AuthenticatedUser,
  ) {
    await this.authService.changePassword(user.id, oldPassword, newPassword);

    return {
      status: 'success',
      message: 'password changed successfully',
    };
  }

  @Public()
  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body() { email }: { email: string }) {
    const data = await this.authService.forgotPassword(email);

    return {
      status: true,
      data,
    };
  }

  @Public()
  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Body() dto: { code: string; email: string; newPassword: string },
  ) {
    const data = await this.authService.resetPassword(
      dto.code,
      dto.email,
      dto.newPassword,
    );

    return {
      status: true,
      data,
    };
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @CurrentUser() user: AuthenticatedUser,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logout(user.id);

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh-tokens',
    });

    return {
      status: 'success',
      message: 'logout successful',
    };
  }
}
