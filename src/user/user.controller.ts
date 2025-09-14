import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Request,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { UserExistsPipe } from './pipes/user-exists.pipe';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import UpdateUserDto from './dto/updata-user.dto';
import IUser from './interface/user.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('get-user/:id')
  @HttpCode(HttpStatus.OK)
  async getUser(@Param('id', UserExistsPipe) id: string) {
    const user = await this.userService.findUserById(id);
    return user;
  }

  @Patch('update')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard)
  async updateUser(
    @Request() req,
    @Body() data: UpdateUserDto,
  ): Promise<IUser> {
    const user = await this.userService.updateUser(req.user.id, data);
    return user;
  }

  @Delete('delete/:id')
  @HttpCode(HttpStatus.OK)
  async deleteUser(@Param('id', UserExistsPipe) id: string): Promise<{}> {
    const user = await this.userService.deleteUser(id);
    return user;
  }
}