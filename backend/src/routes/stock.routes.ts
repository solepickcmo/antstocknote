import express from 'express';
import { searchStocks } from '../controllers/stock.controller';

const router = express.Router();

router.get('/search', searchStocks);

export default router;
