import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { corsMiddleware } from './middleware/cors';
import emailRoutes from './routes/emails';
import templateRoutes from './routes/templates';
import { checkDatabaseHealth } from './db';
import './db';

const app = new Hono();

app.use('*', corsMiddleware);

// Enhanced health check with detailed status
app.get('/health', (c) => {
  const dbHealth = checkDatabaseHealth();
  
  // Check if email provider is configured
  const emailProvider = process.env.EMAIL_PROVIDER || 'resend';
  let emailProviderStatus = 'not_configured';
  
  if (emailProvider === 'resend' && process.env.RESEND_API_KEY) {
    emailProviderStatus = 'configured';
  } else if (emailProvider === 'smtp' && process.env.SMTP_HOST && process.env.SMTP_USER) {
    emailProviderStatus = 'configured';
  }
  
  const fromAddresses = process.env.FROM_ADDRESSES?.split(',').filter(a => a.trim()) || [];
  
  const overallHealth = dbHealth.status === 'healthy' && 
                        emailProviderStatus === 'configured' &&
                        fromAddresses.length > 0;
  
  const response = {
    status: overallHealth ? 'healthy' : 'degraded',
    service: 'quick-mailer-api',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    checks: {
      database: {
        status: dbHealth.status,
        error: dbHealth.error
      },
      emailProvider: {
        status: emailProviderStatus,
        provider: emailProvider,
        configured: emailProviderStatus === 'configured'
      },
      fromAddresses: {
        status: fromAddresses.length > 0 ? 'configured' : 'not_configured',
        count: fromAddresses.length
      }
    }
  };
  
  // Return 503 if not healthy, 200 otherwise
  return c.json(response, overallHealth ? 200 : 503);
});

app.route('/api/emails', emailRoutes);
app.route('/api/templates', templateRoutes);

app.use('/*', serveStatic({ root: './public' }));
app.use('/*', serveStatic({ path: './public/index.html' }));

app.notFound((c) => {
  return c.json({ error: 'Not found' }, 404);
});

app.onError((err, c) => {
  console.error('❌ Server error:', err);
  return c.json({ 
    error: 'Internal server error',
    message: err.message 
  }, 500);
});

const port = parseInt(process.env.PORT || '3000');

console.log(`🚀 Quick Mailer API starting...`);
console.log(`📧 Resend API Key: ${process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing'}`);
console.log(`✉️  From Addresses: ${process.env.FROM_ADDRESSES || 'Not configured'}`);

export default {
  port,
  fetch: app.fetch,
};

console.log(`🎯 Server running on http://localhost:${port}`);
