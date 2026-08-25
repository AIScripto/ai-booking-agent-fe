// ── Network boundary ────────────────────────────────────────────────────────
//
// R5: every HTTP call in this app goes through this module. No component or
// page may call `fetch` directly.
// ────────────────────────────────────────────────────────────────────────────

import { API_BASE_URL } from '../config/env';
import { requireTenantId } from './tenant';

/**
 * Standard headers for a tenant-scoped request.
 *
 * @throws {Error} when no tenant is established — see `requireTenantId`.
 */
const getHeaders = () => ({
  'Content-Type': 'application/json',
  'x-tenant-id': requireTenantId(),
});

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
  transcript: string | null;
  payload: any;
  customerName: string | null;
  customerPhone: string | null;
  customerEmail: string | null;
  purpose: string | null;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  /**
   * Fetches appointments, optionally filtered by a specific date (YYYY-MM-DD).
   */
  async getAppointments(date?: string): Promise<Appointment[]> {
    const url = date ? `${API_BASE_URL}/appointments?date=${date}` : `${API_BASE_URL}/appointments`;
    const res = await fetch(url, {
      method: 'GET',
      headers: getHeaders(),
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
    const res = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: getHeaders(),
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
    const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
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
    const res = await fetch(`${API_BASE_URL}/appointments/logs`, {
      method: 'GET',
      headers: getHeaders(),
    });
    const result = await res.json();
    if (result.status === 'error') {
      throw new Error(result.message);
    }
    return result.data || [];
  },

  /**
   * Gets the Google OAuth consent redirect URL.
   */
  async getGoogleAuthUrl(tenantId: string): Promise<string> {
    const res = await fetch(`${API_BASE_URL}/auth/google?tenant_id=${tenantId}`, {
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
   * Public: also serves the white-labelled booking surface, which has no
   * signed-in user, so the tenant travels as a query parameter.
   *
   * @throws {Error} when no tenant is established or the API returns an error.
   */
  async getBranding(): Promise<TenantBranding> {
    const res = await fetch(
      `${API_BASE_URL}/tenant/branding?tenant_id=${encodeURIComponent(requireTenantId())}`
    );
    return unwrap<TenantBranding>(res);
  },

  /**
   * Industry-specific label set for the tenant.
   *
   * @see src/services/vocabulary.ts — never hardcode a domain noun in the UI.
   * @throws {Error} when no tenant is established or the API returns an error.
   */
  async getVocabulary(): Promise<TenantVocabularyResponse> {
    const res = await fetch(
      `${API_BASE_URL}/tenant/vocabulary?tenant_id=${encodeURIComponent(requireTenantId())}`
    );
    return unwrap<TenantVocabularyResponse>(res);
  },

  // ── Resources (providers) ─────────────────────────────────────────────────

  /**
   * Onboards a new bookable resource for the tenant.
   *
   * @security Tenant-scoped: the server derives ownership from the tenant header.
   * @throws {Error} when no tenant is established or the API returns an error.
   */
  async createResource(input: {
    name: string;
    email: string;
    title?: string;
    departmentId?: string;
  }): Promise<Resource> {
    const res = await fetch(`${API_BASE_URL}/tenant/resources`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ tenantId: requireTenantId(), ...input }),
    });
    return unwrap<Resource>(res);
  },

  /**
   * Offboards a resource, removing it from active booking availability.
   *
   * @security Tenant-scoped: the server derives ownership from the tenant header.
   * @throws {Error} when no tenant is established or the API returns an error.
   */
  async deleteResource(resourceId: string): Promise<void> {
    const res = await fetch(
      `${API_BASE_URL}/tenant/resources/${encodeURIComponent(resourceId)}`,
      { method: 'DELETE', headers: getHeaders() }
    );
    await unwrap<unknown>(res);
  },

  // ── Telehealth ────────────────────────────────────────────────────────────

  /**
   * Creates a video consultation room for an appointment and returns its URL.
   *
   * @security Tenant-scoped via the `x-tenant-id` header. This endpoint does
   *   NOT take an API key — the webhook key belongs to the voice provider and
   *   must never be shipped in a browser bundle.
   * @throws {Error} when no tenant is established or the API returns an error.
   */
  async createTelehealthRoom(
    appointmentId: string,
    provider: TelehealthProvider = 'DAILY'
  ): Promise<TelehealthRoom> {
    const res = await fetch(
      `${API_BASE_URL}/appointments/${encodeURIComponent(appointmentId)}/telehealth`,
      { method: 'POST', headers: getHeaders(), body: JSON.stringify({ provider }) }
    );
    return unwrap<TelehealthRoom>(res);
  },
};
