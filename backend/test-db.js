const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const count = await prisma.stockMaster.count();
    console.log('StockMaster count:', count);
    if (count > 0) {
      const sample = await prisma.stockMaster.findFirst();
      console.log('Sample:', sample);
    }
  } catch (error) {
    console.error('Error connecting to DB or querying StockMaster:', error);
  } finally {
    await prisma.$disconnect();
  }
}
main();
