# 📧 Quick Mailer

> Simple transactional email sender with history tracking

Local-only web app for sending emails via Resend/Postal. No authentication needed (VPN-protected).

## ✨ Features

- **Email Composer** - Send emails with custom From/To/Subject/Body
- **From Address Selector** - Choose from configured sender addresses
- **Email History** - Track all sent emails with full details
- **Templates** - Pre-defined email templates (optional)
- **SQLite Database** - Lightweight local storage
- **Docker Deployment** - Easy local setup

## 🚀 Quick Start

```bash
# Clone the repository
git clone <repo-url>
cd quick-mailer

# Configure environment
cp .env.example .env
# Edit .env with your Resend API key

# Run with Docker
docker-compose up -d

# Access the app
open http://localhost:3000
```

## 🛠️ Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + DaisyUI
- **Backend:** Bun + Hono (lightweight API)
- **Database:** SQLite
- **Email:** Resend API
- **Deploy:** Docker

## 📋 Development

See [MVP.md](./MVP.md) for the complete development plan.

**Status:** 🚧 In Development

## 📝 License

MIT
