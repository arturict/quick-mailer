import { Database } from 'bun:sqlite';
import { Email } from './types';

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

console.log('✅ Database initialized:', dbPath);
