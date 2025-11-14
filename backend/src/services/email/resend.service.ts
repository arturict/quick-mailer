import { Resend } from 'resend';
import type { IEmailService, SendEmailParams, SendEmailResult } from './types';

export class ResendService implements IEmailService {
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(params: SendEmailParams): Promise<SendEmailResult> {
    try {
      const emailData: any = {
        from: params.from,
        to: [params.to],
        subject: params.subject,
        text: params.text,
        html: params.html,
      };

      // Add attachments if present
      if (params.attachments && params.attachments.length > 0) {
        emailData.attachments = params.attachments.map(att => ({
          filename: att.filename,
          content: att.content,
        }));
      }

      const { data, error } = await this.client.emails.send(emailData);

      if (error) {
        return {
          success: false,
          messageId: '',
          error: JSON.stringify(error),
        };
      }

      return {
        success: true,
        messageId: data?.id || '',
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
      return !!this.client;
    } catch {
      return false;
    }
  }
}
