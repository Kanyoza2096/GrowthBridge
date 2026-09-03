#!/usr/bin/env node
/**
 * Static production readiness checks.
 *
 * Redis / Upstash is OPTIONAL. When missing, the rate limiter gracefully
 * falls back to an in-memory store (suitable for single-instance only).
 * We emit a strong warning so operators know multi-instance deployments
 * need the distributed store — we never fail the build or crash the app.
 */
const fs = require('fs');
const path = require('path');

const root = process.cwd();
const failures = [];
const warnings = [];

function read(file) {
  return fs.readFileSync(path.join(root, file), 'utf8');
}

function fail(message) { failures.push(message); }
function warn(message) { warnings.push(message); }

const pkg = JSON.parse(read('package.json'));
if (pkg.dependencies?.next !== '15.5.24') fail(`Next.js must be 15.5.24; found ${pkg.dependencies?.next}`);
if (pkg.dependencies?.react !== '19.2.8') fail(`React must be 19.2.8; found ${pkg.dependencies?.react}`);
if (pkg.dependencies?.['react-dom'] !== '19.2.8') fail(`react-dom must be 19.2.8; found ${pkg.dependencies?.['react-dom']}`);
if (!fs.existsSync(path.join(root, 'package-lock.json'))) warn('package-lock.json is missing; generate it with npm install and commit it before deployment.');

const authz = read('src/lib/auth/admin-authorization.ts');
if (!authz.includes("action: AdminAction")) fail('Admin authorization is not action-aware.');

const layout = read('src/app/admin/layout.tsx');
if (!layout.includes("resource: 'people'")) fail('Admin People Directory is not mapped to the people permission resource.');

const settings = read('src/repositories/settings.repository.ts');
if (!settings.includes('apiKeys: []')) fail('Settings repository does not strip API keys from returned/stored settings.');

const migrations = fs.readdirSync(path.join(root, 'supabase/migrations')).filter(f => f.endsWith('.sql'));
const finalMigration = migrations.sort().at(-1);
if (!finalMigration || !/^02[4-9]_/.test(finalMigration)) warn(`Expected a current privilege-hardening migration at the end of the migration chain; found ${finalMigration || 'none'}.`);

// Rate limiting guidance (graceful fallback is intentional)
const rateLimitSrc = read('src/lib/security/rate-limit.ts');
if (!rateLimitSrc.includes('UpstashRateLimitStore') || !rateLimitSrc.includes('InMemoryRateLimitStore')) {
  warn('Rate limit module does not appear to support Upstash + in-memory fallback.');
}
if (!rateLimitSrc.includes('allowing request') && !rateLimitSrc.includes('fail-open') && !rateLimitSrc.includes('unavailable')) {
  warn('Rate limiter may not fail-open when Redis is unreachable — verify graceful fallback.');
}

// Strong recommendation only — never a hard failure
warn(
  'For multi-instance / serverless production, set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN. ' +
  'Without them the app still runs using the in-memory rate limiter (single-instance only). ' +
  'Redis outages never crash the application — requests are allowed (fail-open).'
);

// Debug endpoint must be production-gated
const debugRoute = read('src/app/api/admin/debug/route.ts');
if (!debugRoute.includes("NODE_ENV === 'production'") && !debugRoute.includes('NODE_ENV === "production"')) {
  fail('Admin debug endpoint is not disabled in production.');
}

// next.config should not blindly ignore TS/ESLint errors in production
const nextCfg = read('next.config.ts');
if (nextCfg.includes('ignoreBuildErrors: true') && !nextCfg.includes('isProd') && !nextCfg.includes("NODE_ENV === 'production'")) {
  warn('next.config.ts appears to ignore TypeScript errors in all environments; prefer production-only leniency.');
}
if (nextCfg.includes('ignoreDuringBuilds: true') && !nextCfg.includes('isProd') && !nextCfg.includes("NODE_ENV === 'production'")) {
  warn('next.config.ts appears to ignore ESLint errors in all environments; prefer production-only leniency.');
}


// Public people PII protection
const peopleRepo = read('src/repositories/people.repository.ts');
if (!peopleRepo.includes('mapDbToPublicPerson') || !peopleRepo.includes('getPublicAll')) {
  warn('People repository may not have explicit public-safe (PII-stripped) methods.');
}
if (!peopleRepo.includes("from('public_people')")) {
  warn('People repository public methods should query the public_people view.');
}

const sourceFiles = [];
function walk(dir) {
  for (const entry of fs.readdirSync(path.join(root, dir), { withFileTypes: true })) {
    const rel = path.join(dir, entry.name);
    if (entry.isDirectory() && !['node_modules', '.next'].includes(entry.name)) walk(rel);
    else if (entry.isFile() && /\.(tsx?|css)$/.test(entry.name)) sourceFiles.push(rel);
  }
}
walk('src');

for (const file of sourceFiles) {
  const s = read(file);
  if (/\bNEXT_PUBLIC_\w*(SECRET|PASSWORD|PRIVATE_KEY)\b/.test(s)) fail(`Potential public secret variable reference in ${file}`);
  if (/dangerouslySetInnerHTML\s*=/.test(s) && !file.includes('ThemeFlashScript') && !file.includes('no-flash-theme')) {
    warn(`Review raw HTML injection in ${file}`);
  }
}

if (!fs.existsSync(path.join(root, 'scripts/check-contrast.js'))) {
  warn('Contrast check script missing (scripts/check-contrast.js).');
} else {
  try {
    require('child_process').execFileSync(process.execPath, [path.join(root, 'scripts/check-contrast.js')], {
      stdio: 'pipe',
      encoding: 'utf8',
    });
  } catch (e) {
    fail('Theme contrast check failed. Run: npm run contrast:check');
  }
}

if (failures.length) {
  console.error('Production readiness checks FAILED:');
  for (const f of failures) console.error(`- ${f}`);
  process.exit(1);
}
console.log('Production readiness static checks passed.');
for (const w of warnings) console.warn(`WARN: ${w}`);
