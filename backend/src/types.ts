export interface Email {
  id?: number;
  from_address: string;
  to_address: string;
  subject: string;
  body_text?: string;
  body_html?: string;
  status: 'sent' | 'failed' | 'pending';
  email_id?: string;
  error_message?: string;
  created_at?: string;
  attachments?: Attachment[];
}

export interface Attachment {
  id?: number;
  email_id: number;
  filename: string;
  content_type: string;
  size: number;
  file_path: string;
  created_at?: string;
}

export interface AttachmentData {
  filename: string;
  content: string; // base64 encoded
  contentType: string;
}

export interface SendEmailRequest {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  attachments?: AttachmentData[];
}

export interface EmailListResponse {
  emails: Email[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface Config {
  resendApiKey: string;
  fromAddresses: string[];
  defaultSenderName: string;
  port: number;
  databasePath: string;
}
