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
  attachments?: AttachmentMetadata[];
}

export interface AttachmentMetadata {
  id: number;
  email_id: number;
  filename: string;
  original_filename: string;
  mime_type: string;
  size: number;
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
  templateId?: number;
  variables?: Record<string, string>;
}

export interface EmailListResponse {
  emails: Email[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface Template {
  id?: number;
  name: string;
  subject: string;
  body_text?: string;
  body_html?: string;
  variables?: string[];
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

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const emailApi = {
  async sendEmail(request: SendEmailRequest, attachments?: File[]): Promise<{ success: boolean; id: number; emailId: string }> {
    // If there are attachments, use FormData
    if (attachments && attachments.length > 0) {
      const formData = new FormData();
      formData.append('from', request.from);
      formData.append('to', request.to);
      formData.append('subject', request.subject);
      if (request.text) formData.append('text', request.text);
      if (request.html) formData.append('html', request.html);
      if (request.templateId) formData.append('templateId', request.templateId.toString());
      if (request.variables) formData.append('variables', JSON.stringify(request.variables));
      
      // Append all attachments
      attachments.forEach(file => {
        formData.append('attachments', file);
      });

      const response = await fetch(`${API_BASE_URL}/emails`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send email');
      }

      return response.json();
    }

    // Otherwise use JSON
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

export const templateApi = {
  async createTemplate(request: CreateTemplateRequest): Promise<{ success: boolean; id: number }> {
    const response = await fetch(`${API_BASE_URL}/templates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create template');
    }

    return response.json();
  },

  async getTemplates(): Promise<TemplateListResponse> {
    const response = await fetch(`${API_BASE_URL}/templates`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch templates');
    }

    return response.json();
  },

  async getTemplate(id: number): Promise<Template> {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch template');
    }

    return response.json();
  },

  async updateTemplate(id: number, request: UpdateTemplateRequest): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update template');
    }

    return response.json();
  },

  async deleteTemplate(id: number): Promise<{ success: boolean }> {
    const response = await fetch(`${API_BASE_URL}/templates/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete template');
    }

    return response.json();
  },
};
