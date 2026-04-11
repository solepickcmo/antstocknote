const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

const parseCSVLine = (text) => {
  const result = [];
  let current = '';
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
};

const seedStocks = async () => {
  const filePath = path.join(process.cwd(), 'all_stock_master.csv');
  if (!fs.existsSync(filePath)) {
    console.error('CSV file not found at:', filePath);
    process.exit(1);
  }

  console.log('Reading CSV file from:', filePath);
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const lines = fileContent.split(/\r?\n/);
  
  const stocksToInsert = [];
  
  // Skip header (market_code,ticker,name,market)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const parts = parseCSVLine(line);
    
    if (parts.length >= 4) {
      const marketCode = parts[0]; // e.g., KRX
      let ticker = parts[1];
      const name = parts[2];
      const market = parts[3];

      if (marketCode === 'KRX' && ticker) {
         ticker = ticker.padStart(6, '0');
      }

      stocksToInsert.push({
        ticker,
        name,
        market
      });
    }
  }

  console.log(`Parsed ${stocksToInsert.length} records. Starting DB insertion in chunks...`);
  
  const chunk_size = 2000;
  for (let i = 0; i < stocksToInsert.length; i += chunk_size) {
    const chunk = stocksToInsert.slice(i, i + chunk_size);
    await prisma.stockMaster.createMany({
      data: chunk,
      skipDuplicates: true
    });
    console.log(`Inserted ${i + chunk.length} / ${stocksToInsert.length} records...`);
  }
  
  console.log('Stock master seeding completed successfully!');
};

seedStocks()
  .catch(e => {
    console.error('Error seeding stocks:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
