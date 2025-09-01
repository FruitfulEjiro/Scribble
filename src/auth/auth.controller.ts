import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import CreateAccountDto from './dto/auth.dto';
import LoginDto from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() data: CreateAccountDto) {
    const user = await this.authService.createUser(data);
    return user;
  }

  @Post("login")
  @HttpCode(HttpStatus.OK)
  async login(@Body() data: LoginDto) {
    const user = await this.authService.login(data);
    return user;
  }
}