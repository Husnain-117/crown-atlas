import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const trackedFiles = execFileSync('git', [
  'ls-files', '-z', '--cached', '--others', '--exclude-standard',
], {
  cwd: root,
  encoding: 'utf8',
})
  .split('\0')
  .filter((file) => file && existsSync(path.join(root, file)));

const findings = [];
const textExtensions = new Set([
  '.cjs', '.js', '.json', '.mjs', '.ts', '.tsx', '.yaml', '.yml',
]);

function readTrackedFile(file) {
  return readFileSync(path.join(root, file), 'utf8');
}

for (const file of trackedFiles) {
  const extension = path.extname(file).toLowerCase();
  const isEnvironmentExample = /(^|\/)env(?:\.[^/]+)?\.example$/.test(file);
  if (!textExtensions.has(extension) && !isEnvironmentExample) continue;

  const content = readTrackedFile(file);

  if (/-----BEGIN (?:RSA )?PRIVATE KEY-----/.test(content)) {
    findings.push(`${file}: contains a private key`);
  }

  if (/mongodb(?:\+srv)?:\/\/[^:\s/]+:[^@<$\s]+@/i.test(content)) {
    findings.push(`${file}: contains a credentialed MongoDB URI`);
  }

  if (
    /process\.env\.[A-Z0-9_]*(?:API_KEY|ACCESS_KEY|SECRET|PASSWORD|AUTH_TOKEN|ACCESS_TOKEN|PRIVATE_KEY)\s*\|\|\s*['"][^'"]+['"]/.test(
      content,
    )
  ) {
    findings.push(`${file}: contains a hard-coded credential fallback`);
  }

  if (isEnvironmentExample) {
    const credentialAssignment = content.match(
      /^(?!\s*#)[A-Z0-9_]*(?:API_KEY|ACCESS_KEY|SECRET|PASSWORD|AUTH_TOKEN|ACCESS_TOKEN|PRIVATE_KEY)=([^\s#]+)$/m,
    );
    const assignedValue = credentialAssignment?.[1] ?? '';
    if (assignedValue && !assignedValue.startsWith('<') && !assignedValue.startsWith('${')) {
      findings.push(`${file}: contains a populated credential example`);
    }
  }

  if (extension === '.json') {
    try {
      const value = JSON.parse(content);
      if (value?.type === 'service_account' && value?.private_key) {
        findings.push(`${file}: contains Google service-account credentials`);
      }
    } catch {
      // Invalid JSON is handled by its owning build/tooling checks.
    }
  }
}

const nextConfig = readTrackedFile('next.config.ts');
if (/env\s*:\s*{[\s\S]*?ADMIN_PASSWORD[\s\S]*?}/.test(nextConfig)) {
  findings.push('next.config.ts: exposes ADMIN_PASSWORD through Next.js env');
}

const middleware = readTrackedFile('src/middleware.ts');
const adminPageAuth = readTrackedFile('src/lib/admin-page-auth.ts');
if (
  !/pathname\.startsWith\("\/admin\/"\)/.test(middleware) ||
  !/pathname\.startsWith\("\/api\/admin\/"\)/.test(middleware) ||
  !/authorizeAdminPageRequest/.test(middleware) ||
  !/ADMIN_BASIC_USERNAME/.test(adminPageAuth) ||
  !/ADMIN_BASIC_PASSWORD/.test(adminPageAuth)
) {
  findings.push('src/middleware.ts: admin pages do not fail closed behind credentials');
}

const adminRoutes = trackedFiles.filter((file) =>
  /^src\/app\/api\/admin\/.+\/route\.ts$/.test(file),
);
const adminProtection =
  /authorizeServerRequest|ApiAuthMiddleware\.(?:requireAuth|withAuth)|x-admin-key/;

for (const route of adminRoutes) {
  if (!adminProtection.test(readTrackedFile(route))) {
    findings.push(`${route}: has no recognized admin authorization`);
  }
}

const protectedDataReadRoutes = [
  'src/app/api/contact-info/route.ts',
  'src/app/api/subscribers/route.ts',
];

for (const route of protectedDataReadRoutes) {
  const content = readTrackedFile(route);
  if (
    /export async function GET/.test(content) &&
    !/ApiAuthMiddleware\.(?:requireAuth|withAuth)|authorizeServerRequest/.test(content)
  ) {
    findings.push(`${route}: exposes private records without recognized authorization`);
  }
}

const publicCronRoutes = new Set(['src/app/api/cron/mls-delta/status/route.ts']);
const cronRoutes = trackedFiles.filter((file) =>
  /^src\/app\/api\/cron\/.+\/route\.ts$/.test(file) && !publicCronRoutes.has(file),
);
const cronProtection = /authorizeServerRequest/;

for (const route of cronRoutes) {
  if (!cronProtection.test(readTrackedFile(route))) {
    findings.push(`${route}: has no recognized cron authorization`);
  }
}

if (findings.length > 0) {
  console.error(`Security audit failed with ${findings.length} finding(s):`);
  for (const finding of findings) console.error(`- ${finding}`);
  process.exit(1);
}

console.log(
  `Security audit passed (${trackedFiles.length} repository files, ${adminRoutes.length} admin routes, ${cronRoutes.length} protected cron routes).`,
);
