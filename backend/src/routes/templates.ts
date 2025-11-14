import { Hono } from 'hono';
import { 
  saveTemplate, 
  getTemplates, 
  getTemplateById, 
  updateTemplateById,
  deleteTemplateById 
} from '../db';
import { CreateTemplateRequest, UpdateTemplateRequest, TemplateListResponse } from '../types';

const templates = new Hono();

// Create template
templates.post('/', async (c) => {
  try {
    const body = await c.req.json<CreateTemplateRequest>();

    if (!body.name || !body.subject) {
      return c.json({ error: 'Missing required fields: name, subject' }, 400);
    }

    const variables = body.variables ? JSON.stringify(body.variables) : null;

    const templateId = saveTemplate({
      name: body.name,
      subject: body.subject,
      body_text: body.text,
      body_html: body.html,
      variables,
    });

    console.log('✅ Template created:', templateId);
    return c.json({ 
      success: true, 
      id: templateId 
    }, 201);

  } catch (error) {
    console.error('❌ Error creating template:', error);
    
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Template name already exists' }, 409);
    }
    
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get all templates
templates.get('/', async (c) => {
  try {
    const templateList = getTemplates();
    
    // Parse variables from JSON string
    const templatesWithParsedVars = templateList.map(t => ({
      ...t,
      variables: t.variables ? JSON.parse(t.variables) : []
    }));

    const response: TemplateListResponse = {
      templates: templatesWithParsedVars,
      total: templatesWithParsedVars.length,
    };

    return c.json(response);
  } catch (error) {
    console.error('❌ Error fetching templates:', error);
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Get template by ID
templates.get('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      return c.json({ error: 'Invalid template ID' }, 400);
    }

    const template = getTemplateById(id);

    if (!template) {
      return c.json({ error: 'Template not found' }, 404);
    }

    // Parse variables from JSON string
    const templateWithParsedVars = {
      ...template,
      variables: template.variables ? JSON.parse(template.variables) : []
    };

    return c.json(templateWithParsedVars);
  } catch (error) {
    console.error('❌ Error fetching template:', error);
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Update template
templates.put('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      return c.json({ error: 'Invalid template ID' }, 400);
    }

    const body = await c.req.json<UpdateTemplateRequest>();
    
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.subject !== undefined) updateData.subject = body.subject;
    if (body.text !== undefined) updateData.body_text = body.text;
    if (body.html !== undefined) updateData.body_html = body.html;
    if (body.variables !== undefined) updateData.variables = JSON.stringify(body.variables);

    const updated = updateTemplateById(id, updateData);

    if (!updated) {
      return c.json({ error: 'Template not found' }, 404);
    }

    console.log('✅ Template updated:', id);
    return c.json({ success: true });

  } catch (error) {
    console.error('❌ Error updating template:', error);
    
    if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Template name already exists' }, 409);
    }
    
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Delete template
templates.delete('/:id', async (c) => {
  try {
    const id = parseInt(c.req.param('id'));
    
    if (isNaN(id)) {
      return c.json({ error: 'Invalid template ID' }, 400);
    }

    const deleted = deleteTemplateById(id);

    if (!deleted) {
      return c.json({ error: 'Template not found' }, 404);
    }

    console.log('✅ Template deleted:', id);
    return c.json({ success: true });

  } catch (error) {
    console.error('❌ Error deleting template:', error);
    return c.json({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

export default templates;
