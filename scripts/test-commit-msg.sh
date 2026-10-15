#!/bin/sh
set -eu
root=$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)
validator="$root/scripts/validate-commit-msg.sh"
preparer="$root/.husky/prepare-commit-msg"
repo=$(mktemp -d)
trap 'rm -rf "$repo"' EXIT HUP INT TERM

# A real, isolated Git branch is essential: the validator checks the actual ref.
cd "$repo"
git init -q
git checkout -q -b feature/custom-packaging

check_valid() {
  printf '%s\n' "$1" > "$repo/COMMIT_EDITMSG"
  if ! sh "$validator" "$repo/COMMIT_EDITMSG" > /dev/null 2>&1; then
    echo "FAILED (should pass): $1" >&2
    sh "$validator" "$repo/COMMIT_EDITMSG" >&2 || true
    exit 1
  fi
}
check_invalid() {
  printf '%s\n' "$1" > "$repo/COMMIT_EDITMSG"
  if sh "$validator" "$repo/COMMIT_EDITMSG" > /dev/null 2>&1; then
    echo "FAILED (should reject): $1" >&2
    exit 1
  fi
}

check_valid 'feat(packaging): support custom 500g portions

Branch: feature/custom-packaging'
check_valid 'fix(inventory): prevent double reservations

Ensure concurrent checkouts never exceed available meat stock.

Branch: feature/custom-packaging'
check_valid 'feat(orders)!: replace quotation confirmation contract

BREAKING CHANGE: confirmations now require a quote version.

Branch: feature/custom-packaging'
check_valid 'docs(prd): clarify order cutoffs

Branch: feature/custom-packaging'
check_valid 'Merge branch feature/customer-orders'
check_valid 'Revert "feat(packaging): support custom 500g portions"'

check_invalid 'feat(packaging): support custom 500g portions'
check_invalid 'feat(packaging): support custom 500g portions

Branch: feature/other-branch'
check_invalid 'feat: support custom portions

Branch: feature/custom-packaging'
check_invalid 'Feat(packaging): add portion sizing

Branch: feature/custom-packaging'
check_invalid 'feat(packaging): Add portion sizing

Branch: feature/custom-packaging'
check_invalid 'feat(packaging): support portions.

Branch: feature/custom-packaging'
check_invalid 'fix(packaging): fix parsing
Branch: feature/custom-packaging'
check_invalid 'fix(packaging): fix parsing

Branch: feature/custom-packaging
Branch: feature/custom-packaging'
check_invalid 'feat(packaging): this header is much too long and exceeds the seventy two character length threshold

Branch: feature/custom-packaging'

# Verify the prepare hook inserts an accurate trailer once and the validator
# recognizes it, including a second preparation pass with no duplicates.
printf 'feat(packaging): support variable pack sizes\n' > "$repo/COMMIT_EDITMSG"
sh "$preparer" "$repo/COMMIT_EDITMSG" message
sh "$preparer" "$repo/COMMIT_EDITMSG" message
sh "$validator" "$repo/COMMIT_EDITMSG"
[ "$(grep -c '^Branch:' "$repo/COMMIT_EDITMSG")" -eq 1 ]

echo 'Laviann commit policy: all acceptance, rejection, and auto-footer checks passed.'
