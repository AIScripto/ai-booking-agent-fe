---
name: write-frontend-test
description: >-
  Use this skill whenever the user asks you to write, extend, or fix tests for the
  AI booking-agent frontend — a component, page, hook, form, or user flow — or to
  set up the frontend test framework for the first time.
---

# Write Frontend Test

Canonical rules: [`../../../AGENTS.md`](../../../AGENTS.md) §9 and
[`../../../docs/DEFINITION_OF_DONE.md`](../../../docs/DEFINITION_OF_DONE.md) §3.

## Step 0: The Framework Is Not Installed Yet

Read this before writing a single test file. `frontend/` has **no test framework**. There is
no `vitest`, no `@testing-library/react`, no test script in `package.json`.

So the first request to write a frontend test is really two tasks:

1. **Install and wire the framework** — Vitest + React Testing Library + jsdom, per §9.
   This adds dependencies, so **stop and confirm with the user first**
   ([`AGENT_RULES.md`](../../../../AGENT_RULES.md) preamble). Present what you intend to add
   and why before installing.
2. Then write the tests.

Do not silently scaffold a different framework because it was faster. §9 commits to Vitest +
RTL; it shares Vite's config and transform pipeline, so Jest would mean a second build
toolchain for one repo.

When you wire it up, add a `test` script **and** fold it into `scripts/verify.sh` — a test
suite the DoD gate does not run is a suite that rots.

## Step 1: Test What the User Sees, Never the Internals

The rule from §9, and the reason RTL was chosen. Assert on visible text, ARIA roles, labels,
and keyboard interaction. Never assert on state variables, props, hook internals, or a
component's render count.

Query by role and accessible name first (`getByRole('button', { name: /cancel/i })`). This is
not a style preference — a query that can only find the element by test id is usually
telling you the element is not reachable by a screen reader either, which is an R6 failure
the test just surfaced for free.

## Step 2: The Four States Are Four Tests (R4)

For any async surface, the DoD requires all four states render. Each is its own test with
its own mocked API outcome:

| Test | Mock | Assert |
| :-- | :-- | :-- |
| Loading | pending promise | skeleton/spinner present |
| Empty | resolves `[]` | the explanatory copy **and** the action that fills it |
| Error | rejects | plain-language message **and** a working retry affordance |
| Success | resolves data | the rows, correct |

The error test must click the retry and assert a refetch. A retry button that renders but
does nothing passes a naive test and fails the user.

## Step 3: Mock at the API Boundary

Mock `src/services/api.ts` — the module every component already routes through (R5). Do not
mock `fetch` globally, and do not hit a real backend.

Mocking at that one boundary is only possible because R5 holds. If you find yourself needing
to stub an inline `fetch` inside a component, the fix is to move the call into `api.ts`, not
to widen the mock.

## Step 4: Cover the Crash Classes That Have No Guard

Type-checking and oxlint miss these, and there are no integration tests behind them:

- **Hook-order crashes (R1).** Render the component in the state that triggers the early
  return, then in the state that does not — e.g. open a drawer with a selected booking, then
  close it so the prop goes `null`. This is the exact sequence that throws *"Rendered fewer
  hooks than expected"*.
- **Unmount mid-flight.** Start a fetch, unmount before it resolves, assert no state-update
  warning. Tab switching does this constantly in this app.
- **Cleanup.** Assert intervals and subscriptions are cleared on unmount.

## Step 5: Multi-Tenant and Vocabulary Cases

The bundle serves clinics, salons, and garages. Where a component reads
`src/services/vocabulary.ts`, test it under **two different industries** and assert the
labels change. A test that hardcodes "Doctor" re-introduces the hardcoded noun that R3
forbids.

Test the signed-out path too: with no tenant established, the component must show an error
state, never fall back to another tenant's data.

## Step 6: Keyboard and Focus

For any drawer, modal, or menu: assert focus moves in on open, `Escape` closes, and focus
returns to the trigger on close. These are DoD §5 requirements that a mouse-driven test will
never exercise.

## Step 7: Verify and Report

`npm run verify` must exit 0.

Until the suite meaningfully covers a flow, the manual four-state pass in DoD §3 still
applies — **a passing test file does not replace it for flows the file does not cover.**
State plainly which flows are now covered by tests, which you exercised by hand, and which
remain unverified.
