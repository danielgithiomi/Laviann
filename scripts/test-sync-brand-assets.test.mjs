import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, stat, utimes, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { syncAssets } from './sync-brand-assets.mjs';

const sourcePath = 'packages/shared/assets/images';
const destinationPath = app => `apps/${app}/public/assets/images`;

async function fixture(t) {
    const root = await mkdtemp(path.join(tmpdir(), 'laviann-assets-'));
    t.after(() => rm(root, { recursive: true, force: true }));
    await mkdir(path.join(root, sourcePath), { recursive: true });
    return root;
}

async function write(root, name, contents) {
    const filename = path.join(root, name);
    await mkdir(path.dirname(filename), { recursive: true });
    await writeFile(filename, contents);
}

test('copies nested folders and binary bytes into both apps without copying placeholders', async t => {
    const root = await fixture(t);
    const contents = Buffer.from([0, 255, 128, 12, 34]);
    await write(root, `${sourcePath}/Brands/Authentication/logo.png`, contents);
    await write(root, `${sourcePath}/branding/.gitkeep`, '');
    await write(root, `${sourcePath}/.DS_Store`, 'local metadata');
    await syncAssets({ root });

    for (const app of ['customer', 'vendor']) {
        assert.deepEqual(await readFile(path.join(root, destinationPath(app), 'Brands/Authentication/logo.png')), contents);
        await assert.rejects(stat(path.join(root, destinationPath(app), 'branding/.gitkeep')), { code: 'ENOENT' });
        await assert.rejects(stat(path.join(root, destinationPath(app), '.DS_Store')), { code: 'ENOENT' });
    }
});

test('refreshes a changed image with the same name, size and timestamp on the next run', async t => {
    const root = await fixture(t);
    const name = `${sourcePath}/branding/logo.svg`;
    await write(root, name, '<svg>old</svg>');
    await syncAssets({ root });
    const previous = await stat(path.join(root, name));
    await write(root, name, '<svg>new</svg>');
    await utimes(path.join(root, name), previous.atime, previous.mtime);
    await syncAssets({ root });

    for (const app of ['customer', 'vendor']) {
        assert.equal(await readFile(path.join(root, destinationPath(app), 'branding/logo.svg'), 'utf8'), '<svg>new</svg>');
    }
});

test('preserves unrelated public files and old copies after their source is removed', async t => {
    const root = await fixture(t);
    await write(root, `${sourcePath}/logo.svg`, 'logo');
    await syncAssets({ root });
    await rm(path.join(root, sourcePath, 'logo.svg'));

    for (const app of ['customer', 'vendor']) {
        await write(root, `apps/${app}/public/robots.txt`, 'keep robots');
        await write(root, `${destinationPath(app)}/app-only.png`, 'keep app image');
    }
    await syncAssets({ root });

    for (const app of ['customer', 'vendor']) {
        assert.equal(await readFile(path.join(root, destinationPath(app), 'logo.svg'), 'utf8'), 'logo');
        assert.equal(await readFile(path.join(root, destinationPath(app), 'app-only.png'), 'utf8'), 'keep app image');
        assert.equal(await readFile(path.join(root, `apps/${app}/public/robots.txt`), 'utf8'), 'keep robots');
    }
});

test('synchronizes only the selected application', async t => {
    const root = await fixture(t);
    await write(root, `${sourcePath}/logo.svg`, 'new');
    await write(root, `${destinationPath('vendor')}/logo.svg`, 'vendor unchanged');
    await syncAssets({ root, apps: ['customer'] });
    assert.equal(await readFile(path.join(root, destinationPath('customer'), 'logo.svg'), 'utf8'), 'new');
    assert.equal(await readFile(path.join(root, destinationPath('vendor'), 'logo.svg'), 'utf8'), 'vendor unchanged');
});

test('supports an empty image folder, but fails for a missing source or an unknown application', async t => {
    const root = await fixture(t);
    await syncAssets({ root });
    await assert.rejects(syncAssets({ root, apps: ['unknown'] }), /Unknown app/);
    await rm(path.join(root, sourcePath), { recursive: true });
    await assert.rejects(syncAssets({ root }), { code: 'ENOENT' });
});

test('the CLI resolves paths relative to the script and rejects invalid arguments', async t => {
    const root = await fixture(t);
    const script = path.join(root, 'scripts/sync-brand-assets.mjs');
    await mkdir(path.dirname(script));
    await copyFile(fileURLToPath(new URL('./sync-brand-assets.mjs', import.meta.url)), script);
    await write(root, `${sourcePath}/icons/deep/logo.svg`, 'cli logo');
    const result = spawnSync(process.execPath, [script, '--app', 'vendor'], { cwd: tmpdir(), encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(await readFile(path.join(root, destinationPath('vendor'), 'icons/deep/logo.svg'), 'utf8'), 'cli logo');
    await assert.rejects(stat(path.join(root, 'apps/customer')), { code: 'ENOENT' });

    for (const args of [['--app', 'unknown'], ['--app'], ['--watch'], ['--force']]) {
        const invalid = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
        assert.equal(invalid.status, 1);
    }
});
