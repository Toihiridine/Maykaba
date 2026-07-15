const fs = require('fs');
const glob = require('glob');

// 1. Create src/lib/prisma.ts
const libCode = `import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
`;
if (!fs.existsSync('src/lib')) {
  fs.mkdirSync('src/lib', { recursive: true });
}
fs.writeFileSync('src/lib/prisma.ts', libCode);

// 2. Fix src files
const files = glob.sync('src/**/*.{ts,tsx}');

for (const file of files) {
  if (file === 'src/lib/prisma.ts') continue;
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  if (content.includes('new PrismaClient()')) {
    content = content.replace(/import \{ PrismaClient \} from [\"']@prisma\/client[\"'];?/g, 'import { prisma } from "@/lib/prisma";');
    content = content.replace(/const prisma = new PrismaClient\(\);/g, '');
    changed = true;
  }
  
  if ((file.includes('/api/') && file.endsWith('route.ts')) || file.includes('app/admin/')) {
    if (!content.includes('force-dynamic') && !file.includes('layout.tsx')) {
      content = 'export const dynamic = "force-dynamic";\n' + content;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, content);
  }
}
console.log("Fixes applied successfully.");
