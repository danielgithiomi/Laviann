import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

const env = Object.fromEntries(
    readFileSync('.env.test.local', 'utf8')
        .trim()
        .split('\n')
        .map(line => {
            const i = line.indexOf('=');
            return [line.slice(0, i), line.slice(i + 1)];
        }),
);
const secrets = ['SUPABASE_SERVICE_ROLE_KEY', 'SERVER_TOKEN_SECRET'].map(key => env[key]);
if (secrets.some(value => !value || value.length < 32)) throw new Error('Configure local private keys before this check.');
function files(dir) {
    return readdirSync(dir, { withFileTypes: true }).flatMap(entry =>
        entry.isDirectory() ? files(join(dir, entry.name)) : [join(dir, entry.name)],
    );
}
let checked = 0;
for (const app of ['customer', 'vendor']) {
    for (const path of files(`apps/${app}/.next/static`)) {
        if (!path.endsWith('.js')) continue;
        const source = readFileSync(path, 'utf8');
        if (secrets.some(value => source.includes(value))) throw new Error(`Private key found in client output: ${path}`);
        checked++;
    }
}
console.log(`Checked ${checked} production browser JavaScript files: neither private key is present.`);
