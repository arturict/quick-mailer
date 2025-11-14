import { Database } from 'bun:sqlite';
import type { Email, Attachment, Template } from './types';

const dbPath = process.env.DATABASE_PATH || './data/emails.db';
export const db = new Database(dbPath);

db.run('PRAGMA journal_mode = WAL');

db.run(`
  CREATE TABLE IF NOT EXISTS emails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    subject TEXT NOT NULL,
    body_text TEXT,
    body_html TEXT,
    status TEXT NOT NULL DEFAULT 'sent',
    email_id TEXT,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`
  CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    content_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    file_path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email_id) REFERENCES emails(id) ON DELETE CASCADE
  )
`);

db.run(`CREATE INDEX IF NOT EXISTS idx_created_at ON emails(created_at DESC)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_status ON emails(status)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_attachments_email_id ON attachments(email_id)`);

// Templates table
db.run(`
  CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    body_text TEXT,
    body_html TEXT,
    variables TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`CREATE INDEX IF NOT EXISTS idx_template_name ON templates(name)`);

// Templates table
db.run(`
  CREATE TABLE IF NOT EXISTS templates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    subject TEXT NOT NULL,
    body_text TEXT,
    body_html TEXT,
    variables TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

db.run(`CREATE INDEX IF NOT EXISTS idx_template_name ON templates(name)`);

export const insertEmail = db.prepare(`
  INSERT INTO emails (from_address, to_address, subject, body_text, body_html, status, email_id, error_message)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

export const selectEmails = db.prepare(`
  SELECT * FROM emails
  ORDER BY created_at DESC
  LIMIT ? OFFSET ?
`);

export const countEmails = db.prepare(`
  SELECT COUNT(*) as count FROM emails
`);

export const selectEmailById = db.prepare(`
  SELECT * FROM emails WHERE id = ?
`);

export const insertAttachment = db.prepare(`
  INSERT INTO attachments (email_id, filename, content_type, size, file_path)
  VALUES (?, ?, ?, ?, ?)
`);

export const selectAttachmentsByEmailId = db.prepare(`
  SELECT * FROM attachments WHERE email_id = ?
`);

export function saveEmail(email: Omit<Email, 'id' | 'created_at'>) {
  const result = insertEmail.run(
    email.from_address,
    email.to_address,
    email.subject,
    email.body_text || null,
    email.body_html || null,
    email.status,
    email.email_id || null,
    email.error_message || null
  );
  return result.lastInsertRowid;
}

export function getEmails(limit: number, offset: number): Email[] {
  return selectEmails.all(limit, offset) as Email[];
}

export function getTotalEmailsCount(): number {
  const result = countEmails.get() as { count: number };
  return result.count;
}

export function getEmailById(id: number): Email | undefined {
  return selectEmailById.get(id) as Email | undefined;
}

export function saveAttachment(attachment: Omit<Attachment, 'id' | 'created_at'>) {
  const result = insertAttachment.run(
    attachment.email_id,
    attachment.filename,
    attachment.content_type,
    attachment.size,
    attachment.file_path
  );
  return result.lastInsertRowid;
}

export function getAttachmentsByEmailId(emailId: number): Attachment[] {
  return selectAttachmentsByEmailId.all(emailId) as Attachment[];
}


// Template operations
export const insertTemplate = db.prepare(`
  INSERT INTO templates (name, subject, body_text, body_html, variables)
  VALUES (?, ?, ?, ?, ?)
`);

export const selectTemplates = db.prepare(`
  SELECT * FROM templates
  ORDER BY created_at DESC
`);

export const selectTemplateById = db.prepare(`
  SELECT * FROM templates WHERE id = ?
`);

export const updateTemplate = db.prepare(`
  UPDATE templates
  SET name = ?, subject = ?, body_text = ?, body_html = ?, variables = ?, updated_at = CURRENT_TIMESTAMP
  WHERE id = ?
`);

export const deleteTemplate = db.prepare(`
  DELETE FROM templates WHERE id = ?
`);

export function saveTemplate(template: Omit<Template, 'id' | 'created_at' | 'updated_at'>) {
  const result = insertTemplate.run(
    template.name,
    template.subject,
    template.body_text || null,
    template.body_html || null,
    template.variables || null
  );
  return result.lastInsertRowid;
}

export function getTemplates(): Template[] {
  return selectTemplates.all() as Template[];
}

export function getTemplateById(id: number): Template | undefined {
  return selectTemplateById.get(id) as Template | undefined;
}

export function updateTemplateById(id: number, template: Partial<Template>) {
  const existing = getTemplateById(id);
  if (!existing) return false;

  updateTemplate.run(
    template.name !== undefined ? template.name : existing.name,
    template.subject !== undefined ? template.subject : existing.subject,
    template.body_text !== undefined ? template.body_text : existing.body_text || null,
    template.body_html !== undefined ? template.body_html : existing.body_html || null,
    template.variables !== undefined ? template.variables : existing.variables || null,
    id
  );
  return true;
}

export function deleteTemplateById(id: number): boolean {
  const result = deleteTemplate.run(id);
  return result.changes > 0;
}

console.log('✅ Database initialized:', dbPath);
