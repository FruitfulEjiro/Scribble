import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

@Injectable()
class EmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendWelcomeMail(email: string) {
    const options: SendMailOptions = {
      from: {
        name: 'Scribble',
        address: this.configService.get<string>('emailUser')!,
      },
      to: email,
      subject: 'Welcome',
      text: 'Welcome to Scribble',
      html: '<p>Welcome to scribble</p>',
    };
    const transporter = await this.emailTransport();
    await transporter.sendMail(<SendMailOptions>options);
  }

  private async emailTransport(): Promise<Transporter> {
    return nodemailer.createTransport({
      host: this.configService.get<string>('emailHost'),
      port: this.configService.get<number>('emailPort'),
      secure: true,
      auth: {
        user: this.configService.get<string>('emailUser'),
        pass: this.configService.get<string>('emailPassword'),
      },
    });
  }
}

export default EmailService;
