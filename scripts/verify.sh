#!/usr/bin/env bash
# Definition-of-Done gate for voice-agent-frontend.
#
#   ./scripts/verify.sh                    full run
#   ./scripts/verify.sh --quick            skip the production build
#   ./scripts/verify.sh --update-baseline  rewrite scripts/baseline.json from current counts
#
# Exit 0 = done. Non-zero = not done.
set -uo pipefail
cd "$(dirname "$0")/.." || exit 1
. scripts/lib.sh

QUICK=0; UPDATE=0
for a in "$@"; do
  case "$a" in
    --quick) QUICK=1 ;;
    --update-baseline) UPDATE=1 ;;
    -h|--help) sed -n '2,9p' "$0"; exit 0 ;;
    *) echo "unknown flag: $a" >&2; exit 2 ;;
  esac
done

G=scripts/guards

if [ "$UPDATE" = "1" ]; then
  cat > "$BASELINE_FILE" <<JSON
{
  "_comment": "Recorded technical debt. Lower these freely; NEVER raise them. See AGENTS.md §8.",
  "_updated": "$(date +%Y-%m-%d)",
  "no_any": $($G/no-any.sh),
  "hardcoded_config": $($G/no-hardcoded-config.sh),
  "api_boundary": $($G/api-boundary.sh),
  "ui_states": $($G/ui-states.sh),
  "a11y": $($G/a11y.sh),
  "lint_errors": $($G/lint-errors.sh)
}
JSON
  echo "${C_YELLOW}Baseline rewritten from current state:${C_RESET}"; cat "$BASELINE_FILE"
  echo; echo "${C_RED}${C_BOLD}Only legitimate if you REDUCED debt. Raising a baseline hides a real bug.${C_RESET}"
  exit 0
fi

printf '%s\n' "${C_BOLD}Frontend Definition-of-Done gate${C_RESET}"
printf '%s\n' "${C_DIM}repo: $(basename "$REPO_ROOT")  ·  $(date '+%Y-%m-%d %H:%M')${C_RESET}"

# ─────────────────────────────── Hard gates ───────────────────────────────
section "1. Types & build (hard gates)"

if npx tsc -b --force > /tmp/vf_tsc.log 2>&1; then
  pass "tsc -b: zero errors"
else
  fail "tsc -b failed"; info "$(tail -5 /tmp/vf_tsc.log)"
fi

# DEVELOPMENT.md mandates strict:true in every tsconfig
if grep -q '"strict"[[:space:]]*:[[:space:]]*true' tsconfig.app.json 2>/dev/null; then
  pass "tsconfig.app.json has strict: true"
else
  fail "tsconfig.app.json is MISSING \"strict\": true"
  info 'Required by DEVELOPMENT.md. Add "strict": true to compilerOptions and fix the fallout.'
fi

if [ "$QUICK" = "1" ]; then
  warn "production build skipped (--quick)"
elif npm run build > /tmp/vf_build.log 2>&1; then
  pass "npm run build succeeds"
else
  fail "npm run build failed"; info "$(tail -5 /tmp/vf_build.log)"
fi

section "2. Secrets (hard gate)"
hard_zero "no real credentials in source" "$($G/secrets.sh)" \
  "Every VITE_* var ships to the browser. Rotate the key and move it server-side."

if git rev-parse --git-dir > /dev/null 2>&1; then
  if git ls-files --error-unmatch .env > /dev/null 2>&1; then
    fail ".env is TRACKED BY GIT — remove it from the index now"
  else
    pass ".env is not tracked"
  fi
else
  warn "not a git repository — skipped git-based checks"
fi

# ─────────────────────────── Ratcheted gates ──────────────────────────────
section "3. Correctness & architecture rules (ratcheted — see AGENTS.md §8)"

ratchet "R1/R8 oxlint errors"                   "$($G/lint-errors.sh)"          lint_errors \
  "rules-of-hooks errors are real crashes — call every hook before any early return."
ratchet "R2 no-any"                             "$($G/no-any.sh)"               no_any \
  "Type it properly, or use 'unknown' plus a narrowing check."
ratchet "R3 hardcoded URLs / tenant UUIDs"      "$($G/no-hardcoded-config.sh)"  hardcoded_config \
  "Move to import.meta.env (VITE_API_BASE_URL). A hardcoded localhost breaks the prod build."
ratchet "R4 swallowed errors"                   "$($G/ui-states.sh)"            ui_states \
  "Surface the failure in the UI with a retry affordance."
ratchet "R5 inline fetch() outside api.ts"      "$($G/api-boundary.sh)"         api_boundary \
  "Add a method to src/services/api.ts and call that instead."
ratchet "R6 non-semantic click handlers"        "$($G/a11y.sh)"                 a11y \
  "Use <button>. A <div onClick> is unreachable by keyboard and screen readers."

section "4. Manual verification (cannot be automated)"
warn "No test framework installed — the four UI states must be checked by hand"
info "For every flow you touched, confirm: loading · empty · error+retry · success"
info "Then state in your summary which flows you exercised and which you could not."

# ──────────────────────────────── Summary ─────────────────────────────────
section "Summary"
printf '  %s%s passed%s   %s%s warnings%s   %s%s failed%s\n' \
  "$C_GREEN" "$PASS_COUNT" "$C_RESET" "$C_YELLOW" "$WARN_COUNT" "$C_RESET" "$C_RED" "$FAIL_COUNT" "$C_RESET"

if [ -n "$RATCHET_IMPROVED" ]; then
  printf '\n  %sDebt was reduced. Lock it in:%s ./scripts/verify.sh --update-baseline\n' "$C_GREEN" "$C_RESET"
fi

if [ "$FAIL_COUNT" -gt 0 ]; then
  printf '\n%sNOT DONE%s — %s gate(s) failed. See docs/DEFINITION_OF_DONE.md\n' "$C_RED$C_BOLD" "$C_RESET" "$FAIL_COUNT"
  exit 1
fi
printf '\n%sGate passed.%s Complete the manual DoD items in docs/DEFINITION_OF_DONE.md before reporting done.\n' "$C_GREEN$C_BOLD" "$C_RESET"
exit 0
