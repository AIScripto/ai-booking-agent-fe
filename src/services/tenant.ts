// ── Active tenant resolution ────────────────────────────────────────────────
//
// Single source of truth for "which tenant is this browser acting as". Replaces
// the `localStorage.getItem('tenant_id') || '<hardcoded uuid>'` pattern that was
// duplicated across eight call sites — every one of which silently fell back to
// one specific seeded tenant when storage was empty (R3, and a cross-tenant
// hazard the moment a second tenant exists).
// ────────────────────────────────────────────────────────────────────────────

import { DEFAULT_TENANT_ID } from '../config/env';

const STORAGE_KEY = 'tenant_id';

/**
 * The tenant this session is acting as, or `null` when none is established.
 *
 * Resolution order: the value stored at login, then the optional build-time
 * development seed. There is deliberately no literal fallback — an unknown
 * tenant must surface as "not signed in", never as somebody else's data.
 */
export function getTenantId(): string | null {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_TENANT_ID || null;
}

/**
 * The active tenant, or a thrown error when none is established.
 *
 * Use at the start of any tenant-scoped request so the failure is caught by the
 * caller's error state instead of producing a request the API will reject.
 *
 * @throws {Error} when no tenant is set — surface this in the UI's error state.
 */
export function requireTenantId(): string {
  const tenantId = getTenantId();
  if (!tenantId) {
    throw new Error('No active tenant. Please sign in again.');
  }
  return tenantId;
}

/** Records the tenant for this browser. Called on successful login. */
export function setTenantId(tenantId: string): void {
  localStorage.setItem(STORAGE_KEY, tenantId);
}

/** Clears the tenant. Called on sign-out. */
export function clearTenantId(): void {
  localStorage.removeItem(STORAGE_KEY);
}
