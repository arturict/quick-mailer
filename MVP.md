# 📧 Quick Mailer - MVP Plan

> **Simple transactional email sender with history tracking**

Local-only web app for sending emails via Resend/Postal with history tracking. No auth needed (VPN-protected).

---

## 🎯 Core Concept

**What:** Dead-simple email sender with history  
**Who:** Solo use (VPN-protected, local deployment)  
**Why:** Quick transactional emails + keeping track of what was sent  
**How:** Web UI → Resend/Postal API → Send & Store

---

## ✨ MVP Features

### 🚀 Must-Have Features:

- [x] **Email Composer**
  - From address selector (dropdown with configured addresses)
  - To address (single recipient)
  - Subject line
  - Message body (textarea, plain text + HTML support)
  - Send button

- [x] **Email History**
  - List of sent emails (latest first)
  - Display: Date/Time, From, To, Subject, Status
  - Click to view full email content
  - Pagination (50 per page)

- [x] **Configuration**
  - Environment variables for SMTP/API credentials
  - List of allowed "From" addresses
  - Default sender name

### 🎨 Nice-to-Have (if time):

- [ ] **Email Templates**
  - 2-3 predefined templates
  - Template variables: `{{name}}`, `{{link}}`, etc.

---

## 🏗️ Technical Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + DaisyUI
- **Backend:** Bun + Hono (lightweight API)
- **Database:** SQLite (local, simple)
- **Email:** Resend API
- **Deployment:** Docker

---

## 🗄️ Database Schema

```sql
CREATE TABLE emails (
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
);
```

---

## 🔌 API Endpoints

```
POST   /api/emails      - Send email
GET    /api/emails      - Get email history
GET    /api/emails/:id  - Get single email
```

---

## ⚙️ Configuration

```bash
RESEND_API_KEY=re_xxxxx
FROM_ADDRESSES=noreply@domain.com,support@domain.com
DEFAULT_SENDER_NAME=Quick Mailer
PORT=3000
```

---

## 🚀 Development Timeline

**Total: 3-4 hours**

- Hour 1: Backend (Bun + Hono + SQLite)
- Hour 2: Frontend (React + Components)
- Hour 3: Integration + Polish
- Hour 4: Docker + Testing

---

## ✅ Success Criteria

- Can send email with custom From/To/Subject/Body
- Emails stored in SQLite
- Can view sent emails
- Docker deployment works
- Total time: < 4 hours

---

**Status:** 🚧 Ready to Build  
**Next:** Setup project structure
