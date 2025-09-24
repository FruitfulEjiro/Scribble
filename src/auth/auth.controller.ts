import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import CreateAccountDto from './dto/auth.dto';
import LoginDto from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';
import UpdatePasswordDto from './dto/update-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() data: CreateAccountDto) {
    const user = await this.authService.register(data);
    return user;
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() data: LoginDto) {
    const user = await this.authService.login(data);
    return user;
  }

  @Patch('update-password')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async updatePassword(@Request() req, @Body() data: UpdatePasswordDto) {
    const updatedUser = await this.authService.updatePassword(
      req.user.id,
      data.password,
      data.newPassword,
    );
    return updatedUser;
  }

  @Get('forgot-password')
  @HttpCode(HttpStatus.OK)
  async forgotPassword(@Body('email') email: string) {
    const data = await this.authService.forgotPassword(email);
    return data;
  }

  @Patch('reset-password')
  @HttpCode(HttpStatus.OK)
  async resetPassword(
    @Query('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    const data = await this.authService.resetPassword(token, newPassword);
    return data;
  }

  @Get('logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async logout(@Request() req) {
    const data = await this.authService.logout(req.user.id);
    return data;
  }
}
