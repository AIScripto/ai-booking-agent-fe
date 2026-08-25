// ── Build-time configuration boundary ───────────────────────────────────────
//
// R3: no hardcoded hosts, ports, or tenant UUIDs anywhere in `src/`. This module
// is the ONLY place `import.meta.env` is read; everything else imports from here.
//
// Every VITE_* value is embedded in the production bundle and visible to every
// browser that loads the app. Never route a secret through this file.
// ────────────────────────────────────────────────────────────────────────────

/**
 * Base URL for all API calls.
 *
 * Defaults to the relative path `/api/v1`, which is what production uses: nginx
 * serves the SPA and reverse-proxies `/api/` to the `api` container, so the
 * browser never needs to know the backend's host or port. Set
 * `VITE_API_BASE_URL` in `.env` to point a local dev build at a running backend.
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

/**
 * Optional development seed for the active tenant.
 *
 * Empty in production: the tenant is established at login and read from storage.
 * Setting `VITE_DEFAULT_TENANT_ID` lets a developer load a tenant-scoped page
 * without signing in first.
 *
 * @see src/services/tenant.ts — resolution order lives there, not here.
 */
export const DEFAULT_TENANT_ID: string = import.meta.env.VITE_DEFAULT_TENANT_ID ?? '';
