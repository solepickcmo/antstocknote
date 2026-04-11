import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';

interface Stock {
  marketCode: string;
  symbol: string;
  nameKo: string;
  nameEn: string;
  assetType: string;
  category: string;
}

let stocks: Stock[] | null = null;

const parseCSVLine = (text: string) => {
  const result: string[] = [];
  let current = '';
  // Remove BOM if present at the very beginning of the first line
  if (text.charCodeAt(0) === 0xFEFF) {
    text = text.slice(1);
  }
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (char === '"' && text[i+1] === '"') {
      current += '"';
      i++;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

const loadStocks = () => {
  if (stocks) return stocks;
  
  const possiblePaths = [
    path.join(process.cwd(), 'all_stock_master.csv'),
    path.join(process.cwd(), 'backend', 'all_stock_master.csv'),
    path.join(__dirname, '../../all_stock_master.csv'),
    path.join(__dirname, '../../../all_stock_master.csv')
  ];

  let filePath = '';
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      filePath = p;
      break;
    }
  }

  if (!filePath) {
    console.error('CSV file not found in any of the search paths:', possiblePaths);
    return [];
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lines = fileContent.split(/\r?\n/);
    stocks = [];
    
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = parseCSVLine(line);
    
    if (parts.length >= 6) {
      let marketCode = parts[0];
      let symbol = parts[1];
      let nameKo = parts[2];
      let nameEn = parts[3];
      let assetType = parts[4];
      let category = parts[5];

      if (marketCode === 'KRX' && symbol) {
         symbol = symbol.padStart(6, '0');
      }

      stocks.push({ marketCode, symbol, nameKo, nameEn, assetType, category });
    }
  }
  return stocks;
  } catch (err) {
    console.error('Error reading or parsing CSV file:', err);
    return [];
  }
};

export const searchStocks = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(200).json([]);
    }
    const query = q.toLowerCase();
    const allStocks = loadStocks();
    
    // Filter conditions: check nameKo, nameEn or symbol
    const results = allStocks.filter(s => 
      s.nameKo.toLowerCase().includes(query) || 
      s.symbol.toLowerCase().includes(query) ||
      s.nameEn.toLowerCase().includes(query)
    ).slice(0, 20); // Limit to 20 results for performance

    return res.status(200).json(results);
  } catch (error) {
    console.error('Error searching stocks:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
