export type EmailProvider = 'resend' | 'smtp';

export interface EmailAttachment {
  filename: string;
  content: Buffer;
  contentType: string;
}

export interface SendEmailParams {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: EmailAttachment[];
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
