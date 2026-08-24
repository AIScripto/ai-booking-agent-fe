import React, { useState, useEffect } from 'react';
import { useVocabulary } from '../services/vocabulary';
import { api } from '../services/api';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Mail,
  CheckCircle2,
  ShieldCheck,
  Video,
  FileText,
  AlertCircle,
  Stethoscope,
  Sparkles,
} from 'lucide-react';

export interface DoctorResource {
  id: string;
  name: string;
  email: string;
  title?: string | null;
}

export const PublicBookingPage: React.FC = () => {
  const { vocabulary, industry } = useVocabulary();

  const [doctors, setDoctors] = useState<DoctorResource[]>([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>('ANY');

  const [selectedDate, setSelectedDate] = useState<string>('2026-08-12');
  const [selectedTime, setSelectedTime] = useState<string>('10:30 AM');
  const [serviceType, setServiceType] = useState<string>('General Medical Consultation');
  const [isVirtual, setIsVirtual] = useState<boolean>(true);

  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [bookingResult, setBookingResult] = useState<any>(null);

  const availableSlots = ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

  useEffect(() => {
    const tenantId = localStorage.getItem('tenant_id') || '9eb441c7-f788-4137-8043-d4d7c3080879';
    fetch(`http://localhost:5000/api/v1/tenant/branding?tenant_id=${tenantId}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.status === 'success' && res.data?.resources) {
          setDoctors(res.data.resources);
        }
      })
      .catch((err) => console.error('[PublicBookingPage] Error fetching resources:', err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName || !customerPhone) {
      setError('Please provide full name and phone number.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const isoDateTime = `${selectedDate}T${selectedTime === '09:00 AM' ? '09:00:00' : selectedTime === '10:30 AM' ? '10:30:00' : selectedTime === '02:00 PM' ? '14:00:00' : selectedTime === '03:30 PM' ? '15:30:00' : '17:00:00'}.000Z`;

      const selectedDoc = doctors.find((d) => d.id === selectedDoctorId);

      const result = await api.createAppointment({
        dateTime: isoDateTime,
        customerName,
        customerPhone,
        customerEmail: customerEmail || undefined,
      });

      setBookingResult({
        ...result,
        assignedDoctor: selectedDoc ? selectedDoc.name : 'Dr. Sarah Jenkins (Auto Allocated)',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit manual booking.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-3">
              <ShieldCheck className="w-3.5 h-3.5" /> Self-Service Online Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
              Book a {vocabulary.serviceLabel} Online
            </h1>
            <p className="text-sm text-slate-400 mt-1">
              Select your preferred {vocabulary.resourceLabel.toLowerCase()}, date, and time slot below.
            </p>
          </div>

          <div className="bg-slate-950 px-4 py-2.5 rounded-xl border border-slate-800 text-xs">
            <span className="text-slate-500 block uppercase font-bold text-[10px]">Active Industry Preset</span>
            <span className="text-sky-400 font-bold">{industry}</span>
          </div>
        </div>
      </div>

      {/* Main Booking Form / Result Container */}
      {bookingResult ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-extrabold text-slate-100">Booking Confirmed!</h2>
            <p className="text-sm text-slate-400">
              Your {vocabulary.serviceLabel.toLowerCase()} is locked in our system.
            </p>
          </div>

          <div className="max-w-md mx-auto bg-slate-950 border border-slate-800 p-5 rounded-xl text-left space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">{vocabulary.resourceLabel}:</span>
              <span className="font-bold text-sky-400">{bookingResult.assignedDoctor}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">{vocabulary.customerLabel}:</span>
              <span className="font-bold text-slate-200">{bookingResult.customerName}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Phone:</span>
              <span className="font-mono text-sky-400">{bookingResult.customerPhone}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800/80 pb-2">
              <span className="text-slate-400">Date & Time:</span>
              <span className="font-mono text-sky-400 font-bold">{bookingResult.appointmentDateTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Status:</span>
              <span className="font-bold text-emerald-400 uppercase">{bookingResult.status}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setBookingResult(null)}
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs rounded-xl shadow-lg transition-colors"
            >
              Book Another Appointment
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Multi-Doctor / Consultant Selection */}
          <div className="space-y-3">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Stethoscope className="w-4 h-4 text-sky-400" /> 1. Select {vocabulary.resourceLabel}
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Option 0: Auto Round-Robin */}
              <button
                type="button"
                onClick={() => setSelectedDoctorId('ANY')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  selectedDoctorId === 'ANY'
                    ? 'bg-sky-500/10 border-sky-500 text-sky-300 ring-1 ring-sky-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-slate-200 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Any Available {vocabulary.resourceLabel}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  Automatic Round-Robin load-balanced allocation
                </div>
              </button>

              {/* Doctor Resource Cards */}
              {doctors.map((doc) => (
                <button
                  type="button"
                  key={doc.id}
                  onClick={() => setSelectedDoctorId(doc.id)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    selectedDoctorId === doc.id
                      ? 'bg-sky-500/10 border-sky-500 text-sky-300 ring-1 ring-sky-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-slate-200">{doc.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {doc.title || 'Specialist Consultant'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 2: Service Selection */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-sky-400" /> 2. Choose Service Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              {[
                { name: 'General Medical Consultation', desc: '30 min standard session' },
                { name: 'Specialist Evaluation', desc: '45 min in-depth session' },
                { name: 'Follow-Up Review', desc: '15 min quick check-in' },
              ].map((srv) => (
                <button
                  type="button"
                  key={srv.name}
                  onClick={() => setServiceType(srv.name)}
                  className={`p-3.5 rounded-xl border text-left transition-all ${
                    serviceType === srv.name
                      ? 'bg-sky-500/10 border-sky-500 text-sky-300 ring-1 ring-sky-500'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-bold text-slate-200">{srv.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{srv.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Section 3: Date & Time Picker */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <CalendarIcon className="w-4 h-4 text-sky-400" /> 3. Select Date & Time Slot
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="block text-slate-400 text-xs mb-1 font-semibold">Target Date</span>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <span className="block text-slate-400 text-xs mb-1 font-semibold">Available Time Slots</span>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedTime(slot)}
                      className={`py-2.5 px-2 text-xs font-mono font-bold rounded-lg border transition-all text-center ${
                        selectedTime === slot
                          ? 'bg-sky-600 text-white border-sky-500 shadow-md shadow-sky-600/20'
                          : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Consultation Format Toggle */}
          <div className="space-y-3 pt-4 border-t border-slate-800/80">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Video className="w-4 h-4 text-emerald-400" /> 4. Consultation Format
            </label>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <button
                type="button"
                onClick={() => setIsVirtual(true)}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                  isVirtual
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Video className="w-4 h-4" /> Telehealth Video Room (Daily.co)
              </button>
              <button
                type="button"
                onClick={() => setIsVirtual(false)}
                className={`p-3 rounded-xl border flex items-center justify-center gap-2 font-semibold transition-all ${
                  !isVirtual
                    ? 'bg-sky-500/10 border-sky-500 text-sky-300 ring-1 ring-sky-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <User className="w-4 h-4" /> In-Person Office Visit
              </button>
            </div>
          </div>

          {/* Section 5: Customer Contact Info */}
          <div className="space-y-4 pt-4 border-t border-slate-800/80 text-xs">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <User className="w-4 h-4 text-sky-400" /> 5. {vocabulary.customerLabel} Contact Information
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="block text-slate-400 mb-1 font-semibold">{vocabulary.customerLabel} Full Name *</span>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Michael Scott"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <span className="block text-slate-400 mb-1 font-semibold">Phone Number *</span>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="+1 555-0199"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <span className="block text-slate-400 mb-1 font-semibold">Email Address (Optional)</span>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="michael@example.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <span className="block text-slate-400 mb-1 font-semibold">Special Instructions / Reason for Visit</span>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Describe any symptoms, requirements, or notes for provider..."
                rows={3}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-extrabold text-sm rounded-xl transition-all shadow-xl shadow-sky-600/20 flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Clock className="w-4 h-4" />
            )}
            <span>{loading ? 'Processing Booking...' : `Confirm ${vocabulary.serviceLabel} Booking`}</span>
          </button>
        </form>
      )}
    </div>
  );
};
