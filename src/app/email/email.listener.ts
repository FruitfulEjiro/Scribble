import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthEvents } from '../events';

@Injectable()
export class EmailListener {
  constructor(private readonly emailService: EmailService) {}

  @OnEvent('signup:otp', { async: true })
  async signupOtpEvent(event: AuthEvents.SignupOtp) {
    return await this.emailService.signupOtp(event.email, event.otp);
  }

  @OnEvent('reset:password', { async: true })
  async resetPasswordEvent(event: AuthEvents.ResetPassword) {
    return await this.emailService.resetPassword(event.email, event.code);
  }
}
