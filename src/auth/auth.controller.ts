import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import CreateAccountDto from './dto/auth.dto';
import LoginDto from './dto/login.dto';
import { AuthGuard } from './guard/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() data: CreateAccountDto) {
    const user = await this.authService.createUser(data);
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
  async updatePassword(
    @Request() req,
    @Body() password: string,
    newPassword: string,
  ) {
    const updatedUser = await this.authService.updatePassword(
      req.user.id,
      password,
      newPassword,
    );

    return updatedUser;
  }
}
