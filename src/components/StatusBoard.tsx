import React, { useState } from 'react';
import { User, Calendar, Clock, CheckCircle2, AlertCircle, PlayCircle, XCircle, FileText, Video, Check } from 'lucide-react';
import type { IndustryVocabulary } from '../services/vocabulary';
import { api } from '../services/api';
import { formatDateTime } from '../services/time';


export interface BookingItem {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  appointmentDateTime: string;
  status: string;
  /** Only shown when the data really has them (appointments do not record a provider or service yet). */
  providerName?: string;
  serviceName?: string;
}

interface StatusBoardProps {
  bookings: BookingItem[];
  vocabulary: IndustryVocabulary;
  /** The business's time zone: times are stored in UTC and shown in this zone. */
  timeZone: string;
  onSelectBooking?: (booking: BookingItem) => void;
}

export const StatusBoard: React.FC<StatusBoardProps> = ({
  bookings,
  vocabulary,
  timeZone,
  onSelectBooking,
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loadingVideoId, setLoadingVideoId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<{ id: string; message: string } | null>(null);

  const handleGenerateVideoLink = async (booking: BookingItem) => {
    setLoadingVideoId(booking.id);
    setVideoError(null);
    try {
      const { roomUrl } = await api.createTelehealthRoom(booking.id, 'DAILY');
      navigator.clipboard.writeText(roomUrl);
      setCopiedId(booking.id);
      setTimeout(() => setCopiedId(null), 3000);
      window.open(roomUrl, '_blank', 'noopener,noreferrer');
    } catch (err) {
      // Rooms are provisioned per booking and there is no shared fallback room,
      // so a failure here means there is no link — say so instead of appearing
      // to have opened one.
      setVideoError({
        id: booking.id,
        message: err instanceof Error ? err.message : 'Could not start the video room.',
      });
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
      case 'SCHEDULED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3.5 h-3.5" /> Scheduled
          </span>
        );
      default:
        // An unknown status is shown as it is, never relabelled as something it is not.
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  // Only the statuses that really occur, and only when there is more than one to choose from.
  const presentStatuses = [...new Set(bookings.map((b) => b.status.toUpperCase()))];
  const showProvider = bookings.some((b) => b.providerName);
  const showService = bookings.some((b) => b.serviceName);

  const filteredBookings = filterStatus === 'ALL'
    ? bookings
    : bookings.filter((b) => b.status.toUpperCase() === filterStatus);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xl">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" aria-hidden="true" /> Scheduled appointments
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {bookings.length} scheduled, in time order. Times are shown in {timeZone}.
          </p>
        </div>

        {/* Status filter: only when the data has more than one status */}
        {presentStatuses.length > 1 && (
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
          {['ALL', ...presentStatuses].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${filterStatus === st
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
            >
              {st === 'ALL' ? 'All' : st.replace('_', ' ')}
            </button>
          ))}
        </div>
        )}
      </div>

      {/* Bookings Table */}
      {filteredBookings.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-slate-800 rounded-lg">
          <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm text-slate-400">
            {bookings.length === 0 ? 'No appointments are scheduled.' : 'No appointments with this status.'}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950 text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">{vocabulary.customerLabel}</th>
                {showProvider && <th className="py-3 px-4">{vocabulary.resourceLabel}</th>}
                {showService && <th className="py-3 px-4">{vocabulary.serviceLabel}</th>}
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBookings.map((b) => {
                const dateObj = new Date(b.appointmentDateTime);
                const timeFormatted = isNaN(dateObj.getTime())
                  ? b.appointmentDateTime
                  : formatDateTime(b.appointmentDateTime, timeZone);

                return (
                  <tr key={b.id} className="hover:bg-slate-800/40 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-medium text-sky-400 whitespace-nowrap">
                      {timeFormatted}
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-100">
                      <div>{b.customerName}</div>
                      <div className="text-xs text-slate-400 font-mono">{b.customerPhone}</div>
                    </td>
                    {showProvider && <td className="py-3.5 px-4 text-slate-300">{b.providerName ?? '—'}</td>}
                    {showService && <td className="py-3.5 px-4 text-slate-300">{b.serviceName ?? '—'}</td>}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {getStatusBadge(b.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleGenerateVideoLink(b)}
                          disabled={loadingVideoId === b.id}
                          className={`p-1.5 rounded-lg border transition-colors flex items-center gap-1 disabled:opacity-60 disabled:cursor-not-allowed ${
                            videoError?.id === b.id
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/20'
                          }`}
                          aria-label={
                            videoError?.id === b.id
                              ? `Video room failed: ${videoError.message}. Activate to try again.`
                              : 'Generate and join video room'
                          }
                          title={
                            videoError?.id === b.id
                              ? `${videoError.message} — click to try again.`
                              : 'Generate & Join Daily.co Video Room'
                          }
                        >
                          {copiedId === b.id ? (
                            <Check className="w-4 h-4 text-emerald-300" aria-hidden="true" />
                          ) : videoError?.id === b.id ? (
                            <AlertCircle className="w-4 h-4" aria-hidden="true" />
                          ) : (
                            <Video
                              className={`w-4 h-4 ${loadingVideoId === b.id ? 'animate-spin' : ''}`}
                              aria-hidden="true"
                            />
                          )}
                        </button>
                        {onSelectBooking && (
                          <button
                            onClick={() => onSelectBooking(b)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                            aria-label="Open appointment details"
                            title="Open appointment details"
                          >
                            <FileText className="w-4 h-4 text-sky-400" />
                          </button>
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
