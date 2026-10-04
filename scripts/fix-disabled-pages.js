const fs = require('fs');

const files = [
  'src/app/login/page.tsx',
  'src/app/register/page.tsx',
  'src/app/auth/login/page.tsx',
  'src/app/auth/register/page.tsx',
  'src/app/auth/forgot-password/page.tsx',
  'src/app/auth/callback/page.tsx',
  'src/app/dashboard/page.tsx',
  'src/app/profile/page.tsx',
  'src/app/profile/favorites/page.tsx',
  'src/app/profile/searches/page.tsx'
];

for (const file of files) {
  if (fs.existsSync(file)) {
    fs.writeFileSync(file, `import { notFound } from "next/navigation";\nexport default function AuthDisabledPage() { return notFound(); }\n`);
    console.log(`Rewrote \${file}`);
  }
}
