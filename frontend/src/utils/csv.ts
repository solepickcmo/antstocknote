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
  
  cachedStockMasterPromise = fetch('/all_stock_master.csv')
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch stock CSV');
      }
      const text = await response.text();
      const lines = text.split(/\r?\n/);
      
      const stocks: StockData[] = [];
      
      // Skip header
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = parseCSVLine(line);
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
      return stocks;
    })
    .catch((error) => {
      console.error('Error loading stock CSV:', error);
      cachedStockMasterPromise = null; // allow retry
      return [];
    });
    
  return cachedStockMasterPromise;
};
