// Parse CSV safely handling quotes
export const parseCSVLine = (text: string): string[] => {
  const result: string[] = [];
  let current = '';
  // Remove BOM if present
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
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
};

export interface StockData {
  symbol: string;
  nameKo: string;
  nameEn: string;
  marketCode: string;
}

let cachedStockMasterPromise: Promise<StockData[]> | null = null;

// Load and parse the stock master CSV (cached, only fetched once)
export const loadStockMasterCSV = (): Promise<StockData[]> => {
  if (cachedStockMasterPromise) {
    return cachedStockMasterPromise;
  }
  
  console.log('[CSV] Fetching stock master data...');
  
  // 로컬 CSV 파일 읽기 (보안 패치 예외 적용: 종목 마스터 데이터는 직접 읽기 허용)
  cachedStockMasterPromise = fetch('/all_stock_master.csv?v=' + new Date().getTime())
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`Fetch failed with status: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(arrayBuffer);
      
      console.log(`[CSV] Data loaded: ${text.length} characters`);

      // HTML 반환 여부 체크 (Vercel rewrite 등으로 인한 오류 방지)
      if (text.trim().startsWith('<!DOCTYPE html>') || text.trim().startsWith('<html')) {
        throw new Error('Received HTML instead of CSV. Check vercel.json rewrites.');
      }

      const lines = text.split(/\r?\n/);
      const stocks: StockData[] = [];
      
      console.log(`[CSV] Parsing ${lines.length} lines...`);
      
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = parseCSVLine(line);
        // Header: market_code,ticker,name,market
        if (parts.length >= 4) {
          const marketCode = parts[0];
          let ticker = parts[1];
          const nameKo = parts[2];
          
          if (marketCode === 'KRX' && ticker) {
            ticker = ticker.padStart(6, '0');
          }
          
          stocks.push({
            symbol: ticker,
            nameKo: nameKo,
            nameEn: '',
            marketCode: marketCode
          });
        }
      }
      
      console.log(`[CSV] Load complete! Found ${stocks.length} stocks.`);
      return stocks;
    })
    .catch((error) => {
      console.error('[CSV] Error loading stock CSV:', error);
      cachedStockMasterPromise = null; // allow retry
      return [];
    });
    
  return cachedStockMasterPromise;
};
