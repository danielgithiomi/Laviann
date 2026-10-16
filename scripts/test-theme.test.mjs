import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

for (const app of ['customer', 'vendor']) {
    test(`${app} compiles shared theme utilities and discovers shared component classes`, async () => {
        const appUrl = new URL(`../apps/${app}/`, import.meta.url);
        const require = createRequire(new URL('package.json', appUrl));
        const postcss = require('postcss');
        const { default: config } = await import(new URL('postcss.config.mjs', appUrl));
        const plugins = Object.entries(config.plugins).map(([name, options]) => require(name)(options));
        const stylesheet = new URL('src/app/globals.css', appUrl);
        const input = await readFile(stylesheet, 'utf8');
        // Exercise tokens that the placeholder pages do not use yet. The font-body
        // and text-subtle classes must be discovered from shared UI, not this probe.
        const probe = '@source inline("bg-canvas bg-brand-strong border-outline rounded-card");';
        const { root } = await postcss(plugins).process(`${input}\n${probe}`, { from: fileURLToPath(stylesheet) });

        const declarations = selector => {
            const values = {};
            root.walkRules(selector, rule =>
                rule.walkDecls(decl => {
                    values[decl.prop] = decl.value;
                }),
            );
            return values;
        };

        // App classes, shared component classes, and unused tokens all keep the
        // runtime variable references, so changing the central palette/fonts works.
        assert.equal(declarations('.text-brand').color, 'var(--laviann-primary)');
        assert.equal(declarations('.font-display')['font-family'], 'var(--laviann-font-heading)');
        assert.equal(declarations('.font-body')['font-family'], 'var(--laviann-font-body)');
        assert.equal(declarations('.text-subtle').color, 'var(--laviann-muted)');
        assert.equal(declarations('.bg-canvas')['background-color'], 'var(--laviann-background)');
        assert.equal(declarations('.bg-brand-strong')['background-color'], 'var(--laviann-primary-strong)');
        assert.equal(declarations('.border-outline')['border-color'], 'var(--laviann-border)');
        assert.equal(declarations('.rounded-card')['border-radius'], 'var(--laviann-radius-card)');

        // Existing layout styles must remain in a lower cascade layer than
        // utilities; otherwise selectors such as h1/.panel can defeat utilities.
        root.walkRules('.shell', rule => {
            let ancestor = rule.parent;
            while (ancestor && ancestor.name !== 'layer') ancestor = ancestor.parent;
            assert.equal(ancestor?.params, 'components');
        });
        assert.equal(declarations('ul')['list-style-type'], 'disc');
        root.walkAtRules(/^(theme|source)$/, rule => assert.fail(`Uncompiled Tailwind directive: ${rule.name}`));
    });
}
