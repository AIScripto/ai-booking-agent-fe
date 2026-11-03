// ── Network boundary ────────────────────────────────────────────────────────
//
// R5: every HTTP call in this app goes through this module. No component or
// page may call `fetch` directly.
// ────────────────────────────────────────────────────────────────────────────

import { API_BASE_URL } from '../config/env';
import { AUTH_EXPIRED_EVENT, clearSession, getToken } from './session';
import type { SessionUser } from './session';

/**
 * Sends a request with the login token.
 *
 * The tenant is never sent: the server reads it from the verified token. If there is no token,
 * or the server answers 401, the session is cleared and the app returns to the login screen.
 *
 * @throws {Error} when not signed in or the session has expired.
 */
async function request(url: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  if (!token) {
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    throw new Error('Please sign in.');
  }

  const res = await fetch(url, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
      Authorization: `Bearer ${token}`,
    },
  });

  if (res.status === 401) {
    clearSession();
    window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    throw new Error('Your session has expired. Please sign in again.');
  }
  return res;
}

/**
 * Unwraps the canonical API envelope: `{ status, data }` on success,
 * `{ status: 'error', message }` on failure.
 *
 * @throws {Error} carrying the server's message when `status` is `'error'`.
 */
async function unwrap<T>(res: Response): Promise<T> {
  const result = await res.json();
  if (result.status === 'error') {
    throw new Error(result.message || `Request failed with status ${res.status}`);
  }
  return result.data as T;
}

/** A bookable provider. Never call this a "Doctor" in UI copy — see vocabulary.ts. */
export interface Resource {
  id: string;
  name: string;
  email: string;
  title?: string | null;
  departmentId?: string | null;
}

/** An organisational grouping of resources. */
export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  buildingLocation?: string;
  isHipaaRestricted?: boolean;
  maxDailyBookings?: number;
}

/** A bookable service offered by the tenant. */
export interface ServiceType {
  id: string;
  name: string;
  durationMinutes?: number;
}

/**
 * Tenant identity, white-label branding and bookable inventory.
 * Shape mirrors `GET /api/v1/tenant/branding`.
 */
export interface TenantBranding {
  tenantId: string;
  name: string;
  industry: string;
  branding: Record<string, unknown> | null;
  resources: Resource[];
  serviceTypes: ServiceType[];
  departments: Department[];
}

/** Industry-specific label set. Shape mirrors `GET /api/v1/tenant/vocabulary`. */
export interface TenantVocabularyResponse {
  tenantId: string;
  tenantName: string;
  industry: string;
  vocabulary: {
    resourceLabel: string;
    customerLabel: string;
    serviceLabel: string;
    statusInProgress: string;
  };
}

/** Video consultation providers the backend can provision a room with. */
export type TelehealthProvider = 'DAILY' | 'ZOOM' | 'GOOGLE_MEET';

/** A provisioned video consultation room. */
export interface TelehealthRoom {
  roomUrl: string;
  provider?: TelehealthProvider;
  expiresAt?: string | null;
}

export interface Appointment {
  id: string;
  tenantId: string;
  calendarId: string;
  appointmentDateTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  status: string;
  googleEventId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CallLog {
  id: string;
  tenantId: string;
  voiceAgentId: string | null;
  callSid: string | null;
  duration: number | null;
  status: string;
  /** Only present when a single log is fetched with getCallLog. */
  transcript?: string | null;
  /** Only present when a single log is fetched with getCallLog. */
  payload?: any;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  purpose: string | null;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  // ── Sign-in ───────────────────────────────────────────────────────────────

  /**
   * Signs in with email and password. Uses plain `fetch` because there is no token yet.
   *
   * @throws {Error} with the server's message (wrong credentials, too many attempts).
   */
  async login(email: string, password: string): Promise<{ token: string; user: SessionUser }> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return unwrap<{ token: string; user: SessionUser }>(res);
  },

  /**
   * The signed-in user. Used at start-up to check that a stored token still works.
   *
   * @throws {Error} when the token is missing, expired or the user is disabled.
   */
  async getMe(): Promise<SessionUser> {
    const res = await request(`${API_BASE_URL}/auth/me`);
    return unwrap<SessionUser>(res);
  },

  /**
   * Fetches appointments, optionally filtered by a specific date (YYYY-MM-DD).
   */
  async getAppointments(date?: string): Promise<Appointment[]> {
    const url = date ? `${API_BASE_URL}/appointments?date=${date}` : `${API_BASE_URL}/appointments`;
    const res = await request(url, {
      method: 'GET'
    });
    const result = await res.json();
    if (result.status === 'error') {
      throw new Error(result.message);
    }
    return result.data || [];
  },

  /**
   * Creates a new appointment.
   */
  async createAppointment(data: {
    dateTime: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string | null;
  }): Promise<Appointment> {
    const res = await request(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    const result = await res.json();
    if (result.status === 'error') {
      throw new Error(result.message);
    }
    return result.data;
  },

  /**
   * Cancels an appointment.
   */
  async cancelAppointment(id: string): Promise<void> {
    const res = await request(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE'
    });
    const result = await res.json();
    if (result.status === 'error') {
      throw new Error(result.message);
    }
  },

  /**
   * Fetches the call logs for the tenant.
   */
  async getCallLogs(): Promise<CallLog[]> {
    const res = await request(`${API_BASE_URL}/appointments/logs`, {
      method: 'GET'
    });
    const result = await res.json();
    if (result.status === 'error') {
      throw new Error(result.message);
    }
    return result.data || [];
  },

  /**
   * Fetches one call log including transcript and payload.
   */
  async getCallLog(id: string): Promise<CallLog> {
    const res = await request(`${API_BASE_URL}/appointments/logs/${encodeURIComponent(id)}`, {
      method: 'GET'
    });
    const result = await res.json();
    if (result.status === 'error') {
      throw new Error(result.message);
    }
    return result.data;
  },

  /**
   * Gets the Google OAuth consent redirect URL for the signed-in admin's own tenant.
   */
  async getGoogleAuthUrl(): Promise<string> {
    const res = await request(`${API_BASE_URL}/auth/google`, {
      method: 'GET',
    });
    const result = await res.json();
    if (result.status === 'error') {
      throw new Error(result.message);
    }
    return result.authUrl;
  },

  // ── Tenant ────────────────────────────────────────────────────────────────

  /**
   * Tenant branding, resources (providers) and departments.
   *
   * For the signed-in user's own tenant (the server reads it from the token).
   *
   * @throws {Error} when not signed in or the API returns an error.
   */
  async getBranding(): Promise<TenantBranding> {
    const res = await request(`${API_BASE_URL}/tenant/branding`);
    return unwrap<TenantBranding>(res);
  },

  /**
   * Industry-specific label set for the tenant.
   *
   * @see src/services/vocabulary.ts — never hardcode a domain noun in the UI.
   * @throws {Error} when not signed in or the API returns an error.
   */
  async getVocabulary(): Promise<TenantVocabularyResponse> {
    const res = await request(`${API_BASE_URL}/tenant/vocabulary`);
    return unwrap<TenantVocabularyResponse>(res);
  },

  // ── Resources (providers) ─────────────────────────────────────────────────

  /**
   * Onboards a new bookable resource for the tenant.
   *
   * @security Tenant-scoped: the server derives ownership from the login token. Admins only.
   * @throws {Error} when not signed in or the API returns an error.
   */
  async createResource(input: {
    name: string;
    email: string;
    title?: string;
    departmentId?: string;
  }): Promise<Resource> {
    const res = await request(`${API_BASE_URL}/tenant/resources`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return unwrap<Resource>(res);
  },

  /**
   * Offboards a resource, removing it from active booking availability.
   *
   * @security Tenant-scoped: the server derives ownership from the login token. Admins only.
   * @throws {Error} when not signed in or the API returns an error.
   */
  async deleteResource(resourceId: string): Promise<void> {
    const res = await request(
      `${API_BASE_URL}/tenant/resources/${encodeURIComponent(resourceId)}`,
      { method: 'DELETE' }
    );
    await unwrap<unknown>(res);
  },

  // ── Telehealth ────────────────────────────────────────────────────────────

  /**
   * Creates a video consultation room for an appointment and returns its URL.
   *
   * @security Tenant-scoped via the login token. This endpoint does
   *   NOT take an API key — the webhook key belongs to the voice provider and
   *   must never be shipped in a browser bundle.
   * @throws {Error} when not signed in or the API returns an error.
   */
  async createTelehealthRoom(
    appointmentId: string,
    provider: TelehealthProvider = 'DAILY'
  ): Promise<TelehealthRoom> {
    const res = await request(
      `${API_BASE_URL}/appointments/${encodeURIComponent(appointmentId)}/telehealth`,
      { method: 'POST', body: JSON.stringify({ provider }) }
    );
    return unwrap<TelehealthRoom>(res);
  },
};
