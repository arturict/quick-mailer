import { Hono } from 'hono';
import { saveEmail, getEmails, getTotalEmailsCount, getEmailById, saveAttachment, getAttachmentsByEmailId } from '../db';
import { SendEmailRequest, EmailListResponse } from '../types';
import { EmailServiceFactory } from '../services/email';

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

    if (!body.from || !body.to || !body.subject) {
      return c.json({ error: 'Missing required fields: from, to, subject' }, 400);
    }

    // Validate attachments size (max 10MB per file)
    if (body.attachments && body.attachments.length > 0) {
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
      for (const attachment of body.attachments) {
        // Estimate size from base64 content
        const estimatedSize = Math.ceil((attachment.content.length * 3) / 4);
        if (estimatedSize > MAX_FILE_SIZE) {
          return c.json({ 
            error: `Attachment ${attachment.filename} exceeds 10MB size limit` 
          }, 400);
        }
      }
    }

    const allowedAddresses = (process.env.FROM_ADDRESSES || '').split(',').map(a => a.trim());
    const fromEmail = body.from.match(/<(.+?)>|(.+)/)?.[1] || body.from;
    
    if (!allowedAddresses.includes(fromEmail)) {
      return c.json({ 
        error: 'From address not allowed',
        allowedAddresses 
      }, 403);
    }

    // Prepare attachments for email service
    const attachmentsForService = body.attachments?.map(att => ({
      filename: att.filename,
      content: att.content,
      contentType: att.contentType,
    }));

    const result = await emailService.send({
      from: body.from,
      to: body.to,
      subject: body.subject,
      text: body.text,
      html: body.html,
      attachments: attachmentsForService,
    });

    const emailId = saveEmail({
      from_address: body.from,
      to_address: body.to,
      subject: body.subject,
      body_text: body.text,
      body_html: body.html,
      status: result.success ? 'sent' : 'failed',
      email_id: result.messageId,
      error_message: result.error,
    });

    // Save attachments metadata to database
    if (result.success && body.attachments && body.attachments.length > 0) {
      for (const attachment of body.attachments) {
        // Estimate size from base64 content
        const size = Math.ceil((attachment.content.length * 3) / 4);
        saveAttachment({
          email_id: Number(emailId),
          filename: attachment.filename,
          content_type: attachment.contentType,
          size: size,
          file_path: '', // We're not storing files on disk, just metadata
        });
      }
    }

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

    // Fetch attachments for this email
    const attachments = getAttachmentsByEmailId(id);
    const emailWithAttachments = {
      ...email,
      attachments: attachments,
    };

    return c.json(emailWithAttachments);
  } catch (error) {
    console.error('❌ Error fetching email:', error);
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default emails;
