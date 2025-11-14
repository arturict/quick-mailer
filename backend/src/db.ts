import { Database } from 'bun:sqlite';
import type { Email, EmailSearchParams, Template } from './types';

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

db.run(`CREATE INDEX IF NOT EXISTS idx_created_at ON emails(created_at DESC)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_status ON emails(status)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_to_address ON emails(to_address)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_from_address ON emails(from_address)`);
db.run(`CREATE INDEX IF NOT EXISTS idx_subject ON emails(subject)`);

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

// Attachments table
db.run(`
  CREATE TABLE IF NOT EXISTS attachments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email_id INTEGER NOT NULL,
    filename TEXT NOT NULL,
    original_filename TEXT NOT NULL,
    mime_type TEXT NOT NULL,
    size INTEGER NOT NULL,
    file_data BLOB NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (email_id) REFERENCES emails (id) ON DELETE CASCADE
  )
`);

db.run(`CREATE INDEX IF NOT EXISTS idx_attachment_email_id ON attachments(email_id)`);

export const insertEmail = db.prepare(`
  INSERT INTO emails (from_address, to_address, subject, body_text, body_html, status, email_id, error_message)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

export const selectEmailById = db.prepare(`
  SELECT * FROM emails WHERE id = ?
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

function buildWhereClause(searchParams: EmailSearchParams): { clause: string; params: any[] } {
  const conditions: string[] = [];
  const params: any[] = [];

  if (searchParams.recipient) {
    conditions.push('to_address LIKE ?');
    params.push(`%${searchParams.recipient}%`);
  }

  if (searchParams.subject) {
    conditions.push('subject LIKE ?');
    params.push(`%${searchParams.subject}%`);
  }

  if (searchParams.status) {
    conditions.push('status = ?');
    params.push(searchParams.status);
  }

  if (searchParams.sender) {
    conditions.push('from_address LIKE ?');
    params.push(`%${searchParams.sender}%`);
  }

  if (searchParams.dateFrom) {
    conditions.push('created_at >= ?');
    params.push(searchParams.dateFrom);
  }

  if (searchParams.dateTo) {
    conditions.push('created_at <= ?');
    params.push(searchParams.dateTo);
  }

  const clause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';
  return { clause, params };
}

export function getEmails(limit: number, offset: number, searchParams: EmailSearchParams = {}): Email[] {
  const { clause, params } = buildWhereClause(searchParams);
  const query = `
    SELECT * FROM emails
    ${clause}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  const stmt = db.prepare(query);
  return stmt.all(...params, limit, offset) as Email[];
}

export function getTotalEmailsCount(searchParams: EmailSearchParams = {}): number {
  const { clause, params } = buildWhereClause(searchParams);
  const query = `SELECT COUNT(*) as count FROM emails ${clause}`;
  const stmt = db.prepare(query);
  const result = stmt.get(...params) as { count: number };
  return result.count;
}

export function getEmailById(id: number): Email | undefined {
  return selectEmailById.get(id) as Email | undefined;
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

// Attachment operations
export const insertAttachment = db.prepare(`
  INSERT INTO attachments (email_id, filename, original_filename, mime_type, size, file_data)
  VALUES (?, ?, ?, ?, ?, ?)
`);

export const selectAttachmentsByEmailId = db.prepare(`
  SELECT id, email_id, filename, original_filename, mime_type, size, created_at 
  FROM attachments 
  WHERE email_id = ?
`);

export const selectAttachmentById = db.prepare(`
  SELECT * FROM attachments WHERE id = ?
`);

export function saveAttachment(attachment: {
  email_id: number;
  filename: string;
  original_filename: string;
  mime_type: string;
  size: number;
  file_data: Buffer;
}) {
  const result = insertAttachment.run(
    attachment.email_id,
    attachment.filename,
    attachment.original_filename,
    attachment.mime_type,
    attachment.size,
    attachment.file_data
  );
  return result.lastInsertRowid;
}

export function getAttachmentsByEmailId(emailId: number) {
  return selectAttachmentsByEmailId.all(emailId);
}

export function getAttachmentById(id: number) {
  return selectAttachmentById.get(id);
}

console.log('✅ Database initialized:', dbPath);
