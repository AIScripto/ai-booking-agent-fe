const API_BASE_URL = 'http://localhost:5000/api/v1';

const getHeaders = () => {
  const tenantId = localStorage.getItem('tenant_id') || '9eb441c7-f788-4137-8043-d4d7c3080879';
  return {
    'Content-Type': 'application/json',
    'x-tenant-id': tenantId,
  };
};

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
};
