const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash('password123', 10);
  let user = await prisma.user.findUnique({ where: { email: 'test@antstock.com' } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: 'test@antstock.com',
        nickname: 'AntTester',
        password_hash: hash,
      }
    });
    console.log('User created:', user);
  } else {
    console.log('User already exists:', user);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
