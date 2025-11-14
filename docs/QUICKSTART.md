# 🚀 Quick Start Guide

Get Quick Mailer running in 5 minutes!

## Prerequisites

- Docker & Docker Compose **OR** Bun + Node.js
- Resend API key (get one at [resend.com](https://resend.com))

---

## Option 1: Docker (Recommended) 🐳

### 1. Clone the repository
```bash
git clone https://github.com/arturict/quick-mailer.git
cd quick-mailer
```

### 2. Configure environment
```bash
cp .env.example .env
nano .env  # or use your favorite editor
```

**Required settings:**
```env
RESEND_API_KEY=re_your_actual_api_key_here
FROM_ADDRESSES=noreply@yourdomain.com,support@yourdomain.com
```

### 3. Build and run
```bash
docker-compose up --build -d
```

### 4. Access the app
Open your browser: http://localhost:3000

### 5. Send your first email!
- Select a "From" address
- Enter recipient email
- Write subject and message
- Click "Send Email"
- Check the history below!

---

## Option 2: Local Development 💻

### Backend Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
bun install

# 3. Set environment variables
export RESEND_API_KEY=re_your_key
export FROM_ADDRESSES=noreply@example.com
export PORT=3000

# 4. Run backend
bun run dev
```

Backend runs on: http://localhost:3000

### Frontend Setup (in a new terminal)

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install dependencies
npm install

# 3. Set environment variables
export VITE_API_URL=/api
export VITE_FROM_ADDRESSES=noreply@example.com

# 4. Run frontend
npm run dev
```

Frontend runs on: http://localhost:5173

---

## Verify Installation ✓

### 1. Check Backend Health
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "status": "ok",
  "service": "quick-mailer-api",
  "version": "1.0.0",
  "timestamp": "2025-..."
}
```

### 2. Test Email Sending

```bash
curl -X POST http://localhost:3000/api/emails \
  -H "Content-Type: application/json" \
  -d '{
    "from": "noreply@example.com",
    "to": "test@example.com",
    "subject": "Test Email",
    "text": "Hello from Quick Mailer!"
  }'
```

Expected response:
```json
{
  "success": true,
  "id": 1,
  "emailId": "..."
}
```

### 3. View Email History
```bash
curl http://localhost:3000/api/emails
```

---

## Configuration Guide ⚙️

### Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `RESEND_API_KEY` | Yes | - | Your Resend API key |
| `FROM_ADDRESSES` | Yes | - | Comma-separated allowed sender emails |
| `DEFAULT_SENDER_NAME` | No | Quick Mailer | Default sender name |
| `PORT` | No | 3000 | Server port |
| `DATABASE_PATH` | No | ./data/emails.db | SQLite database location |

### Getting a Resend API Key

1. Go to [resend.com](https://resend.com)
2. Sign up for free account
3. Verify your domain (or use their test domain)
4. Go to API Keys section
5. Click "Create API Key"
6. Copy the key and add to `.env`

---

## Common Issues & Solutions 🔧

### "Missing API key" error
- Make sure `RESEND_API_KEY` is set in `.env`
- Verify the key starts with `re_`
- Check that `.env` file is in the project root

### "From address not allowed" error
- Add your sender email to `FROM_ADDRESSES` in `.env`
- Multiple addresses should be comma-separated
- No spaces between addresses

### Docker build fails
```bash
# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Frontend can't connect to backend
- Check backend is running: `curl http://localhost:3000/health`
- Verify VITE_API_URL is set correctly
- Check browser console for errors

### Database locked error
- SQLite uses WAL mode which handles concurrency well
- If issues persist, restart the application
- Check file permissions on `data/` directory

---

## Next Steps 🎯

- Read the [full README](../README.md) for detailed docs
- Check [TESTING.md](TESTING.md) for testing guide
- Review [SUMMARY.md](SUMMARY.md) for architecture overview
- Browse [GitHub Issues](https://github.com/arturict/quick-mailer/issues) for planned features

---

## Quick Commands Reference

```bash
# Docker
docker-compose up -d              # Start
docker-compose logs -f            # View logs
docker-compose down               # Stop
docker-compose down -v            # Stop + remove data

# Development
cd backend && bun run dev         # Run backend
cd frontend && npm run dev        # Run frontend

# Build
cd frontend && npm run build      # Build frontend
cd backend && bun run build       # Build backend (optional)

# Database
sqlite3 backend/data/emails.db    # Access database
.schema                           # View schema
SELECT * FROM emails;             # Query emails
.quit                             # Exit
```

---

## Support & Contributing 🤝

- **Issues:** [GitHub Issues](https://github.com/arturict/quick-mailer/issues)
- **Discussions:** [GitHub Discussions](https://github.com/arturict/quick-mailer/discussions)
- **Pull Requests:** Always welcome!

---

**Happy mailing! 📧**
