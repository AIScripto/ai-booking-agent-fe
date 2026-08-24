import React, { useState } from 'react';
import { X, Mic, User, Phone, Mail, Calendar, FileText, Check, Activity } from 'lucide-react';
import type { BookingItem } from './StatusBoard';
import type { IndustryVocabulary } from '../services/vocabulary';


interface CallTranscriptDrawerProps {
  booking: BookingItem | null;
  vocabulary: IndustryVocabulary;
  onClose: () => void;
  onSaveNotes?: (bookingId: string, notes: string) => void;
}

export const CallTranscriptDrawer: React.FC<CallTranscriptDrawerProps> = ({
  booking,
  vocabulary,
  onClose,
  onSaveNotes,
}) => {
  if (!booking) return null;

  const [notes, setNotes] = useState<string>('');
  const [saved, setSaved] = useState<boolean>(false);

  const handleSave = () => {
    if (onSaveNotes) {
      onSaveNotes(booking.id, notes);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm flex justify-end transition-opacity">
      <div className="w-full max-w-lg bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col justify-between overflow-y-auto">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-sky-400" />
            <h3 className="font-bold text-slate-100 text-base">
              {vocabulary.customerLabel} Context & Voice Log
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Customer Profile Card */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-sm">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-100 text-base">{booking.customerName}</h4>
                <p className="text-xs text-slate-400">{vocabulary.customerLabel} ID: #{booking.id.substring(0, 8)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/60">
              <div className="flex items-center gap-1.5 text-slate-300">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{booking.customerPhone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-300 truncate">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span className="truncate">{booking.customerEmail || 'No email provided'}</span>
              </div>
            </div>
          </div>

          {/* Appointment Metadata */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-sky-400" /> Date & Time:
              </span>
              <span className="font-mono text-sky-400 font-semibold">{booking.appointmentDateTime}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">{vocabulary.resourceLabel}:</span>
              <span>{booking.providerName || 'Dr. Sarah Jenkins'}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span className="text-slate-400">{vocabulary.serviceLabel}:</span>
              <span>{booking.serviceName || 'General Consultation'}</span>
            </div>
          </div>

          {/* AI Voice Call Transcript Context */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl space-y-3">
            <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-emerald-400" /> Voice AI Call Summary & Transcript
            </h5>
            
            <div className="p-3 bg-emerald-500/5 border border-emerald-500/20 rounded-lg text-xs text-emerald-300 leading-relaxed">
              <p className="font-medium">
                {booking.transcriptSummary ||
                  'Caller requested consultation slot for acute symptoms. Confirmed no previous complications. Locked 30-minute booking.'}
              </p>
            </div>
          </div>

          {/* Provider / Clinical Notes Editor */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-amber-400" /> {vocabulary.resourceLabel} Consultation Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={`Enter ${vocabulary.resourceLabel.toLowerCase()} consultation notes, medical observations, or follow-up instructions...`}
              rows={4}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors flex items-center gap-1.5"
          >
            {saved ? <Check className="w-4 h-4 text-emerald-300" /> : null}
            {saved ? 'Notes Saved!' : 'Save Consultation Notes'}
          </button>
        </div>
      </div>
    </div>
  );
};
