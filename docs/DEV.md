# Quick Mailer - Development Commands

## Backend (Bun + Hono)
```bash
cd backend
bun install
bun run dev
```

## Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```

## Docker (Production)
```bash
# Build and run
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Environment Setup
```bash
cp .env.example .env
# Edit .env with your Resend API key and settings
```
