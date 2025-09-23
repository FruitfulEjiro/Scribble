import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer, { Transporter, SendMailOptions } from 'nodemailer';

@Injectable()
class EmailService {
  constructor(private readonly configService: ConfigService) {}

  async sendWelcomeMail(email: string) {
    await this.sendMail(
      email,
      'Welcome',
      'Welcome to scribble',
      '<p>Welcome to scribble</p>',
    );
  }

  async sendLoginMail(email: string) {
    await this.sendMail(
      email,
      'New Login',
      'We noticed a new login to your account',
      '<p>We noticed a new login to your account</p>',
    );
  }

  async sendPasswordResetCode(email: string, link: string) {
    await this.sendMail(
      email,
      'Password Reset Request',
      `You requested a password reset. Click this link to reset your password: ${link}`,
      `<p>"You requested a password reset. Click this link to reset your password: "<a href=${link}>click here</a></p>`,
    );
  }

  async sendInviteToCollaborate(email: string, link: string) {
    await this.sendMail(
      email,
      'Invite to Collaborate',
      `You have been invited to collaborate on a post. Click this link to accept the invite: ${link}`,
      `<p>You have been invited to collaborate on a post. Click this link to accept the invite: "<a href=${link}>click here</a></p>`,
    );
  }

  async notifyCollaboraionAcceptedMail(email: string, postTitle: string) {
    await this.sendMail(
      email,
      'Collaboration Accepted',
      `Your invite to collaborate on the post "${postTitle}" has been accepted.`,
      `<p>Your invite to collaborate on the post "${postTitle}" has been accepted.</p>`,
    );
  }

  private async sendMail(
    to: string,
    subject: string,
    text: string,
    html: string,
  ) {
    const options: SendMailOptions = {
      from: {
        name: 'Scribble',
        address: this.configService.get<string>('emailUser')!,
      },
      to,
      subject,
      text,
      html,
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
