export type EmailProvider = 'resend' | 'smtp';

export interface SendEmailParams {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId: string;
  error?: string;
}

export interface IEmailService {
  send(params: SendEmailParams): Promise<SendEmailResult>;
  verify(): Promise<boolean>;
}
