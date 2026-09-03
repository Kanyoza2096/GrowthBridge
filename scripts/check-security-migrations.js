const fs = require('node:fs');
const path = require('node:path');

const dir = path.join(process.cwd(), 'supabase', 'migrations');
const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
const hardenedFiles = files.filter((f) => /^02[0-9]_/.test(f));
const text = hardenedFiles.map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');

const forbidden = [
  /raw_user_meta_data\s*->>\s*['"]role['"]/i,
  /CREATE POLICY\s+"Anyone can submit application"/i,
  /CREATE POLICY\s+"Public profiles are viewable by everyone"/i,
];

for (const pattern of forbidden) {
  if (pattern.test(text)) {
    throw new Error(`Security migration check failed: forbidden pattern ${pattern}`);
  }
}

const hardening = ['021_production_hardening_followup.sql', '022_final_security_and_integrity.sql']
  .map((f) => fs.readFileSync(path.join(dir, f), 'utf8')).join('\n');
for (const required of [
  'REVOKE ALL ON TABLE public.profiles',
  'REVOKE ALL ON FUNCTION public.soft_delete_record',
  'REVOKE ALL ON FUNCTION public.purge_soft_deleted',
  'ALTER DEFAULT PRIVILEGES IN SCHEMA public',
  'DROP POLICY IF EXISTS \"applications admin insert\" ON public.applications',
  "DROP POLICY IF EXISTS \"Public can view media bucket\" ON storage.objects",
  'SET search_path = \'\'',
  "public.has_admin_permission('applications', 'create')",
]) {
  if (!hardening.includes(required)) throw new Error(`Missing hardening control: ${required}`);
}

console.log(`Security migration checks passed (${files.length} migrations).`);
