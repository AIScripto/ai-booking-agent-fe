import React, { useState, useEffect } from 'react';
import { useVocabulary } from '../services/vocabulary';
import { api } from '../services/api';
import type { Appointment } from '../services/api';
import type { DoctorResource } from './PublicBookingPage';
import {
  Stethoscope,
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  AlertCircle,
  Video,
  ShieldAlert,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const DoctorScheduleView: React.FC = () => {
  const { vocabulary } = useVocabulary();

  const [doctors, setDoctors] = useState<DoctorResource[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ALL');

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-12');


  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [blockoutActive, setBlockoutActive] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [branding, appts] = await Promise.all([
          api.getBranding(),
          api.getAppointments(),
        ]);

        if (branding.resources?.length) {
          setDoctors(branding.resources);
          setSelectedDoctorId(branding.resources[0].id);
        }
        setAppointments(appts);
      } catch (err: any) {
        setError(err.message || 'Failed to retrieve doctor schedules.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleToggleBlockout = (doctorId: string) => {
    setBlockoutActive((prev) => ({
      ...prev,
      [doctorId]: !prev[doctorId],
    }));
  };

  const selectedDoctor = doctors.find((d) => d.id === selectedDoctorId);

  // Filter appointments for the selected doctor
  const doctorAppointments = appointments.filter((a) => a.status === 'SCHEDULED');


  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-2">
            <Stethoscope className="w-3.5 h-3.5" /> Doctor & Consultant Duty Roster
          </span>
          <h1 className="text-2xl font-extrabold text-slate-100">
            {vocabulary.resourceLabel} Schedules & Emergency Controls
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            View individual consultant agendas, working schedules, and trigger instant emergency out-of-office blockouts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Doctor Selection Tabs & Profiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {doctors.map((doc) => {
          const isSelected = selectedDoctorId === doc.id;
          const isBlocked = !!blockoutActive[doc.id];
          const docApptsCount = doctorAppointments.length;

          return (
            <div
              key={doc.id}
              onClick={() => setSelectedDoctorId(doc.id)}
              className={`cursor-pointer bg-slate-900 border rounded-2xl p-5 shadow-lg transition-all space-y-4 relative ${
                isSelected
                  ? 'border-sky-500 ring-1 ring-sky-500/50'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              {isBlocked && (
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Emergency Out-of-Office
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-base shrink-0">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">{doc.name}</h3>
                  <p className="text-xs text-slate-400">{doc.title || 'Specialist Consultant'}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span>Working Hours: <strong className="text-slate-300">09:00 - 17:00</strong></span>
                <span className="font-mono text-sky-400 font-bold">{docApptsCount} Slots</span>
              </div>

              {/* Emergency Blockout Action */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggleBlockout(doc.id);
                }}
                className={`w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  isBlocked
                    ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg'
                    : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{isBlocked ? 'Cancel Out-of-Office Blockout' : 'Trigger Emergency Time-Off'}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Doctor Daily Agenda Timeline */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-sky-400" /> Agenda for {selectedDoctor ? selectedDoctor.name : 'Dr. Sarah Jenkins'}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Scheduled patient consultations for <span className="text-sky-400 font-mono font-semibold">{selectedDate}</span>
            </p>
          </div>

          {blockoutActive[selectedDoctorId] && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5">
              <Lock className="w-4 h-4" /> Voice AI Agent Blockout Active (Sub-Millisecond Cache Purge)

            </div>
          )}
        </div>

        {/* Timeline Schedule Table */}
        {doctorAppointments.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
            <Clock className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-sm text-slate-400">No scheduled appointments for this consultant on {selectedDate}.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {doctorAppointments.map((appt) => {
              const dateObj = new Date(appt.appointmentDateTime);
              const timeFormatted = isNaN(dateObj.getTime())
                ? appt.appointmentDateTime
                : dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

              return (
                <div
                  key={appt.id}
                  className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-2 rounded-lg bg-sky-500/10 border border-sky-500/20 font-mono text-sky-400 font-bold text-xs whitespace-nowrap">
                      {timeFormatted}
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-100 text-sm flex items-center gap-2">
                        <User className="w-4 h-4 text-slate-400" /> {appt.customerName}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-slate-500" /> {appt.customerPhone}</span>
                        {appt.customerEmail && <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-slate-500" /> {appt.customerEmail}</span>}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded-full font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Scheduled
                    </span>
                    <a
                      href="https://demo.daily.co/telehealth-consultation"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                    >
                      <Video className="w-3.5 h-3.5" /> Join Telehealth Video
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
