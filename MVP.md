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

### 🎨 Nice-to-Have (Future):

- [ ] **Email Templates** (Issue #3)
  - 2-3 predefined templates
  - Template variables: `{{name}}`, `{{link}}`, etc.

- [ ] **Attachment Support** (Issue #2)
  - File upload
  - Multiple attachments

- [ ] **Search & Filter** (Issue #1)
  - Search by recipient
  - Filter by status/date

---

## 🏗️ Technical Stack

- **Frontend:** React 19 + TypeScript + Vite
- **Styling:** Tailwind CSS + DaisyUI
- **Backend:** Bun + Hono (lightweight API)
- **Database:** SQLite (bun:sqlite)
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
GET    /health          - Health check
```

---

## ⚙️ Configuration

```bash
RESEND_API_KEY=re_xxxxx
FROM_ADDRESSES=noreply@domain.com,support@domain.com
DEFAULT_SENDER_NAME=Quick Mailer
PORT=3000
DATABASE_PATH=./data/emails.db
```

---

## 🚀 Development Timeline

**Total: ~4 hours**

- ✅ Hour 1: Backend (Bun + Hono + SQLite)
- ✅ Hour 2: Frontend (React + Components)
- ✅ Hour 3: Integration + Polish
- ✅ Hour 4: Docker + Testing + Documentation

---

## ✅ Success Criteria

- [x] Can send email with custom From/To/Subject/Body
- [x] Emails stored in SQLite
- [x] Can view sent emails
- [x] Docker deployment works
- [x] Total time: < 4 hours

---

## 📊 Final Results

### Implemented Features
✅ Email Composer with HTML/Text support  
✅ Email History with pagination  
✅ SQLite database with WAL mode  
✅ Resend API integration  
✅ Docker multi-stage build  
✅ Comprehensive documentation  
✅ Dark/Light theme  
✅ Responsive design  

### Statistics
- **Total Development Time:** ~4 hours
- **Lines of Code:** ~1,500
- **Files Created:** 28
- **GitHub Issues:** 4 (future enhancements)
- **Build Time (Frontend):** < 1 second
- **Docker Image Size:** ~200MB

---

**Status:** ✅ **MVP COMPLETE**  
**GitHub:** https://github.com/arturict/quick-mailer  
**Next:** See [SUMMARY.md](./docs/SUMMARY.md) for roadmap

