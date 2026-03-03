import { loadEnvFile } from 'node:process';
import path from 'path';

// Load environment variables explicitly from root .env
try {
  loadEnvFile(path.resolve(process.cwd(), '.env'));
  console.log('✅ .env carregado com sucesso!');
} catch (e) {
  console.warn('⚠️ .env não encontrado ou erro ao carregar:', e.message);
}

import express from 'express';
import cors from 'cors';
import suggestionsHandler from './api/suggestions.js';
// suggestions_auth removed
import profileHandler from './api/profile.js';
import storiesHandler from './api/stories.js';
import postsHandler from './api/posts.js';
import trackIpHandler from './api/track-ip.js';
import checkPixHandler from './api/check-pix.js';
import sigiloPayHandler from './api/sigilopay.js';
import configHandler from './api/config.js';
import adminHandler from './api/admin.js';
import instagramHandler from './api/instagram.js';

const app = express();
const port = Number(process.env.API_PORT) || 3005;

// Debug das variáveis críticas
console.log('--- Debug Environment ---');
console.log('SYNCPAY_CLIENT_ID:', process.env.SYNCPAY_CLIENT_ID ? '******' + process.env.SYNCPAY_CLIENT_ID.slice(-4) : 'MISSING');
console.log('SYNCPAY_BASE_URL:', process.env.SYNCPAY_BASE_URL);
console.log('-------------------------');

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);
  next();
});

// Mimic Vercel routes
app.get('/api/suggestions', suggestionsHandler);
// suggestions_auth removed

app.get('/api/profile', profileHandler);
app.get('/api/posts', postsHandler);
app.get('/api/stories', storiesHandler);
app.get('/api/track-ip', trackIpHandler);
app.post('/api/track-ip', trackIpHandler);
app.get('/api/check-pix', checkPixHandler);
app.post('/api/sigilopay', sigiloPayHandler);
app.get('/api/config', configHandler);
app.post('/api/config', configHandler);

app.use('/api/admin', adminHandler);
app.get('/api/instagram', instagramHandler);

// Root route for status check
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1 style="color: #22c55e;">✅ API STALKEA ONLINE</h1>
      <p>Esta janela deve ficar aberta para o sistema funcionar.</p>
      <p style="background: #f3f4f6; padding: 15px; border-radius: 8px; display: inline-block;">
        <strong>Acesse o site aqui:</strong> <a href="http://localhost:3003" style="color: #6366f1;">http://localhost:3003</a>
      </p>
    </div>
  `);
});

app.listen(port, () => {
  console.log(`Local API server running at http://localhost:${port}`);
  console.log('Use http://localhost:3003 to view the main site.');
}).on('error', (err) => {
  console.error('SERVER ERROR:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${port} is already in use by another process.`);
  }
});
