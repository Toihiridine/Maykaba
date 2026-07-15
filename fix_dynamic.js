const fs = require('fs');
const glob = require('glob');

const apiFiles = glob.sync('src/app/api/**/route.ts');
const adminFiles = glob.sync('src/app/admin/**/page.tsx');
const allFiles = [...apiFiles, ...adminFiles];

let changedCount = 0;

for (const file of allFiles) {
  let content = fs.readFileSync(file, 'utf8');
  if (!content.includes('force-dynamic')) {
    content = 'export const dynamic = "force-dynamic";\n' + content;
    fs.writeFileSync(file, content);
    console.log('Fixed ' + file);
    changedCount++;
  }
}

console.log('Changed ' + changedCount + ' files.');
