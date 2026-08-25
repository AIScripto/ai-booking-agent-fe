# Definition of Done — Frontend

A change is **done** when every box below is checked. Not "it renders" — *done*.

`npm run verify` automates everything marked 🤖. The rest requires judgement and must be
checked by the person or agent doing the work.

> **Do not report a task complete without running `npm run verify`.**
> There is no test framework yet, so the manual UI pass in §3 is the only thing standing
> between a change and a broken screen. Do not skip it, and do not claim a flow works if
> you only typechecked it.

---

## 1. Gate — automated

Run `npm run verify` (or `npm run verify:quick` to skip the production build). Must exit **0**.

| ✅ | Check | Rule |
| :-- | :-- | :-- |
| 🤖 | `npx tsc -b` — zero errors | R7 |
| 🤖 | `tsconfig.app.json` has `"strict": true` | R7 |
| 🤖 | `npm run build` succeeds | R7 |
| 🤖 | No real credentials in source (`VITE_*` vars ship to browsers) | R3 |
| 🤖 | `.env` not tracked by git | R3 |
| 🤖 | oxlint error count has not increased | R1/R8 |
| 🤖 | `any` count has not increased | R2 |
| 🤖 | Hardcoded URL/UUID count has not increased | R3 |
| 🤖 | Swallowed-error count has not increased | R4 |
| 🤖 | Inline-`fetch` count has not increased | R5 |
| 🤖 | Non-semantic click-handler count has not increased | R6 |

**A gate failure is never fixed by raising a baseline.** See AGENTS.md §8.

---

## 2. Correctness — manual

- [ ] The change does what was asked, and **only** what was asked.
- [ ] Every hook is called unconditionally, before any early `return`. No hook inside a
      condition, loop, or after a guard clause.
- [ ] Effects declare complete dependency arrays; loops fixed with `useCallback`/`useMemo`
      or by moving state, never by deleting a dependency.
- [ ] Every subscription, interval and timeout is cleaned up on unmount.
- [ ] Async effects guard against unmount — **tab switching unmounts pages mid-flight.**
- [ ] Lists key on a stable domain id, never the array index.
- [ ] No state mutation; new objects and arrays only.
- [ ] All network I/O goes through `src/services/api.ts`. No inline `fetch` in a `.tsx`.

## 3. The four UI states — manual, mandatory

For **every** async surface you touched, exercise all four and confirm each renders:

- [ ] **Loading** — skeleton or spinner. Not a blank panel.
- [ ] **Empty** — explains what appears here and the action that fills it. Not "No data".
- [ ] **Error** — plain-language message **plus a retry affordance**. No silent `catch`.
- [ ] **Success** — the data, correct.

State in your summary **which flows you exercised and which you could not.**

## 4. Multi-tenant & white-label — manual

- [ ] No hardcoded domain nouns. "Doctor"/"Patient" come from `services/vocabulary.ts`,
      keyed off tenant industry. This UI also serves salons, law firms and garages.
- [ ] No hardcoded API host, port, or tenant UUID. Config from `import.meta.env`.
- [ ] The public booking surface renders the **tenant's** branding, not the platform's.
- [ ] No `VITE_*` var holds a secret — they ship in the bundle to every browser.

## 5. Accessibility — manual

- [ ] Clickable = `<button>`, navigation = `<a>`. No `<div onClick>`.
- [ ] Every input has a real `<label>` or `aria-label`. Placeholders are not labels.
- [ ] Reachable and operable by keyboard alone; focus states visible.
- [ ] Icon-only buttons have `aria-label`; decorative icons have `aria-hidden`.
- [ ] Drawers/modals: focus moves in, `Escape` closes, focus returns on close.
- [ ] Status is never conveyed by colour alone — text or icon too.
- [ ] Body text meets WCAG AA (4.5:1).

## 6. Presentation — manual

- [ ] Matches the existing dark palette and spacing; no new colour scale introduced ad hoc.
- [ ] Works at mobile width. No horizontal page scroll; wide tables scroll in their own
      `overflow-x-auto` container.
- [ ] Icons from lucide-react at sizes consistent with neighbours.
- [ ] Staff surfaces stay dense and glanceable — they are read mid-phone-call.

## 7. Reporting — manual

- [ ] You ran `npm run verify` and are reporting its **actual** result.
- [ ] You listed which UI states and flows you exercised by hand.
- [ ] Anything unverified is stated plainly, with the reason.
- [ ] Debt you paid down is reflected by a **lowered** baseline.

---

## Known debt

Recorded in `scripts/baseline.json` as of 2026-08-25. The gate tolerates these counts and
fails on any increase. Worst-first — fix on contact.

### 🔴 P1 — `CallTranscriptDrawer` violates rules-of-hooks (crash)

`src/components/CallTranscriptDrawer.tsx:20` returns before its `useState` calls:

```tsx
if (!booking) return null;          // line 20
const [notes, setNotes] = useState<string>('');   // line 22 — never reached when null
const [saved, setSaved] = useState<boolean>(false);
```

React throws **"Rendered fewer hooks than expected"** when the drawer goes from open
(`booking` set) to closed (`booking` null) — i.e. every time a user closes it after opening.
This is the app's 2 oxlint errors. Fix: move both `useState` above the guard.

### 🔴 P1 — the production build cannot reach the API

Six inline `fetch()` calls hardcode `http://localhost:5000/api/v1`, and `api.ts` does too:

| File | Calls |
| :-- | :-- |
| `pages/DoctorDirectoryManager.tsx` | 3 |
| `components/StatusBoard.tsx` | 1 |
| `pages/PublicBookingPage.tsx` | 1 |
| `pages/DoctorScheduleView.tsx` | 1 |

A deployed bundle calls the user's own machine and fails. Fix: introduce
`VITE_API_BASE_URL`, route all six through `api.ts`, and add the placeholder to
`.env.example`.

### 🟠 P2 — hardcoded fallback tenant UUID (baseline 17)

`api.ts` falls back to a literal tenant UUID when `localStorage.tenant_id` is absent, and
the same UUID is hardcoded across 8 files. A signed-out or misconfigured client silently
reads **one specific tenant's** data. A missing tenant must be an error state, not a
default.

### 🟠 P2 — no test framework

Nothing is installed, so §3 is entirely manual and regressions are invisible. Planned:
Vitest + React Testing Library. Until then, every change carries manual-verification risk,
and `CallTranscriptDrawer` is the proof.

### 🟡 P3 — `any` usage (baseline 14)

Concentrated in `DoctorDirectoryManager` (3), `CalendarView` (3), `PublicBookingPage` (2),
`Dashboard` (2). Mostly untyped API responses — fix by exporting shared response types from
`api.ts` and reusing them.

### 🟡 P3 — swallowed errors and lint warnings (baseline 1)

Two `catch (err) {}` blocks in `DoctorDirectoryManager` (lines 117, 133) discard the error,
so a failed onboard/offboard shows the user nothing. Plus a missing `useEffect` dependency
(`fetchAppointments`) in `CalendarView`.

### 🟡 P3 — no router

Navigation is `activeTab` string state in `App.tsx`. No deep links, no browser back, no
shareable URL for a booking or call log. Adding react-router is its own task, not a
side effect of another change.
