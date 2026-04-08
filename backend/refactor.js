const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src', 'services');
const files = fs.readdirSync(servicesDir).filter(f => f.endsWith('.ts'));

for (const f of files) {
  const p = path.join(servicesDir, f);
  let content = fs.readFileSync(p, 'utf8');
  content = content.replace("import { PrismaClient } from '@prisma/client';", "import prisma from '../prisma';");
  content = content.replace("const prisma = new PrismaClient();\n", "");
  fs.writeFileSync(p, content);
}

let serverPath = path.join(__dirname, 'src', 'server.ts');
let serverContent = fs.readFileSync(serverPath, 'utf8');
serverContent = serverContent.replace("import { PrismaClient } from '@prisma/client';", "");
serverContent = serverContent.replace("import { Pool } from 'pg';", "");
serverContent = serverContent.replace("import { PrismaPg } from '@prisma/adapter-pg';", "");
serverContent = serverContent.replace("const connectionString = process.env.DATABASE_URL;", "");
serverContent = serverContent.replace("const pool = new Pool({ connectionString });", "");
serverContent = serverContent.replace("const adapter = new PrismaPg(pool);", "");
serverContent = serverContent.replace("const prisma = new PrismaClient({ adapter, log: ['info', 'warn', 'error'] });", "import prisma from './prisma';");
fs.writeFileSync(serverPath, serverContent);
