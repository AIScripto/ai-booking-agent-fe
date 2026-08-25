# Frontend Design System Enforcement Rules (Non-Negotiable)

> **Canonical spec**: [`../../AGENTS.md`](../../AGENTS.md) §5–§7 is the single source of truth
> for this repo. The rules below restate and sharpen it for design work. On any conflict,
> `AGENTS.md` wins.
>
> **Stack reality**: React 19 · Vite 8 · TypeScript · **Tailwind CSS v4 (CSS-first, no
> `tailwind.config.*`)** · lucide-react · oxlint. Global CSS lives in `src/index.css`.
> There is a **single dark theme** — no light/Dark-Zinc/Midnight-Navy switcher, no CSS
> custom-property token layer, and no Recharts/`useChartTheme` in this project. Do not
> write rules or code against a design system this repo does not have.

## Palette Rule (Match, Don't Invent)
- Follow the existing dark palette: `slate-950` / `slate-900` / `slate-800` surfaces,
  `sky-400` accent, `slate-100` / `slate-400` text.
- **NEVER** introduce a new colour scale (`violet-*`, `emerald-*`, `indigo-*`, …) for a
  one-off component. Match the neighbouring component.
- Semantic status colours reuse Tailwind's own scale consistently across the app — pick the
  shade an adjacent component already uses rather than a new one.

## Inline Style Rule (Zero Tolerance)
- **NEVER** use an inline `style` prop for a static value that a Tailwind utility expresses
  (`style={{ color: 'white' }}`, `style={{ backgroundColor: '#0f172a' }}`).
- Inline `style` is **only permitted** for genuinely computed values — a progress width
  derived from data, a tenant brand colour returned by the API on the public booking surface.
- No CSS modules and no styled-components. Utilities in JSX; shared primitives in
  `src/index.css` under a plain CSS rule when a utility string is repeated app-wide.

## Glass & Depth Rule
- The one shared depth utility in this repo is `.glass`, defined in `src/index.css`
  (translucent `slate` fill + `blur(12px)` + hairline border).
- **NEVER** hand-roll `backdrop-blur-md bg-white/80 border border-white/20 shadow-xl`
  strings in JSX — use `.glass`.
- If a genuinely distinct depth level is needed (e.g. a modal above a glass card), add a
  named companion class to `src/index.css` and document it here. Do not inline it.

## Shared Primitive Mandate
- There is **no `src/components/ui/` primitive library yet**. Shared components currently
  live flat in `src/components/` (`Layout`, `StatusBoard`, `BookingWidget`,
  `CallTranscriptDrawer`).
- Before building a skeleton, spinner, badge, or progress bar: grep `src/components/` and
  `src/pages/` for an existing implementation and reuse it.
- The **third** time a pattern is needed, extract it to `src/components/ui/<Name>.tsx`, then
  add it to the table below in the same change. Do not create an empty primitive layer
  speculatively, and do not import a primitive that does not exist.

| Pattern | Primitive | Path | Status |
| :-- | :-- | :-- | :-- |
| _(none extracted yet)_ | — | — | Add a row when you extract one |

## Four UI States Rule (R4 — hard gate)
Every component that awaits the network renders **all four** states:

| State | Requirement |
| :-- | :-- |
| Loading | A skeleton or spinner. Never a blank panel — it reads as broken. |
| Empty | Explain what would appear and the action that fills it. Never a bare "No data". |
| Error | The failure in plain language **plus a retry affordance**. Never a silent `catch`. |
| Success | The data. |

`catch (e) {}` and `catch (e) { console.log(e) }` in a component are defects. Enforced by
`scripts/guards/ui-states.sh`.

## Network Boundary Rule (R5 — hard gate)
- All network access goes through `src/services/api.ts`. **NEVER** write an inline `fetch`
  in a component or page. Enforced by `scripts/guards/api-boundary.sh`.
- No hardcoded URLs, tenant IDs, or secrets — config comes from `import.meta.env`
  (R3, `scripts/guards/no-hardcoded-config.sh`).

## Multi-Tenant Vocabulary Rule
- **NEVER** hardcode a domain noun ("Doctor", "Patient", "Appointment" as a user-facing
  label). The same UI serves healthcare, salons, law firms, real estate, automotive and
  fitness.
- Pull every label from `src/services/vocabulary.ts`, keyed off the tenant's industry —
  `resourceLabel`, `customerLabel`, `serviceLabel`, `statusInProgress`. A hardcoded domain
  noun is a bug, not a nitpick.
- **White-labelling**: the public booking surface (`PublicBookingPage`, `BookingWidget`)
  renders the *tenant's* branding from the API. No platform branding on a tenant's page.

## Density & Glanceability Rule
- The staff surface (Dashboard, Calendar, Status Board, Call Logs, Analytics, Doctor
  Directory) is watched **while a receptionist is on a live phone call**. Information
  density and glanceability beat decoration.
- The public surface is calm and minimal. Do not apply staff-density patterns to it.

## Icons, Motion & Responsiveness
- Icons: **lucide-react only**. Match the surrounding size — `h-4 w-4` inline, `h-5 w-5` in
  headers. Decorative icons get `aria-hidden`.
- Mobile-first utilities; no horizontal page scroll. Wide tables scroll inside their own
  `overflow-x-auto` container.
- Motion is subtle and optional. Any entrance animation must not cause layout shift, and
  must respect `prefers-reduced-motion`.

## Accessibility Rule (R6 — hard gate)
- Interactive elements are real semantic elements (`<button>`, `<a>`), keyboard-reachable
  and labelled. No `onClick` on a bare `<div>`. Enforced by `scripts/guards/a11y.sh`.

## Definition of Done
`npm run verify` must exit 0 (`tsc -b` + `oxlint` + guards). There is no frontend test
suite. Never raise a count in `scripts/baseline.json` to make the gate pass.
