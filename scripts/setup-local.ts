/** Configures only the isolated local stack. Never use this against a hosted project. */
import { randomBytes } from 'node:crypto';
import { writeFileSync, chmodSync, existsSync, readFileSync } from 'node:fs';
import { createClient } from '../apps/customer/node_modules/@supabase/supabase-js';
import { z } from '../packages/shared/node_modules/zod';
const run = Bun.spawnSync(['bunx', 'supabase', 'status', '-o', 'json']);
if (run.exitCode) throw new Error('Start local Supabase first.');
const status = z
    .object({ API_URL: z.url(), ANON_KEY: z.string(), SERVICE_ROLE_KEY: z.string(), DB_URL: z.string() })
    .parse(JSON.parse(run.stdout.toString()));
if (new URL(status.API_URL).hostname !== '127.0.0.1' || !status.DB_URL.includes('127.0.0.1:54322'))
    throw new Error('This setup is restricted to the isolated local stack.');
const existing = existsSync('.env.test.local')
    ? Object.fromEntries(
          readFileSync('.env.test.local', 'utf8')
              .trim()
              .split('\n')
              .map(line => line.split('=')),
      )
    : {};
const secret = existing.SERVER_TOKEN_SECRET || randomBytes(32).toString('hex');
const password = existing.TEST_VENDOR_PASSWORD || randomBytes(18).toString('hex');
const email = 'owner@laviann.example.test';
const client = createClient(status.API_URL, status.SERVICE_ROLE_KEY);
const { data: list, error: listError } = await client.auth.admin.listUsers();
if (listError) throw new Error('Local Auth is not ready.');
let user = list.users.find(u => u.email === email);
if (!user) {
    const { data, error } = await client.auth.admin.createUser({ email, password, email_confirm: true });
    if (error || !data.user) throw new Error('Could not create local demo owner.');
    user = data.user;
}
const provision = Bun.spawnSync([
    'psql',
    status.DB_URL,
    '-v',
    'ON_ERROR_STOP=1',
    '-c',
    `insert into public.vendor_admins(user_id) values('${z.uuid().parse(user.id)}') on conflict do nothing;`,
]);
if (provision.exitCode) throw new Error('Could not authorize the local owner.');
const common = `NEXT_PUBLIC_SUPABASE_URL=${status.API_URL}\nNEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=${status.ANON_KEY}\nSUPABASE_SERVICE_ROLE_KEY=${status.SERVICE_ROLE_KEY}\nSERVER_TOKEN_SECRET=${secret}\n`;
for (const [app, port] of [
    ['customer', 3000],
    ['vendor', 3001],
]) {
    const path = `apps/${app}/.env.local`;
    writeFileSync(path, `${common}APP_ORIGIN=http://localhost:${port}\nCUSTOMER_ORIGIN=http://localhost:3000\n`);
    chmodSync(path, 0o600);
}
writeFileSync(
    '.env.test.local',
    `${common}TEST_DB_URL=${status.DB_URL}\nTEST_VENDOR_EMAIL=${email}\nTEST_VENDOR_PASSWORD=${password}\n`,
);
chmodSync('.env.test.local', 0o600);
console.log('Local Supabase configured for both apps. Demo owner credentials are in ignored .env.test.local (mode 600).');
