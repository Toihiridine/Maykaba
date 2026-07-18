const fs = require('fs');
const path = require('path');

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const replaced = content.replace(/import\s+\{\s*authOptions\s*\}\s+from\s+['"]@\/app\/api\/auth\/\[\.\.\.nextauth\]\/route['"];/g, 'import { authOptions } from "@/lib/auth";');
      if (content !== replaced) {
        fs.writeFileSync(fullPath, replaced);
        console.log('Updated', fullPath);
      }
    }
  }
}

walk(path.join(__dirname, 'src'));
