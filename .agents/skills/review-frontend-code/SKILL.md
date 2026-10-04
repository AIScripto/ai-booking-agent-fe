---
name: review-frontend-code
description: >-
  Use this skill whenever the user asks you to review, audit, assess, or check the
  quality of frontend code in the AI booking-agent dashboard or public booking
  surface — a diff, a component, a page, or the app as a whole. Also use it before
  declaring any frontend change done.
---

# Review Frontend Code

Canonical rules: [`../../rules/frontend-design.md`](../../rules/frontend-design.md) and
[`../../../AGENTS.md`](../../../AGENTS.md) §1 (R1–R8). The bar is
[`../../../docs/DEFINITION_OF_DONE.md`](../../../docs/DEFINITION_OF_DONE.md).

**This is a read-and-report skill.** Per [`AGENT_RULES.md`](../../../../AGENT_RULES.md) §2,
a review request is answer-only: report findings, do not edit. Fix only on an explicit
instruction.

## Step 0: Run the Gate First

`npm run verify` runs `tsc -b`, `oxlint`, the production build, and the guard scripts. Run it
before reading, so your reading time goes to what a script cannot judge — hook correctness,
the four states, and whether the screen is actually usable.

**There is no test framework installed.** Nothing you find here was caught by a test, and
nothing you approve is protected by one. Weight the review accordingly, and never describe a
flow as working on the strength of a clean typecheck.

## Step 1: The React-Correctness Pass (R1) — Highest Severity

oxlint catches some of this; read for it anyway, because these are the failures that crash
a screen rather than degrade it.

- **Hooks before guards.** Any `useState`/`useEffect`/`useMemo` below an early `return` is a
  crash, not a smell. React throws *"Rendered fewer hooks than expected"* the moment the
  component re-renders on the other side of that branch — typically when a user closes a
  drawer or modal they just opened. Flag as 🔴 P1.
- **Effect dependencies** are complete. A loop is fixed with `useCallback`/`useMemo` or by
  moving state — **never** by deleting a dependency to silence the linter.
- **Cleanup**: every subscription, interval, timeout, and in-flight request is torn down on
  unmount. Tab switching unmounts pages mid-flight in this app.
- **Stable list keys** — a domain id, never the array index.
- **No state mutation.** New objects and arrays only.

## Step 2: The Four States (R4) — Not Negotiable

For every async surface in the diff, all four must render:

| State | The bar |
| :-- | :-- |
| Loading | Skeleton or spinner. Not a blank panel. |
| Empty | What appears here, and the action that fills it. Not "No data". |
| Error | Plain language **plus a retry affordance**. |
| Success | The data, correct. |

A happy-path-only component is **incomplete work**, not a component with a follow-up.
`catch (e) {}` and `catch (e) { console.log(e) }` are swallowed failures — the user is shown
nothing while the action silently failed. Flag every one.

## Step 3: The Multi-Tenant & White-Label Pass (R3)

This app serves clinics, salons, law firms, and garages from one bundle:

- No hardcoded domain nouns. "Doctor"/"Patient" come from `src/services/vocabulary.ts`,
  keyed off tenant industry.
- No hardcoded API host, port, or tenant UUID. `src/config/env.ts` is the **only** place
  `import.meta.env` is read.
- A missing tenant must surface as *"not signed in"*, never silently resolve to somebody
  else's data. Any literal-UUID fallback is a cross-tenant hazard — 🟠 P2 minimum.
- The public booking surface shows the **tenant's** branding, not the platform's.
- **No `VITE_*` var holds a secret.** They are embedded in the bundle and readable by every
  browser that loads the app. A secret here is 🔴 P1 and requires rotation, not just removal.

## Step 4: The Boundary Pass (R5)

All network access goes through `src/services/api.ts`. An inline `fetch` in a `.tsx` is
both an untyped response waiting to become `any` and a URL waiting to be hardcoded — which
is exactly how a deployed bundle ends up calling `localhost`.

## Step 5: The Accessibility Pass (R6)

- Clickable is `<button>`, navigation is `<a>`. A `<div onClick>` is unreachable by keyboard.
- Every input has a real `<label>` or `aria-label`. **Placeholders are not labels.**
- Icon-only buttons carry `aria-label`; decorative icons carry `aria-hidden`.
- Drawers and modals: focus moves in, `Escape` closes, focus returns on close.
- Status is never colour alone — text or icon too.
- Body text meets WCAG AA (4.5:1).

## Step 6: The Presentation Pass

- Existing dark palette (`slate-950/900/800`, `sky-400` accent). No new colour scale
  introduced for one component.
- Depth uses the `.glass` class from `src/index.css`, not an ad-hoc
  `backdrop-blur … bg-white/… border-white/…` string.
- Works at mobile width — no horizontal page scroll; wide tables scroll inside their own
  `overflow-x-auto` container.
- Staff surfaces stay dense and glanceable. They are read mid-phone-call.

## Step 7: Report

Rank findings: 🔴 P1 crash, secret in the bundle, or cross-tenant data exposure · 🟠 P2
silent failure, missing state, broken keyboard path · 🟡 P3 type debt, styling drift.

Give file:line and the user-visible consequence — "closing the drawer crashes the page",
not "hook order violation". State which flows you exercised by hand and which you could not;
with no test framework, that distinction is the entire integrity of the review.

Name any finding already tracked in
[`../../../docs/DEFINITION_OF_DONE.md`](../../../docs/DEFINITION_OF_DONE.md) "Known debt" so
new regressions are distinguishable from known debt. Never propose raising a count in
`scripts/baseline.json`.
