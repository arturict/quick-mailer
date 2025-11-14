# 🧪 Testing Guide

## Manual Testing Checklist

### Backend API Tests

1. **Health Check**
   ```bash
   curl http://localhost:3000/health
   ```
   Expected: `{"status":"ok","service":"quick-mailer-api",...}`

2. **Send Email (Test Mode)**
   ```bash
   curl -X POST http://localhost:3000/api/emails \
     -H "Content-Type: application/json" \
     -d '{
       "from": "noreply@example.com",
       "to": "test@example.com",
       "subject": "Test Email",
       "text": "Hello World"
     }'
   ```
   Expected: `{"success":true,"id":1,"emailId":"..."}`

3. **List Emails**
   ```bash
   curl http://localhost:3000/api/emails?page=1&perPage=10
   ```
   Expected: `{"emails":[...],"total":N,"page":1,...}`

4. **Get Email by ID**
   ```bash
   curl http://localhost:3000/api/emails/1
   ```
   Expected: Email object with all fields

### Frontend UI Tests

1. **Email Composer**
   - [ ] Select from address
   - [ ] Enter recipient email
   - [ ] Enter subject
   - [ ] Enter message (plain text)
   - [ ] Toggle HTML mode
   - [ ] Enter HTML content
   - [ ] Click "Send Email"
   - [ ] Verify success message
   - [ ] Verify form clears

2. **Email History**
   - [ ] View email list
   - [ ] Check pagination controls
   - [ ] Click "View" on an email
   - [ ] Verify modal shows details
   - [ ] Close modal
   - [ ] Navigate to next page
   - [ ] Click refresh button

3. **Theme Toggle**
   - [ ] Toggle between light and dark mode
   - [ ] Verify all components update

4. **Error Handling**
   - [ ] Submit form with invalid email
   - [ ] Submit with disallowed from address
   - [ ] Verify error messages display

## Integration Testing

### Docker Deployment Test

```bash
# Build and start
docker-compose up --build -d

# Wait for startup
sleep 5

# Test health endpoint
curl http://localhost:3000/health

# Test UI
open http://localhost:3000

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Database Verification

```bash
# Enter container
docker exec -it quick-mailer_quick-mailer_1 sh

# Check database
cd /app/backend/data
sqlite3 emails.db "SELECT * FROM emails;"

# Exit
exit
```

## E2E Testing (Future)

See Issue #4 for Playwright implementation plan.

### Planned Test Coverage
- Email sending flow
- Pagination
- Modal interactions
- Form validation
- Error states
- Theme switching

## Performance Testing

### Backend Load Test
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test send endpoint
ab -n 100 -c 10 -p test-email.json -T application/json \
  http://localhost:3000/api/emails

# Test list endpoint
ab -n 1000 -c 50 http://localhost:3000/api/emails
```

### Frontend Build Performance
```bash
cd frontend
time npm run build
```
Expected: < 2 seconds

### Database Performance
- SQLite with WAL mode enabled
- Indexed on created_at and status
- Expected query time: < 10ms for 10,000 records

## CI/CD Testing (Future)

### GitHub Actions Workflow
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: oven-sh/setup-bun@v1
      - name: Install dependencies
        run: cd backend && bun install
      - name: Run tests
        run: cd backend && bun test
      - name: Build frontend
        run: cd frontend && npm ci && npm run build
```

## Security Testing

- [ ] Environment variables not exposed
- [ ] No hardcoded credentials
- [ ] CORS properly configured
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (prepared statements)
- [ ] XSS prevention (React escaping)

## Accessibility Testing

- [ ] Keyboard navigation works
- [ ] Form labels present
- [ ] ARIA attributes where needed
- [ ] Color contrast sufficient
- [ ] Screen reader compatible

---

**Last Updated:** 2025-11-14
