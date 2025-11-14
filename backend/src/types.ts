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
}

export interface SendEmailRequest {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
  templateId?: number;
  variables?: Record<string, string>;
}

export interface EmailSearchParams {
  recipient?: string;
  subject?: string;
  status?: 'sent' | 'failed' | 'pending';
  sender?: string;
  dateFrom?: string;
  dateTo?: string;
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

export interface Template {
  id?: number;
  name: string;
  subject: string;
  body_text?: string;
  body_html?: string;
  variables?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateTemplateRequest {
  name: string;
  subject: string;
  text?: string;
  html?: string;
  variables?: string[];
}

export interface UpdateTemplateRequest {
  name?: string;
  subject?: string;
  text?: string;
  html?: string;
  variables?: string[];
}

export interface TemplateListResponse {
  templates: Template[];
  total: number;
}
