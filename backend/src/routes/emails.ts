import { Hono } from 'hono';
import { saveEmail, getEmails, getTotalEmailsCount, getEmailById, getTemplateById } from '../db';
<<<<<<< HEAD
import type { SendEmailRequest, EmailListResponse, EmailSearchParams } from '../types';
=======
import { SendEmailRequest, EmailListResponse } from '../types';
>>>>>>> origin/master
import { EmailServiceFactory } from '../services/email';
import { substituteVariables } from '../utils/template';

const emails = new Hono();
const emailService = EmailServiceFactory.create();

// Verify email service on startup
emailService.verify().then((isValid) => {
  if (isValid) {
    console.log('✅ Email service verified and ready');
  } else {
    console.warn('⚠️  Email service verification failed - emails may not send');
  }
});

emails.post('/', async (c) => {
  try {
    const body = await c.req.json<SendEmailRequest>();

    let subject = body.subject;
    let text = body.text;
    let html = body.html;

    // If templateId is provided, load template and substitute variables
    if (body.templateId) {
      const template = getTemplateById(body.templateId);
      
      if (!template) {
        return c.json({ error: 'Template not found' }, 404);
      }

      const vars = body.variables || {};
      
      subject = substituteVariables(template.subject, vars);
      text = template.body_text ? substituteVariables(template.body_text, vars) : undefined;
      html = template.body_html ? substituteVariables(template.body_html, vars) : undefined;
    }

    if (!body.from || !body.to || !subject) {
      return c.json({ error: 'Missing required fields: from, to, subject' }, 400);
    }

    const allowedAddresses = (process.env.FROM_ADDRESSES || '').split(',').map(a => a.trim());
    const fromEmail = body.from.match(/<(.+?)>|(.+)/)?.[1] || body.from;
    
    if (!allowedAddresses.includes(fromEmail)) {
      return c.json({ 
        error: 'From address not allowed',
        allowedAddresses 
      }, 403);
    }

    const result = await emailService.send({
      from: body.from,
      to: body.to,
      subject,
      text,
      html,
    });

    const emailId = saveEmail({
      from_address: body.from,
      to_address: body.to,
      subject,
      body_text: text,
      body_html: html,
      status: result.success ? 'sent' : 'failed',
      email_id: result.messageId,
      error_message: result.error,
    });

    if (!result.success) {
      console.error('❌ Failed to send email:', result.error);
      return c.json({ 
        error: 'Failed to send email', 
        details: result.error,
        savedId: emailId 
      }, 500);
    }

    console.log('✅ Email sent:', result.messageId);
    return c.json({ 
      success: true, 
      id: emailId,
      emailId: result.messageId
    }, 201);

  } catch (error) {
    console.error('❌ Error sending email:', error);
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

emails.get('/', async (c) => {
  try {
    const page = parseInt(c.req.query('page') || '1');
    const perPage = parseInt(c.req.query('perPage') || '50');
    
    if (page < 1 || perPage < 1 || perPage > 100) {
      return c.json({ error: 'Invalid pagination parameters' }, 400);
    }

    // Extract search parameters
    const searchParams: EmailSearchParams = {
      recipient: c.req.query('recipient') || undefined,
      subject: c.req.query('subject') || undefined,
      status: c.req.query('status') as 'sent' | 'failed' | 'pending' | undefined,
      sender: c.req.query('sender') || undefined,
      dateFrom: c.req.query('dateFrom') || undefined,
      dateTo: c.req.query('dateTo') || undefined,
    };

    const offset = (page - 1) * perPage;
    const emailsList = getEmails(perPage, offset, searchParams);
    const total = getTotalEmailsCount(searchParams);
    const totalPages = Math.ceil(total / perPage);

    const response: EmailListResponse = {
      emails: emailsList,
      total,
      page,
      perPage,
      totalPages,
    };

    return c.json(response);
  } catch (error) {
    console.error('❌ Error fetching emails:', error);
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

emails.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      return c.json({ error: 'Invalid email ID' }, 400);
    }

    const email = getEmailById(id);

    if (!email) {
      return c.json({ error: 'Email not found' }, 404);
    }

    return c.json(email);
  } catch (error) {
    console.error('❌ Error fetching email:', error);
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default emails;
