/// <reference types="vite/client" />

/**
 * Typed contract for the build-time environment (R3).
 *
 * Every `VITE_*` value is inlined into the production bundle and is readable by
 * anyone who loads the app. Never declare a secret here.
 *
 * @see src/config/env.ts — the single place these are read.
 */
interface ImportMetaEnv {
  /** Base URL for the API, e.g. `/api/v1` behind nginx. */
  readonly VITE_API_BASE_URL?: string;
  /** Development convenience: pre-seeds the tenant so you can skip login. */
  readonly VITE_DEFAULT_TENANT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
