# Laviann Git Commit Conventions (v2)

**Base standard:** [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/).
The mandatory feature scope and branch trailer are Laviann-specific extensions.

## Required structure

```text
<type>(<feature-scope>): <lowercase, imperative summary>

[optional explanation of what changed and why]

Branch: <actual-git-branch>
```

The feature scope in parentheses and the `Branch:` trailer are **mandatory** for
normal commits. `prepare-commit-msg` inserts the branch trailer automatically.
The `commit-msg` hook validates the type, scope, subject format, and verifies
that the trailer matches `git symbolic-ref --short HEAD`.

### Example (on `feature/custom-packaging`)

```text
feat(packaging): support custom 500g portions

Branch: feature/custom-packaging
```

Normal usage can still be a one-line Git command:

```sh
git switch -c feature/custom-packaging
git add .
git commit -m "feat(packaging): support custom 500g portions"
```

Husky's `prepare-commit-msg` hook adds `Branch: feature/custom-packaging` to the
stored commit. You **do not** have to type the footer for each commit.

## Allowed change types

| Type | Used for |
|---|---|
| `feat` | New functionality |
| `fix` | Bug fixes |
| `docs` | Documentation changes |
| `refactor` | Restructure code without behavior change |
| `test` | Test additions or corrections |
| `chore` | Maintenance, tooling, and housekeeping |
| `build` | Build tooling and dependencies |
| `ci` | CI workflow updates |
| `perf` | Performance improvements |
| `style` | Formatting only, no runtime change |
| `revert` | Reverts to an earlier change |

Use `fix`, not `bug` or `bugfix`, for a bug correction.

## Common feature scopes

`customer`, `vendor`, `catalogue`, `product`, `packaging`, `cart`, `checkout`,
`inventory`, `orders`, `quotation`, `delivery`, `payments`, `auth`, `db`,
`design`, `ux`, `repo`, `prd`, `ci`.

Other lowercase hyphenated scopes are allowed when they describe a specific area.
Use the **feature or component**, not merely a vague label like `misc`.

## Good examples

```text
feat(checkout): calculate region-based delivery fees

Branch: feature/zone-pricing
```

```text
fix(inventory): prevent reservations above available stock

Branch: fix/stock-reservation-race
```

```text
docs(ux): document customer quotation approval flow

Branch: docs/ux-journeys
```

```text
chore(repo): enforce feature scopes and branch trailers

Branch: chore/commit-policy
```

```text
feat(orders)!: require versioned quotation approval

BREAKING CHANGE: old confirmation links can no longer approve orders.

Branch: feature/quote-versioning
```

## Subject conventions

- Keep the subject to **72 characters or fewer**.
- Lowercase `type` and `scope`; lowercase opening of summary.
- Use an imperative action phrase: `add`, `support`, `prevent`, `update`, etc.
- Do not end the subject with a period.
- Explain the motivation in the optional body when useful.
- Mark breaking API changes with `!` and/or `BREAKING CHANGE:`.

## Special Git commits

Git-generated merge and revert messages are permitted without the branch trailer.
Normal commits on `main` still require `Branch: main`, automatically generated.
In a detached HEAD state, normal commits are rejected because no branch exists.
Git `--amend` preserves the previous commit message; ensure the `Branch:`
trailer still matches the current branch when amending from another branch.

## Enforcement

- `.husky/prepare-commit-msg` adds branch metadata for ordinary commits.
- `.husky/pre-commit` runs `bun run check` across both applications.
- `.husky/commit-msg` invokes the POSIX shell validator and rejects violations.
- `sh scripts/test-commit-msg.sh` exercises allowed/rejected messages in a
  temporary real Git repository.

Hooks validate **local commits before they can be pushed**; they do not by
themselves prevent someone bypassing hooks or pushing through another machine.
When GitHub is connected, require passing checks and protect the main branch.
