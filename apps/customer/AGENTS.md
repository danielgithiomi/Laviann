# Laviann customer application

Read [the root agent guide](../../AGENTS.md) first. It owns product scope and shared
architecture decisions; the managed Next.js guidance below supplements it.

Use `@laviann/shared` for the theme, shared types and common UI. Edit shared image
sources in `../../packages/shared/assets/images`, never the generated copies under
`public/assets/images`. `predev` and `prebuild` refresh this app's images, overwriting
same-name files without deleting files or watching the source directory.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
