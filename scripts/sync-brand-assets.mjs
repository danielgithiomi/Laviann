import { copyFile, mkdir, readdir, realpath } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs } from 'node:util';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const appNames = ['customer', 'vendor'];

async function copyDirectory(source, destination) {
    const entries = await readdir(source, { withFileTypes: true });
    await mkdir(destination, { recursive: true });
    let copied = 0;

    for (const entry of entries) {
        if (entry.name === '.gitkeep' || entry.name === '.DS_Store') continue;

        const from = path.join(source, entry.name);
        const to = path.join(destination, entry.name);
        if (entry.isDirectory()) {
            copied += await copyDirectory(from, to);
        } else if (entry.isFile()) {
            // copyFile overwrites existing files, even when their name/size is unchanged.
            await copyFile(from, to);
            copied++;
        } else {
            throw new Error(`Expected a regular file or directory: ${from}`);
        }
    }

    return copied;
}

export async function syncAssets({ root = repositoryRoot, apps = appNames } = {}) {
    for (const app of apps) {
        if (!appNames.includes(app)) throw new Error(`Unknown app: ${app}. Use customer or vendor.`);
    }

    const source = path.join(root, 'packages/shared/assets/images');
    for (const app of apps) {
        const destination = path.join(root, 'apps', app, 'public/assets/images');
        const copied = await copyDirectory(source, destination);
        console.log(`[assets] ${app}: copied ${copied} file(s) to public/assets/images`);
    }
}

if (process.argv[1] && (await realpath(process.argv[1])) === fileURLToPath(import.meta.url)) {
    try {
        const { values } = parseArgs({ options: { app: { type: 'string' } } });
        await syncAssets({ apps: values.app === undefined ? appNames : [values.app] });
    } catch (error) {
        console.error(`[assets] ${error.message}`);
        process.exitCode = 1;
    }
}
