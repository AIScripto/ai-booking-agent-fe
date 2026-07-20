import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { Appointment, CallLog } from '../services/api';
import { Calendar, Phone, CheckCircle, AlertCircle, Link } from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [callLogs, setCallLogs] = useState<CallLog[]>([]);
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

  const isCalendarConnected = appointments.some((a) => a.googleEventId !== null);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Notifications */}
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Grid Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Total Appointments */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center space-x-5 shadow-lg">
          <div className="bg-sky-500/10 p-4 rounded-xl text-sky-400">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Scheduled Slots</p>
            <h3 className="text-3xl font-extrabold mt-1">{appointments.length}</h3>
          </div>
        </div>

        {/* Card 2: Call Volume */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center space-x-5 shadow-lg">
          <div className="bg-cyan-500/10 p-4 rounded-xl text-cyan-400">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Voice Calls</p>
            <h3 className="text-3xl font-extrabold mt-1">{callLogs.length}</h3>
          </div>
        </div>

        {/* Card 3: Google Calendar Integration */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-5">
            <div className={`p-4 rounded-xl ${isCalendarConnected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
              {isCalendarConnected ? <CheckCircle className="w-6 h-6" /> : <AlertCircle className="w-6 h-6" />}
            </div>
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Google Sync</p>
              <h3 className="text-sm font-bold mt-1 text-slate-200">
                {isCalendarConnected ? 'Calendar Linked' : 'Integration Required'}
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

      {/* Grid Sections: Upcoming Appointments & Recent Voice Interactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Upcoming Appointments (Invites) */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-md font-bold tracking-wide">Upcoming Appointments (Invites)</h4>
            <button onClick={() => setActiveTab('calendar')} className="text-xs text-sky-400 font-bold hover:underline">
              View Calendar
            </button>
          </div>

          <div className="overflow-x-auto">
            {appointments.length === 0 ? (
              <div className="text-center py-8 space-y-2">
                <p className="text-sm text-slate-500">No scheduled appointments.</p>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-750 text-sky-400 font-bold text-xs rounded-lg transition-colors"
                >
                  Book Manually
                </button>
              </div>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 font-bold border-b border-slate-800">
                    <th className="pb-3">Patient</th>
                    <th className="pb-3">Date & Time</th>
                    <th className="pb-3">Booked At</th>
                    <th className="pb-3 text-right">Google Sync</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {appointments.slice(0, 5).map((appt) => (
                    <tr key={appt.id} className="text-slate-300 hover:bg-slate-850/10 transition-colors">
                      <td className="py-3.5 font-semibold text-slate-200">
                        {appt.customerName}
                      </td>
                      <td className="py-3.5 text-xs">
                        {new Date(appt.appointmentDateTime).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 text-xs text-slate-400">
                        {new Date(appt.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 text-right">
                        {appt.googleEventId ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-950/40 border border-emerald-900/40 text-emerald-400">
                            Synced
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950/40 border border-amber-900/40 text-amber-400">
                            Pending
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right Column: Recent Voice Interactions */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-md font-bold tracking-wide">Recent Voice Interactions</h4>
            <button onClick={() => setActiveTab('logs')} className="text-xs text-cyan-400 font-bold hover:underline">
              View All Logs
            </button>
          </div>

          <div className="overflow-x-auto">
            {callLogs.length === 0 ? (
              <p className="text-sm text-slate-500 text-center py-8">No voice calls logged yet.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-xs text-slate-500 font-bold border-b border-slate-800">
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Session ID</th>
                    <th className="pb-3 text-right">Webhook Event</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {callLogs.slice(0, 5).map((log) => (
                    <tr key={log.id} className="text-slate-300 hover:bg-slate-850/10 transition-colors">
                      <td className="py-3.5 text-xs">
                        {new Date(log.createdAt).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="py-3.5 font-mono text-[10px] text-slate-400 max-w-[120px] truncate">
                        {log.callSid || 'N/A'}
                      </td>
                      <td className="py-3.5 text-right">
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-950 border border-slate-850 text-slate-400 capitalize">
                          {log.status.split(':')[1] || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Horizontal Action Panels */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400">Quick Navigation</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => setActiveTab('calendar')}
            className="text-left px-5 py-4 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-sky-500/30 rounded-xl transition-all duration-200"
          >
            <p className="text-sm font-bold text-sky-400">Bookings Calendar</p>
            <p className="text-xs text-slate-500 mt-1">Check timeline schedule and book slots.</p>
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className="text-left px-5 py-4 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-cyan-500/30 rounded-xl transition-all duration-200"
          >
            <p className="text-sm font-bold text-cyan-400">Transcripts & Logs</p>
            <p className="text-xs text-slate-500 mt-1">Read conversation logs and payload debugs.</p>
          </button>
          <button
            onClick={handleConnectCalendar}
            disabled={googleAuthLoading}
            className="text-left px-5 py-4 bg-slate-950 hover:bg-slate-850 border border-slate-850 hover:border-emerald-500/30 rounded-xl transition-all duration-200"
          >
            <p className="text-sm font-bold text-emerald-400">Google Calendar Auth</p>
            <p className="text-xs text-slate-500 mt-1">Connect or link Google account events.</p>
          </button>
        </div>
      </div>
    </div>
  );
};
