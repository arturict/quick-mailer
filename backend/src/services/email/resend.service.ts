import { Resend } from 'resend';
import { IEmailService, SendEmailParams, SendEmailResult } from './types';

export class ResendService implements IEmailService {
  private client: Resend;

  constructor(apiKey: string) {
    this.client = new Resend(apiKey);
  }

  async send(params: SendEmailParams): Promise<SendEmailResult> {
    try {
      const { data, error } = await this.client.emails.send({
        from: params.from,
        to: [params.to],
        subject: params.subject,
        text: params.text,
        html: params.html,
      });

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
