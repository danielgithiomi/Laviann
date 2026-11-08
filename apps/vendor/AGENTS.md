# Laviann vendor application

Read [the root agent guide](../../AGENTS.md) first. It owns product scope and shared
architecture decisions and Git workflow. Use an isolated task worktree/branch,
open the PR against `main`, and never merge without owner approval. The managed
Next.js guidance below supplements those instructions.

The local P0 is implemented. Read [this app's README](README.md) for routes,
screenshots and code boundaries, [the architecture guide](../../docs/architecture.md)
for shared contracts, and [the verification record](../../docs/verification.md) for
dated evidence. Archived build prompts are historical, not unfinished task lists.

Use `@laviann/shared` for the theme, shared types and common UI. Edit shared image
sources in `../../packages/shared/assets/images`, never the generated copies under
`public/assets/images`. `predev` and `prebuild` refresh this app's images, overwriting
same-name files without deleting files or watching the source directory.

Every private page verifies Auth with getUser and the explicit vendor_admins binding.
Every mutation also checks owner authorization in PostgreSQL. Use the session client
for vendor actions; never substitute the service role to bypass owner checks. Keep
payment recording separate from fulfillment, and WhatsApp sharing manual.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
