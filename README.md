# 📧 Quick Mailer

> Simple transactional email sender with history tracking

Local-only web app for sending emails via Resend with full history tracking. Perfect for VPN-protected deployments.

[![GitHub](https://img.shields.io/github/license/arturict/quick-mailer)](https://github.com/arturict/quick-mailer)
[![Docker](https://img.shields.io/badge/docker-ready-blue)](https://www.docker.com/)

## ✨ Features

- 📤 **Email Composer** - Send emails with custom From/To/Subject/Body
- 📋 **From Address Selector** - Choose from configured sender addresses
- 📝 **Email Templates** - Create and manage reusable templates with variable substitution
- 📜 **Email History** - Track all sent emails with full details and pagination
- 🎨 **HTML & Plain Text** - Support for both HTML and plain text emails
- 💾 **SQLite Database** - Lightweight local storage with WAL mode
- 📧 **Multiple Email Providers** - Support for Resend API and any SMTP server
- 🐳 **Docker Deployment** - Production-ready containerization
- ⚡ **Fast & Modern** - Built with Bun, Hono, React 19, Vite, and Tailwind CSS
- ⌨️ **Keyboard Shortcuts** - Efficient navigation with keyboard shortcuts
- 🎨 **Modern Design System** - Toast notifications, loading states, animations, and accessibility features

### Supported Email Providers

- ✅ **Resend API** (default) - Modern email API
- ✅ **SMTP Servers** - Any generic SMTP server
  - Gmail
  - Outlook/Office365
  - Yahoo Mail
  - SendGrid
  - Mailgun
  - Amazon SES
  - Postal (self-hosted)
  - Custom SMTP servers

## 🚀 Quick Start

### Using Docker (Recommended)

```bash
# Clone the repository
git clone https://github.com/arturict/quick-mailer.git
cd quick-mailer

# Configure environment
cp .env.example .env
# Edit .env with your Resend API key

# Run with Docker
docker-compose up -d

# Access the app
open http://localhost:3000
```

### Manual Development Setup

**Backend (Bun + Hono)**
```bash
cd backend
bun install
bun run dev  # Runs on http://localhost:3000
```

**Frontend (React + Vite)**
```bash
cd frontend
npm install
npm run dev  # Runs on http://localhost:5173
```

## 🛠️ Tech Stack

### Backend
- **Runtime:** [Bun](https://bun.sh) - Fast all-in-one JavaScript runtime
- **Framework:** [Hono](https://hono.dev) - Ultrafast web framework
- **Database:** SQLite (via bun:sqlite)
- **Email:** [Resend](https://resend.com) API

### Frontend
- **Framework:** React 19 + TypeScript
- **Build Tool:** Vite 7
- **Styling:** Tailwind CSS 4 + DaisyUI
- **State:** React Hooks

### DevOps
- **Container:** Docker + Docker Compose
- **Deployment:** Single container deployment

## ⚙️ Configuration

Create a `.env` file in the root directory:

### Option 1: Using Resend API (Default)

```env
# Email Provider
EMAIL_PROVIDER=resend

# Resend API Configuration
RESEND_API_KEY=re_your_api_key_here

# From Addresses - comma-separated list (Required)
FROM_ADDRESSES=noreply@yourdomain.com,support@yourdomain.com

# Optional Configuration
DEFAULT_SENDER_NAME=Quick Mailer
PORT=3000
DATABASE_PATH=./data/emails.db
```

### Option 2: Using SMTP Server

```env
# Email Provider
EMAIL_PROVIDER=smtp

# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# From Addresses
FROM_ADDRESSES=your-email@gmail.com

# Optional Configuration
DEFAULT_SENDER_NAME=Quick Mailer
PORT=3000
DATABASE_PATH=./data/emails.db
```

### Getting Started

**Resend API:**
1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Create an API key
4. Add it to your `.env` file

**SMTP Server:**
1. Get SMTP credentials from your email provider
2. For Gmail: Use [App Password](https://support.google.com/accounts/answer/185833)
3. Configure SMTP settings in `.env`
4. See [SMTP Guide](docs/SMTP.md) for provider-specific configs

## 📝 Using Email Templates

Email templates allow you to create reusable email content with variable substitution.

### Creating a Template

1. Navigate to the **Templates** tab in the web UI
2. Click **New Template**
3. Fill in the template details:
   - **Name**: A descriptive name for the template
   - **Subject**: Email subject with variables like `{{name}}`
   - **Message**: Email body with variables like `{{link}}`, `{{date}}`, etc.
4. The editor automatically detects variables and shows them in the preview
5. Fill in sample values to preview how the email will look
6. Click **Create Template** to save

### Using a Template

1. Go to the **Compose** tab
2. Select a template from the **Use Template** dropdown
3. Fill in the required variables
4. The email will be sent with variables substituted

### Variable Syntax

Use mustache-style syntax for variables: `{{variableName}}`

**Example:**
```
Subject: Welcome {{name}}!
Body: Hello {{name}}, click here to verify: {{verificationLink}}
```

When sending, provide values:
```json
{
  "name": "John Doe",
  "verificationLink": "https://example.com/verify/abc123"
}
```

## ⌨️ Keyboard Shortcuts

Quick Mailer supports keyboard shortcuts for efficient navigation:

| Shortcut | Action |
|----------|--------|
| `Ctrl+C` | Go to Compose tab |
| `Ctrl+T` | Go to Templates tab |
| `Ctrl+H` | Go to History tab |
| `Ctrl+Enter` | Send email (in compose view) |
| `Shift+?` | Show/Hide keyboard shortcuts modal |

> **Note:** On macOS, use `⌘` (Cmd) instead of `Ctrl`

## 📋 API Endpoints

### Emails
```
POST   /api/emails      - Send email (supports template-based sending)
GET    /api/emails      - Get email history (paginated)
GET    /api/emails/:id  - Get single email details
```

### Templates
```
POST   /api/templates     - Create a new template
GET    /api/templates     - Get all templates
GET    /api/templates/:id - Get single template
PUT    /api/templates/:id - Update template
DELETE /api/templates/:id - Delete template
```

### Health
```
GET    /health          - Health check
```

## 🗄️ Database Schema

### Emails Table
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

### Templates Table
```sql
CREATE TABLE templates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  subject TEXT NOT NULL,
  body_text TEXT,
  body_html TEXT,
  variables TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

## 🐳 Docker Deployment

The application uses a multi-stage Docker build:

1. **Backend Builder:** Compiles Bun application
2. **Frontend Builder:** Builds React app with Vite
3. **Production:** Slim Bun runtime serving both API and static files

### Docker Commands

```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

## 📊 Development Timeline

- ✅ **Hour 1:** Backend (Bun + Hono + SQLite)
- ✅ **Hour 2:** Frontend (React + Components)
- ✅ **Hour 3:** Integration + Polish
- ✅ **Hour 4:** Docker + Documentation

**Total:** ~4 hours (MVP Complete)

## 🔒 Security Notes

- This application is designed for **local/VPN-protected deployments**
- No authentication is implemented
- Recommended to run behind a VPN or firewall
- CORS is enabled for development (configure for production)

## 🎨 Design System

Quick Mailer includes a comprehensive modern design system with:

- **Toast Notifications** - Success, error, info, and warning notifications with ARIA support
- **Empty States** - User-friendly messages when there's no content
- **Loading Skeletons** - Improved perceived performance
- **Error Boundary** - Graceful error handling with fallback UI
- **Offline Detection** - Network status indicator
- **Accessibility** - WCAG 2.1 AA compliant with keyboard navigation and screen reader support

For detailed documentation, see [Design System Guide](frontend/DESIGN_SYSTEM.md).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🔗 Links

- [Resend Documentation](https://resend.com/docs)
- [Hono Documentation](https://hono.dev)
- [Bun Documentation](https://bun.sh/docs)
- [React Documentation](https://react.dev)

## 🎯 Roadmap

- [x] **SMTP Support** - Generic SMTP server support
- [x] **Email Templates** - Templates with variable substitution
- [ ] Bulk email sending
- [ ] Email scheduling
- [ ] Attachment support
- [ ] Search and filtering
- [ ] Export email history
- [ ] API authentication
- [ ] Multiple provider support (Postal, SendGrid)

---

**Built with ❤️ using modern web technologies**
