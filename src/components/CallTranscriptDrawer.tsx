import React, { useEffect, useRef } from 'react';
import { X, Mic, User, Phone, Mail, Calendar, Activity } from 'lucide-react';
import type { BookingItem } from './StatusBoard';
import type { IndustryVocabulary } from '../services/vocabulary';
import type { CallLog } from '../services/api';
import { formatDateTime } from '../services/time';

interface CallTranscriptDrawerProps {
  booking: BookingItem | null;
  vocabulary: IndustryVocabulary;
  timeZone: string;
  /** The latest calls the server returned. Calls from the booking's phone number are shown. */
  calls: CallLog[];
  onClose: () => void;
}

const digits = (value: string | null | undefined): string => (value ?? '').replace(/\D/g, '');

/**
 * Details of one appointment, and the calls that came from the same phone number.
 * Everything shown is real data. If there is no call, no summary or no email, it says so.
 */
export const CallTranscriptDrawer: React.FC<CallTranscriptDrawerProps> = ({ booking, vocabulary, timeZone, calls, onClose }) => {
  const closeButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!booking) return;
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [booking, onClose]);

  if (!booking) return null;

  const phone = digits(booking.customerPhone);
  const callsFromThisNumber = phone ? calls.filter((c) => digits(c.customerPhone) === phone).slice(0, 3) : [];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="appointment-drawer-title"
        className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col justify-between overflow-y-auto"
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" aria-hidden="true" />
            <h3 id="appointment-drawer-title" className="font-bold text-slate-100 text-base">
              {vocabulary.customerLabel} details
            </h3>
          </div>
          <button
            ref={closeButton}
            onClick={onClose}
            aria-label="Close"
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <div className="p-6 space-y-6 flex-1">
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                <User className="w-5 h-5" aria-hidden="true" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-base">{booking.customerName}</h4>
                <p className="text-xs text-slate-400">Appointment ID: #{booking.id.substring(0, 8)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/60">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span>{booking.customerPhone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                <span className="truncate">{booking.customerEmail || 'No email recorded'}</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-400" aria-hidden="true" /> Date and time:
              </span>
              <span className="font-mono text-sky-400 font-semibold">{formatDateTime(booking.appointmentDateTime, timeZone)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">Status:</span>
              <span>{booking.status}</span>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-emerald-400" aria-hidden="true" /> Calls from this phone number
            </h5>

            {callsFromThisNumber.length === 0 ? (
              <p className="text-xs text-slate-400">
                No call from this number among the latest calls. Open the Call Transcripts page to see every call.
              </p>
            ) : (
              <ul className="space-y-3">
                {callsFromThisNumber.map((call) => (
                  <li key={call.id} className="p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-300 space-y-1">
                    <div className="flex justify-between text-slate-400">
                      <span>{formatDateTime(call.createdAt, timeZone)}</span>
                      <span>{call.status}</span>
                    </div>
                    <p className="leading-relaxed">{call.purpose || 'No summary was recorded for this call.'}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
