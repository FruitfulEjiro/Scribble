import { Injectable } from '@nestjs/common';
import { EmailService } from './email.service';
import { OnEvent } from '@nestjs/event-emitter';
import { AuthEvents, EVENTS, InviteEvents } from '../events';

@Injectable()
export class EmailListener {
  constructor(private readonly emailService: EmailService) {}

  @OnEvent(EVENTS.SIGN_UP_OTP, { async: true })
  async signupOtpEvent(event: AuthEvents.SignupOtp) {
    return await this.emailService.signupOtp(event.email, event.otp);
  }

  @OnEvent(EVENTS.RESET_PASSWORD, { async: true })
  async resetPasswordEvent(event: AuthEvents.ResetPassword) {
    return await this.emailService.resetPassword(event.email, event.code);
  }

  @OnEvent(EVENTS.INVITE_USER, { async: true })
  async sendCollaboratorInvite(event: InviteEvents.InviteContributor) {
    return await this.emailService.sendCollaboratorInvite(
      event.email,
      event.postTitle,
      event.authorUsername,
      event.inviteLink,
      event.declineLink,
      event.role,
    );
  }

  @OnEvent(EVENTS.INVITATION_ACCEPTED, { async: true })
  async invitationAccepted(event: InviteEvents.InvitationUpdate) {
    return await this.emailService.invitationAccepted(
      event.email,
      event.role,
      event.collaboratorUsername,
      event.postTitle,
      event.postUrl,
      event.collaboratorEmail,
    );
  }

  @OnEvent(EVENTS.INVITATION_DECLINED, { async: true })
  async invitationDecleined(event: InviteEvents.InvitationUpdate) {
    return await this.emailService.invitationDeclined(
      event.email,
      event.role,
      event.collaboratorUsername,
      event.postTitle,
      event.postUrl,
      event.collaboratorEmail,
    );
  }
}
