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
<<<<<<< HEAD
  attachments?: AttachmentData[];
=======
>>>>>>> origin/master
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

  async getEmails(page: number = 1, perPage: number = 50): Promise<EmailListResponse> {
    const response = await fetch(`${API_BASE_URL}/emails?page=${page}&perPage=${perPage}`);
    
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
