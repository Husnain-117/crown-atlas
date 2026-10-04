const fs = require('fs');
const path = require('path');

const dirs = [
  'src/app/api/auth',
  'src/app/api/user',
  'src/app/api/users',
  'src/app/api/saved-homes',
  'src/app/api/saved-searches'
];

const basePath = path.join(__dirname, '..');

const processDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) return;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      processDir(fullPath);
    } else if (entry.name === 'route.ts' || entry.name === 'route.js') {
      const content = fs.readFileSync(fullPath, 'utf8');
      if (!content.includes('AUTH DISABLED')) {
        const newContent = `// AUTH DISABLED\n` + 
`import { NextResponse } from "next/server";\n` +
`export async function GET() { return NextResponse.json({ error: "Auth Disabled" }, { status: 403 }); }\n` +
`export async function POST() { return NextResponse.json({ error: "Auth Disabled" }, { status: 403 }); }\n` +
`export async function PUT() { return NextResponse.json({ error: "Auth Disabled" }, { status: 403 }); }\n` +
`export async function DELETE() { return NextResponse.json({ error: "Auth Disabled" }, { status: 403 }); }\n` +
`/* ORIGINAL CONTENT\n${content}\n*/`;
        fs.writeFileSync(fullPath, newContent);
        console.log(`Disabled: ${fullPath}`);
      }
    }
  }
};

for (const dir of dirs) {
  processDir(path.join(basePath, dir));
}
console.log('Done!');
