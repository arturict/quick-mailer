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

export interface EmailSearchParams {
  recipient?: string;
  subject?: string;
  status?: 'sent' | 'failed' | 'pending';
  sender?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface SendEmailRequest {
  from: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}

export interface EmailListResponse {
  emails: Email[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const emailApi = {
  async sendEmail(request: SendEmailRequest): Promise<{ success: boolean; id: number; emailId: string }> {
    const response = await fetch(`${API_BASE_URL}/emails`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send email');
    }

    return response.json();
  },

  async getEmails(page: number = 1, perPage: number = 50, searchParams?: EmailSearchParams): Promise<EmailListResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      perPage: perPage.toString(),
    });

    if (searchParams?.recipient) params.append('recipient', searchParams.recipient);
    if (searchParams?.subject) params.append('subject', searchParams.subject);
    if (searchParams?.status) params.append('status', searchParams.status);
    if (searchParams?.sender) params.append('sender', searchParams.sender);
    if (searchParams?.dateFrom) params.append('dateFrom', searchParams.dateFrom);
    if (searchParams?.dateTo) params.append('dateTo', searchParams.dateTo);

    const response = await fetch(`${API_BASE_URL}/emails?${params}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch emails');
    }

    return response.json();
  },

  async getEmail(id: number): Promise<Email> {
    const response = await fetch(`${API_BASE_URL}/emails/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch email');
    }

    return response.json();
  },
};
