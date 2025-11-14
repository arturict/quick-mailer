export type EmailProvider = 'resend' | 'smtp';

export interface AttachmentParams {
  filename: string;
  content: string | Buffer; // base64 string or Buffer
  contentType?: string;
}

export interface SendEmailParams {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: AttachmentParams[];
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
