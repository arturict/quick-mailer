import { ResendService } from './resend.service';
import { SMTPService } from './smtp.service';
import type { IEmailService, EmailProvider } from './types';

export class EmailServiceFactory {
  static create(): IEmailService {
    const provider = (process.env.EMAIL_PROVIDER || 'resend') as EmailProvider;

    console.log(`📧 Email provider: ${provider}`);

    if (provider === 'smtp') {
      const smtpConfig = {
        host: process.env.SMTP_HOST || '',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASSWORD || '',
        },
      };

      if (!smtpConfig.host || !smtpConfig.auth.user || !smtpConfig.auth.pass) {
        throw new Error('Missing SMTP configuration. Please set SMTP_HOST, SMTP_USER, and SMTP_PASSWORD');
      }

      console.log(`📨 SMTP configured: ${smtpConfig.host}:${smtpConfig.port}`);
      return new SMTPService(smtpConfig);
    }

    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error('Missing RESEND_API_KEY. Please set it in your environment variables.');
    }

    console.log('📬 Resend API configured');
    return new ResendService(apiKey);
  }
}
