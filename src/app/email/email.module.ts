import { Module } from '@nestjs/common';
import axios from 'axios';
import { EmailService } from './email.service';
import { TemplateService } from './template.service';
import { EmailListener } from './email.listener';

const EmailClientProvider = {
  provide: 'API_CLIENT',
  useFactory: () => {
    return axios.create({
      baseURL: process.env['BREVO_URL'] || 'https://api.brevo.com/v3/smtp',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env['BREVO_API_KEY'],
      },
    });
  },
};

@Module({
  exports: [EmailClientProvider, EmailService],
  providers: [
    EmailClientProvider,
    EmailService,
    TemplateService,
    EmailListener,
  ],
})
export class EmailModule {}
