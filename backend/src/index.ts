import { Hono } from 'hono';
import { serveStatic } from 'hono/bun';
import { corsMiddleware } from './middleware/cors';
import emailRoutes from './routes/emails';
import './db';

const app = new Hono();

app.use('*', corsMiddleware);

app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    service: 'quick-mailer-api',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.route('/api/emails', emailRoutes);

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
