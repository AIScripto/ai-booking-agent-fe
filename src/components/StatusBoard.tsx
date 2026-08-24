import React, { useState } from 'react';
import { User, Calendar, Clock, CheckCircle2, AlertCircle, PlayCircle, XCircle, FileText, Video, Check } from 'lucide-react';
import type { IndustryVocabulary } from '../services/vocabulary';


export interface BookingItem {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  appointmentDateTime: string;
  status: string; // SCHEDULED, CHECKED_IN, IN_PROGRESS, COMPLETED, CANCELLED, NO_SHOW
  providerName?: string;
  serviceName?: string;
  transcriptSummary?: string;
  telehealthUrl?: string;
}

interface StatusBoardProps {
  bookings: BookingItem[];
  vocabulary: IndustryVocabulary;
  onSelectBooking?: (booking: BookingItem) => void;
  onStatusChange?: (id: string, newStatus: string) => void;
}

export const StatusBoard: React.FC<StatusBoardProps> = ({
  bookings,
  vocabulary,
  onSelectBooking,
  onStatusChange,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loadingVideoId, setLoadingVideoId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleGenerateVideoLink = async (booking: BookingItem) => {
    setLoadingVideoId(booking.id);
    try {
      const tenantId = localStorage.getItem('tenant_id') || '9eb441c7-f788-4137-8043-d4d7c3080879';
      const res = await fetch(`http://localhost:5000/api/v1/appointments/${booking.id}/telehealth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-tenant-id': tenantId,
          'x-api-key': 'supersecretapikey',
        },
        body: JSON.stringify({ provider: 'DAILY' }),
      });

      const result = await res.json();
      if (result.status === 'success' && result.data?.roomUrl) {
        const roomUrl = result.data.roomUrl;
        navigator.clipboard.writeText(roomUrl);
        setCopiedId(booking.id);
        setTimeout(() => setCopiedId(null), 3000);
        window.open(roomUrl, '_blank');
      }
    } catch (err) {
      console.error('[StatusBoard] Error generating video room:', err);
    } finally {
      setLoadingVideoId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'CHECKED_IN':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <User className="w-3.5 h-3.5" /> Checked-In
          </span>
        );
      case 'IN_PROGRESS':
      case 'IN_CONSULTATION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 animate-pulse">
            <PlayCircle className="w-3.5 h-3.5" /> {vocabulary.statusInProgress}
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Completed
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Cancelled
          </span>
        );
      case 'NO_SHOW':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <AlertCircle className="w-3.5 h-3.5" /> No-Show
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3.5 h-3.5" /> Scheduled
          </span>
        );
    }
  };

  const filteredBookings = filterStatus === 'ALL'
    ? bookings
    : bookings.filter((b) => b.status.toUpperCase() === filterStatus);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" /> Live Operational Queue
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time status tracking for {vocabulary.customerLabel}s and {vocabulary.resourceLabel}s
          </p>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {['ALL', 'SCHEDULED', 'CHECKED_IN', 'IN_PROGRESS', 'COMPLETED'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${
                filterStatus === st
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {st === 'ALL' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
          <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">No {vocabulary.customerLabel.toLowerCase()} appointments found in this status view.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">{vocabulary.customerLabel}</th>
                <th className="py-3 px-4">{vocabulary.resourceLabel}</th>
                <th className="py-3 px-4">{vocabulary.serviceLabel}</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBookings.map((b) => {
                const dateObj = new Date(b.appointmentDateTime);
                const timeFormatted = isNaN(dateObj.getTime())
                  ? b.appointmentDateTime
                  : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                return (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-medium text-sky-400 whitespace-nowrap">
                      {timeFormatted}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-100">
                      <div>{b.customerName}</div>
                      <div className="text-xs text-slate-400 font-mono">{b.customerPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {b.providerName || 'Dr. Sarah Jenkins'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">
                      {b.serviceName || 'General Consultation'}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(b.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleGenerateVideoLink(b)}
                          disabled={loadingVideoId === b.id}
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors flex items-center gap-1"
                          title="Generate & Join Daily.co Video Room"
                        >
                          {copiedId === b.id ? (
                            <Check className="w-4 h-4 text-emerald-300" />
                          ) : (
                            <Video className={`w-4 h-4 ${loadingVideoId === b.id ? 'animate-spin' : ''}`} />
                          )}
                        </button>
                        {onSelectBooking && (
                          <button
                            onClick={() => onSelectBooking(b)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            title="View Voice AI Transcript & Intake Notes"
                          >
                            <FileText className="w-4 h-4 text-sky-400" />
                          </button>
                        )}

                        {onStatusChange && (
                          <select
                            value={b.status.toUpperCase()}
                            onChange={(e) => onStatusChange(b.id, e.target.value)}
                            className="bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded-lg px-2 py-1 focus:ring-1 focus:ring-sky-500 focus:outline-none"
                          >
                            <option value="SCHEDULED">Scheduled</option>
                            <option value="CHECKED_IN">Check-In</option>
                            <option value="IN_PROGRESS">Start Session</option>
                            <option value="COMPLETED">Complete</option>
                            <option value="NO_SHOW">No-Show</option>
                            <option value="CANCELLED">Cancel</option>
                          </select>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
