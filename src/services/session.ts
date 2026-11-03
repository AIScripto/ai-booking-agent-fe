// ── Signed-in session ───────────────────────────────────────────────────────
//
// Single place that holds the login token and the signed-in user for this browser.
// The tenant is NOT chosen here or sent by the browser: the server reads it from the
// verified token. `user.tenantId` is for display only.
//
// The token lives in localStorage, so any script running on the page could read it.
// Keep third-party scripts off this app. Moving it to an httpOnly cookie is a later step.
// ────────────────────────────────────────────────────────────────────────────

const TOKEN_KEY = 'auth_token';
const USER_KEY = 'auth_user';
// Keys used by the old fake login. Removed on sign-in and sign-out so nothing stale stays.
const LEGACY_KEYS = ['tenant_id'];

/** Dispatched on `window` when the server says the token is no longer valid. */
export const AUTH_EXPIRED_EVENT = 'auth:expired';

export type UserRole = 'ADMIN' | 'PROVIDER' | 'FRONT_DESK' | 'PATIENT';

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  tenantId: string;
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/** The login token, or `null` when not signed in. */
export function getToken(): string | null {
  return read(TOKEN_KEY);
}

/** The signed-in user stored at login, or `null`. */
export function getSessionUser(): SessionUser | null {
  const raw = read(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionUser;
  } catch {
    return null;
  }
}

/** Stores the session returned by a successful login. */
export function setSession(token: string, user: SessionUser): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Storage blocked (private window): the user simply stays signed out.
  }
}

/** Forgets the session. Called on sign-out and when the token stops working. */
export function clearSession(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    // Nothing to clear if storage is blocked.
  }
}
