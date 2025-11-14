import { Hono } from 'hono';
import { Resend } from 'resend';
import { saveEmail, getEmails, getTotalEmailsCount, getEmailById } from '../db';
import { SendEmailRequest, EmailListResponse } from '../types';

const emails = new Hono();
const resend = new Resend(process.env.RESEND_API_KEY);

emails.post('/', async (c) => {
  try {
    const body = await c.req.json<SendEmailRequest>();

    if (!body.from || !body.to || !body.subject) {
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

    const { data, error } = await resend.emails.send({
      from: body.from,
      to: [body.to],
      subject: body.subject,
      text: body.text,
      html: body.html,
    });

    const emailId = saveEmail({
      from_address: body.from,
      to_address: body.to,
      subject: body.subject,
      body_text: body.text,
      body_html: body.html,
      status: error ? 'failed' : 'sent',
      email_id: data?.id,
      error_message: error ? JSON.stringify(error) : undefined,
    });

    if (error) {
      console.error('❌ Failed to send email:', error);
      return c.json({ 
        error: 'Failed to send email', 
        details: error,
        savedId: emailId 
      }, 500);
    }

    console.log('✅ Email sent:', data?.id);
    return c.json({ 
      success: true, 
      id: emailId,
      emailId: data?.id 
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

    const offset = (page - 1) * perPage;
    const emailsList = getEmails(perPage, offset);
    const total = getTotalEmailsCount();
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
