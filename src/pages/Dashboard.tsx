import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Appointment, CallLog } from '../services/api';
import { useVocabulary } from '../services/vocabulary';
import { StatusBoard } from '../components/StatusBoard';
import type { BookingItem } from '../components/StatusBoard';
import { CallTranscriptDrawer } from '../components/CallTranscriptDrawer';
import { Calendar, Phone, CheckCircle, AlertCircle, Link, Layers } from 'lucide-react';


interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = () => {
  const { vocabulary, industry } = useVocabulary();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [googleAuthLoading, setGoogleAuthLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appts, logs] = await Promise.all([
          api.getAppointments(),
          api.getCallLogs(),
        ]);
        setAppointments(appts);
        setCallLogs(logs);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleConnectCalendar = async () => {
    setGoogleAuthLoading(true);
    try {
      const tenantId = localStorage.getItem('tenant_id') || '9eb441c7-f788-4137-8043-d4d7c3080879';
      const authUrl = await api.getGoogleAuthUrl(tenantId);
      window.open(authUrl, '_blank');
    } catch (err: any) {
      alert(`OAuth Error: ${err.message}`);
    } finally {
      setGoogleAuthLoading(false);
    }
  };

  const handleStatusChange = (id: string, newStatus: string) => {
    setAppointments((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const isCalendarConnected = appointments.some((a) => a.googleEventId !== null);

  // Map backend appointments to StatusBoard BookingItem format
  const mappedBookings: BookingItem[] = appointments.map((a) => ({
    id: a.id,
    customerName: a.customerName,
    customerPhone: a.customerPhone,
    customerEmail: a.customerEmail,
    appointmentDateTime: a.appointmentDateTime,
    status: a.status || 'SCHEDULED',
    providerName: 'Dr. Sarah Jenkins',
    serviceName: 'General Consultation',
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Industry Preset Badge Header */}
      <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-lg">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wide">
              Active Industry Preset: <span className="text-sky-400">{industry}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Adapted Labels: {vocabulary.resourceLabel} • {vocabulary.customerLabel} • {vocabulary.serviceLabel}
            </p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Grid Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center space-x-5 shadow-lg">
          <div className="bg-sky-500/10 p-4 rounded-xl text-sky-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
              {vocabulary.customerLabel} Bookings
            </p>
            <h3 className="text-3xl font-extrabold mt-1">{appointments.length}</h3>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center space-x-5 shadow-lg">
          <div className="bg-cyan-500/10 p-4 rounded-xl text-cyan-400">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Voice Calls</p>
            <h3 className="text-3xl font-extrabold mt-1">{callLogs.length}</h3>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-5">
            <div className={`p-4 rounded-xl ${isCalendarConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {isCalendarConnected ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Calendar Sync</p>
              <h3 className="text-sm font-bold mt-1 text-slate-200">
                {isCalendarConnected ? 'Google Sync Active' : 'Sync Required'}
              </h3>
            </div>
          </div>
          {!isCalendarConnected && (
            <button
              onClick={handleConnectCalendar}
              disabled={googleAuthLoading}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-sky-500 hover:bg-sky-600 text-slate-950 font-bold text-xs rounded-lg transition-colors"
            >
              <Link className="w-3.5 h-3.5" />
              <span>Link</span>
            </button>
          )}
        </div>
      </div>

      {/* Live Status Board Component */}
      <StatusBoard
        bookings={mappedBookings}
        vocabulary={vocabulary}
        onSelectBooking={(b) => setSelectedBooking(b)}
        onStatusChange={handleStatusChange}
      />

      {/* Voice Call & Clinical Context Drawer */}
      <CallTranscriptDrawer
        booking={selectedBooking}
        vocabulary={vocabulary}
        onClose={() => setSelectedBooking(null)}
        onSaveNotes={(id, notes) => console.log(`Saved notes for ${id}:`, notes)}
      />
    </div>
  );
};
