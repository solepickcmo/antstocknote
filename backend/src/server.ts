import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';




dotenv.config();

const app = express();




import prisma from './prisma';
const port = process.env.PORT || 4000;

app.use(cors({
  origin: true, // Reflects the incoming origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.options('*', cors());
app.use(express.json());

import authRoutes from './routes/auth.routes';
import tradeRoutes from './routes/trade.routes';
import dashboardRoutes from './routes/dashboard.routes';
import noteRoutes from './routes/note.routes';
import tagRoutes from './routes/tag.routes';
import analysisRoutes from './routes/analysis.routes';
import stockRoutes from './routes/stock.routes';

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/trades', tradeRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notes', noteRoutes);
app.use('/api/v1/tags', tagRoutes);
app.use('/api/v1/analysis', analysisRoutes);
app.use('/api/v1/stocks', stockRoutes);

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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
