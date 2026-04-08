const fs = require('fs');
const path = require('path');

const tsFiles = [];
function findFiles(dir) {
  const list = fs.readdirSync(dir);
  for (const f of list) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) findFiles(full);
    else if (full.endsWith('.ts')) tsFiles.push(full);
  }
}
findFiles(path.join(__dirname, 'src'));

for (const f of tsFiles) {
  let content = fs.readFileSync(f, 'utf8');
  let changed = false;

  if (content.includes('import { TradeType }')) {
    content = content.replace("import { TradeType } from '@prisma/client';", "");
    changed = true;
  }
  if (content.includes('import { TagType }')) {
    content = content.replace("import { TagType } from '@prisma/client';", "");
    changed = true;
  }
  if (content.includes('import { TradeType, TagType }')) {
    content = content.replace("import { TradeType, TagType } from '@prisma/client';", "");
    changed = true;
  }
  if (content.includes('import { TagType, TradeType }')) {
    content = content.replace("import { TagType, TradeType } from '@prisma/client';", "");
    changed = true;
  }
  
  if (content.includes('TradeType')) {
    content = content.replace(/TradeType/g, "string");
    changed = true;
  }
  if (content.includes('TagType')) {
    content = content.replace(/TagType/g, "string");
    changed = true;
  }

  if (changed) fs.writeFileSync(f, content);
}

// Fix note.controller.ts
const noteCtrl = path.join(__dirname, 'src', 'controllers', 'note.controller.ts');
if (fs.existsSync(noteCtrl)) {
  let c = fs.readFileSync(noteCtrl, 'utf8');
  c = c.replace(/BigInt\(req.params.tradeId\)/g, "BigInt(req.params.tradeId as string)");
  fs.writeFileSync(noteCtrl, c);
}
