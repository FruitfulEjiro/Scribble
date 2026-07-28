import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { CurrentUser, Public } from './lib/decorators';
import { Response } from 'express';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  index(@CurrentUser() user: any, @Res() res: Response) {
    if (user) {
      return res.redirect('/profile');
    }
    return res.render('index');
  }

  @Public()
  @Get('login')
  login(@Res() res: Response) {
    return res.render('login');
  }

  @Public()
  @Get('register')
  register(@Res() res: Response) {
    return res.render('register');
  }

  @Public()
  @Get('blogs')
  blogs(@Res() res: Response) {
    return res.render('blogs');
  }
}
