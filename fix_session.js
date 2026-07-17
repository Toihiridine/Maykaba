const fs = require('fs');
const path = require('path');

function traverse(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverse(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      if (content.includes('getServerSession()') && !content.includes('authOptions')) {
        content = content.replace(/import \{ getServerSession \} from ["']next-auth["'];/, 'import { getServerSession } from "next-auth";\nimport { authOptions } from "@/app/api/auth/[...nextauth]/route";');
        content = content.replace(/getServerSession\(\)/g, 'getServerSession(authOptions)');
        fs.writeFileSync(fullPath, content);
        console.log('Updated: ' + fullPath);
      }
    }
  }
}

traverse('./src');
