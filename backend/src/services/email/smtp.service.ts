import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { IEmailService, SendEmailParams, SendEmailResult } from './types';

export class SMTPService implements IEmailService {
  private transporter: Transporter;

  constructor(config: {
    host: string;
    port: number;
    secure: boolean;
    auth: {
      user: string;
      pass: string;
    };
  }) {
    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    });
  }

  async send(params: SendEmailParams): Promise<SendEmailResult> {
    try {
      const emailData: any = {
        from: params.from,
        to: params.to,
        subject: params.subject,
        text: params.text,
        html: params.html,
      };

      // Add attachments if present
      if (params.attachments && params.attachments.length > 0) {
        emailData.attachments = params.attachments.map(att => ({
          filename: att.filename,
          content: att.content,
          ...(att.contentType && { contentType: att.contentType })
        }));
      }

      const info = await this.transporter.sendMail(emailData);

      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      return {
        success: false,
        messageId: '',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async verify(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('SMTP verification failed:', error);
      return false;
    }
  }
}
