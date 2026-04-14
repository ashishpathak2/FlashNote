// !! dotenv MUST be loaded first, before any other imports that read process.env
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import authRoutes  from './routes/auth.js';
import deckRoutes  from './routes/decks.js';
import cardRoutes  from './routes/cards.js';
import studyRoutes from './routes/study.js';

// Verify critical env vars on startup
const requiredEnv = ['JWT_SECRET', 'OPENROUTER_API_KEY'];
const missing = requiredEnv.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`\n✗ Missing required environment variables: ${missing.join(', ')}`);
  console.error('  Copy backend/.env.example to backend/.env and fill in the values.\n');
  process.exit(1);
}

console.log('✓ ENV loaded');
console.log(`  MONGODB_URI    : ${process.env.MONGODB_URI || 'mongodb://localhost:27017/mnemo (default)'}`);
console.log(`  OPENROUTER_KEY : ${process.env.OPENROUTER_API_KEY.slice(0,12)}...`);
console.log(`  JWT_SECRET     : ${process.env.JWT_SECRET.slice(0,8)}...`);

const app  = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ['http://localhost:5173', 'http://localhost:3000'], credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/auth',  authRoutes);
app.use('/api/decks', deckRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/study', studyRoutes);

app.get('/api/health', (_req, res) =>
  res.json({ status: 'ok', time: new Date().toISOString() })
);

// Global error handler
app.use((err, _req, res, _next) => {
  console.error('[GlobalError]', err);
  res.status(500).json({ message: err.message || 'Internal server error' });
});

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mnemo')
  .then(() => {
    console.log('✓ MongoDB connected');
    app.listen(PORT, () =>
      console.log(`✓ Server running → http://localhost:${PORT}\n`)
    );
  })
  .catch(err => {
    console.error('✗ MongoDB connection failed:', err.message);
    process.exit(1);
  });
