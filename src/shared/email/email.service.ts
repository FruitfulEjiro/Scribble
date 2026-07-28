import { Inject, Injectable, Logger } from '@nestjs/common';
import { AxiosInstance } from 'axios';
import { TemplateService } from './template.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    @Inject('API_CLIENT') private readonly email: AxiosInstance,
    private readonly templateService: TemplateService,
  ) {}

  async signupOtp(toEmail: string, otp: string) {
    return this.sendEmail(
      toEmail,
      { otp },
      'signup-otp',
      'Welcome to Scribble',
    );
  }

  async resetPassword(toEmail: string, otp: string) {
    return this.sendEmail(toEmail, { otp }, 'reset-password', 'Password Reset');
  }

  async sendCollaboratorInvite(
    email: string,
    postTitle: string,
    authorUsername: string,
    inviteLink: string,
    declineLink: string,
    role: string,
  ) {
    return this.sendEmail(
      email,
      { postTitle, authorUsername, inviteLink, declineLink, role },
      'post-invite',
      'Invitation to collaborate on Scribble',
    );
  }

  async invitationAccepted(
    email: string,
    role: string,
    collaboratorUsername: string,
    postTitle: string,
    postUrl: string,
    collaboratorEmail: string,
  ) {
    return this.sendEmail(
      email,
      {
        role,
        collaboratorUsername,
        postTitle,
        postUrl,
        collaboratorEmail,
      },
      'accepted-invitation',
      'Invitation Accepted',
    );
  }

  async invitationDeclined(
    email: string,
    role: string,
    collaboratorUsername: string,
    postTitle: string,
    postUrl: string,
    collaboratorEmail: string,
  ) {
    return this.sendEmail(
      email,
      {
        role,
        collaboratorUsername,
        postTitle,
        postUrl,
        collaboratorEmail,
      },
      'declined-invitation',
      'Invitation Declined',
    );
  }

  private async sendEmail(
    toEmail: string,
    data: Record<string, any>,
    templateName: string,
    subject: string,
  ) {
    try {
      const htmlContent = this.templateService.render(templateName, data);

      const response = await this.email.post('/email', {
        sender: {
          name: 'Scribble',
          email: process.env['BREVO_EMAIL'],
        },
        to: [{ email: toEmail }],
        subject,
        htmlContent,
      });

      this.logger.log('email sent');
      return response.data;
    } catch (error: any) {
      this.logger.error(error.response?.data || error.message);
      throw error;
    }
  }
}
