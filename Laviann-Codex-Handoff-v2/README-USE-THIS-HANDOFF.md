# Laviann - Complete Codex development handoff v2.0

**Purpose:** Hand Codex enough approved business, visual, architectural and acceptance context to develop the existing
Laviann proof of concept with minimal avoidable clarification. This is a development brief, NOT an installer and NOT a
request to create a new repository.

## Fastest path - full P0 implementation

1. Download and extract `Laviann-Codex-Complete-Development-Handoff-v2.zip`.
2. Open your **existing** Laviann repository in Codex Desktop or an authorized Codex cloud coding environment. It must
   be able to read both Next.js apps, `packages/shared`, the root `AGENTS.md`, and `docs/PRD.md`. Do not create a new
   repository or reset your working tree.
3. Make the extracted handoff accessible to Codex: attach the necessary files or place the handoff folder in the
   workspace under `docs/handoff-v2/` (you may keep the folder uncommitted until you decide whether it belongs in Git).
   A zipped file may need to be extracted before the agent can read image files. The most important files are the master
   brief, brand spec and approved PNG reference.
4. Paste **`CODEX-PASTE-TO-START-FULL-BUILD.md`** into the Codex task. The agent is instructed to read
   `CODEX-MASTER-DEVELOPMENT-PROMPT.md` and current repo docs, then implement P0 rather than only proposing an
   implementation plan.
5. Review the agent's plan, branches/worktrees, code, tests and PR descriptions. Do not merge until satisfied. If it
   cannot create a PR, give it a Git-capable Codex environment or push its local feature branch yourself.
6. Provide safe **Supabase development** project credentials or a working local Supabase environment when ready. Never
   paste private keys into chat. Without backend access, the agent should still write migrations/integration code and a
   demo mode but must not falsely claim live end-to-end tests passed.

## Optional incremental path

If you prefer to approve the design system/UI first, paste `CODEX-START-HERE-PHASE-A.md` instead. That request builds a
polished, truthful customer/vendor UI prototype and stops with a reviewable PR before progressing into the database
workflows. The full-build prompt is the recommended starting point for your latest request; the Phase A prompt is
provided only as an alternative.

## Files and precedence

- **`CODEX-PASTE-TO-START-FULL-BUILD.md`**: short, ready-to-paste full-development launch instruction.
- **`CODEX-MASTER-DEVELOPMENT-PROMPT.md`**: comprehensive all-in-one functional + brand + architecture + security +
  detailed engineering acceptance mandate (includes the engineering appendix; ~9,000 words).
- **`CODEX-ENGINEERING-ACCEPTANCE-DETAILS.md`**: same deep engineering acceptance appendix separately for targeted
  review, not a conflicting second source.
- **`BRAND-AND-UX-SPEC.md`**: detailed approved logo (small **monochrome steak-cut** accent), exact tagline, palette,
  font roles, screen style and corrections to older mockups.
- **`references/approved/Laviann-approved-visual-board.png`**: final reviewed visual direction (small meat icon),
  **not** a code asset or exact data specification.
- **`references/legacy-layouts/*.svg`**: earlier editable SVG layouts for useful screen structure; **leaf logos and mock
  data are obsolete**. Also includes a preview sheet.
- **`product/PRD.md`**: snapshot of baseline requirements; always check the newer authoritative **repository**
  `docs/PRD.md` before editing.
- **`MILESTONE-ACCEPTANCE-TRACKER.md`**: fillable implementation ledger for actual results, with eight POC demonstration
  scenarios.
- **`CODEX-START-HERE-PHASE-A.md`**: optional narrower initial PR workflow.

**Source of truth:** latest explicit project-owner instructions > current repository `docs/PRD.md` for business rules >
approved `BRAND-AND-UX-SPEC.md` for visual identity > accepted architecture ADRs > agent instructions > old exploratory
screens > inaccurate generated-picture labels. If sources disagree, Codex must document the conflict and apply the
higher-priority source rather than quietly making up a new product policy.

## Approved brand and P0 reminders

- Logo wordmark `LAVIANN`, small **single-color** steak-cut accent above `I` (not red, not a leaf, not oversized), and
  matching simple `L` app icon.
- Tagline **Quality Meats, Greater Meals.**
- Colors from `packages/shared/src/theme/colors.ts`: deep forest, sage, ivory, white, charcoal and restrained
  terracotta; use existing Tailwind v4 shared CSS variable mapping.
- Headings existing Big Shoulders / Big Shoulders Display-like family; body **Inter**.
- Initial raw meat categories **Chicken and Beef** only. No cooked meals, pork/lamb seed offerings, card payment gateway
  or restaurant screens.
- Checkout says **Submit order request** and starts **Pending Review**. Vendor review and exact versioned quotation
  approval precede Confirmed, stock reservation and preparation.
- Payment: cash on delivery, **MCB Juice**, bank transfer; manual recording/verification. WhatsApp: manual share/copy
  link only.
- Critical demo arithmetic: 2kg breast + 2kg drumsticks + 2kg wings and North delivery = **Rs 2,095** (PRD demo rates
  only).
- Existing shared image synchronization **preserves nested folders and overwrites same-name images on predev/prebuild**,
  without watcher or deletion.
- The existing `chore/shared-foundation` branch may not yet be merged into `main`. Codex must inspect branch status
  rather than assuming `main` contains everything.

## What this handoff does not do

It does **not** edit your GitHub repo, create a branch, publish a build, verify external Supabase credentials, or sign
off real merchant pricing/legal compliance. The board is an AI-generated *design reference*. Codex is responsible for
turning it into real accessible components and true SVG logo files in your repository, testing the P0 workflows, and
presenting reviewable changes.
