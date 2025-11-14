import { Database } from 'bun:sqlite';
import type { Email, EmailSearchParams } from './types';

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

console.log('✅ Database initialized:', dbPath);
