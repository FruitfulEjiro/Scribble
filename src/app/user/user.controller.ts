import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Query,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CurrentUser } from 'src/lib/decorators';
import { User } from 'generated/prisma/client';
import { UpdateUserDto } from './dtos';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Patch('update')
  @HttpCode(HttpStatus.OK)
  async update(@CurrentUser() user: User, @Body() data: UpdateUserDto) {
    return this.userService.updateUser(user.id, data);
  }

  @Patch('update-username')
  @HttpCode(HttpStatus.OK)
  async updateUsername(
    @CurrentUser() user: User,
    @Body() data: { username: string },
  ) {
    return this.userService.updateUsername(user.id, data.username);
  }

  @Get('username')
  @HttpCode(HttpStatus.OK)
  async checkUsername(@Query('username') username: string) {
    return this.userService.checkUsername(username);
  }
}
