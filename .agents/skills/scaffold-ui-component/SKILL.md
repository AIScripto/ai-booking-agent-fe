---
name: scaffold-ui-component
description: >-
  Use this skill whenever the user asks you to create a new React UI component,
  refactor an existing component, add a new page, or scaffold frontend UI for the
  AI booking-agent provider dashboard or public booking surface.
---

# Scaffold UI Component

Canonical rules: [`../../rules/frontend-design.md`](../../rules/frontend-design.md) and
[`../../../AGENTS.md`](../../../AGENTS.md) §5–§8. Stack: React 19 · Vite 8 · TypeScript ·
Tailwind v4 (CSS-first, no config file) · lucide-react.

## Step 0: Identify the Surface
Decide which audience this serves — it changes every design decision:
- **Staff** (`Dashboard`, `CalendarView`, `StatusBoard`, `CallLogsView`, `AnalyticsView`,
  `DoctorDirectoryManager`, `DoctorScheduleView`) — dense, glanceable, keyboard-friendly.
  Read while a receptionist is on a live call.
- **Public** (`PublicBookingPage`, `BookingWidget`) — calm, minimal, white-labelled with the
  tenant's branding from the API. No platform branding.

## Step 1: Enforce Styling Discipline
- Match the existing dark palette: `slate-950/900/800` surfaces, `sky-400` accent. Do not
  introduce a new colour scale for one component.
- No inline `style` for static values — only for genuinely computed ones (a bar width, a
  tenant brand colour from the API).
- Need depth? Use the `.glass` class from `src/index.css`, not an ad-hoc
  `backdrop-blur … bg-white/… border-white/…` string.
- Icons from **lucide-react** only, sized to match neighbours (`h-4 w-4` / `h-5 w-5`),
  `aria-hidden` when decorative.

## Step 2: Reuse Before You Build
There is no `src/components/ui/` primitive library yet. Grep `src/components/` and
`src/pages/` for an existing implementation of what you need and reuse it. Only on the
third occurrence, extract to `src/components/ui/<Name>.tsx` and record it in the primitive
table in `rules/frontend-design.md` in the same change. Never import a primitive that does
not exist.

## Step 3: Wire Data Through the Boundary
- All network access goes through `src/services/api.ts` (R5). No inline `fetch`.
- No hardcoded URLs, tenant IDs, or secrets — read config from `import.meta.env` (R3).
- No hardcoded domain nouns. Pull user-facing labels from `src/services/vocabulary.ts`
  (`resourceLabel`, `customerLabel`, `serviceLabel`, `statusInProgress`).

## Step 4: Render All Four States (R4)
Loading (skeleton/spinner), Empty (what would appear + the action that fills it), Error
(plain language + a retry affordance), Success. A happy-path-only component is incomplete
work. Never `catch (e) {}` or `catch (e) { console.log(e) }`.

## Step 5: Types & Accessibility
- Strict TypeScript. No `any`, no `@ts-ignore`/`@ts-expect-error` without an adjacent
  justification comment (R2).
- Hooks called unconditionally at the top level in a stable order (R1).
- Interactive elements are real `<button>`/`<a>`, keyboard-reachable and labelled (R6).

## Step 6: Definition of Done Verification
Run `npm run verify` in `frontend/` — it runs `tsc -b`, `oxlint`, and the guard scripts.
(`npm run verify:quick` for fast iteration; the script is `typecheck`, **not**
`type-check`.) If it fails, autonomously debug and fix. Never run
`./scripts/verify.sh --update-baseline` to silence a guard — fix the code. Only present the
finished component once `npm run verify` exits 0.
