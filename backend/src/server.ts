import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// Security headers - Helmet should be at the very top
app.use(helmet());




import prisma from './prisma';
const port = process.env.PORT || 4000;

app.use(cors({
  origin: [
    'https://www.antstocknote.com',
    'https://antstocknote.com',
    'http://localhost:5173',
    'http://localhost:5174'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

import tradeRoutes from './routes/trade.routes';
import dashboardRoutes from './routes/dashboard.routes';
import noteRoutes from './routes/note.routes';
import tagRoutes from './routes/tag.routes';
import analysisRoutes from './routes/analysis.routes';
import stockRoutes from './routes/stock.routes';
import authRoutes from './routes/auth.routes';
import principleRoutes from './routes/principle.routes';
import stockAnalysisRoutes from './routes/stockAnalysis.routes';

app.use('/api/v1/trades', tradeRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/analysis', analysisRoutes);
app.use('/api/v1/stocks', stockRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/principles', principleRoutes);
app.use('/api/v1/stock-analyses', stockAnalysisRoutes);

// BigInt JSON 직렬화 전역 설정
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

app.get('/health', async (req, res) => {
  try {
    // DB 연결 상태 테스트용 간단한 쿼리
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', db: 'connected', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('DB Connection error:', error);
    res.status(503).json({ status: 'error', db: 'disconnected', error: String(error) });
  }
});

// 404 Catch-all handler
app.use((req, res) => {
  console.warn(`[404] Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Requested route ${req.method} ${req.url} not found on this server.`
  });
});

app.listen(port, () => {
  // Server is running
});
