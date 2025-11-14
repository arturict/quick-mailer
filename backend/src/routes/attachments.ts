import { Hono } from 'hono';
import { getAttachmentById } from '../db';

const attachments = new Hono();

// Get attachment by ID
attachments.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      return c.json({ error: 'Invalid attachment ID' }, 400);
    }

    const attachment = getAttachmentById(id) as any;

    if (!attachment) {
      return c.json({ error: 'Attachment not found' }, 404);
    }

    // Return the file with appropriate headers
    return new Response(attachment.file_data, {
      headers: {
        'Content-Type': attachment.mime_type,
        'Content-Disposition': `attachment; filename="${attachment.original_filename}"`,
        'Content-Length': attachment.size.toString(),
      },
    });
  } catch (error) {
    console.error('❌ Error fetching attachment:', error);
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default attachments;
