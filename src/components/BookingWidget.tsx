import React, { useState } from 'react';
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { IndustryVocabulary } from '../services/vocabulary';


interface BookingWidgetProps {
  vocabulary: IndustryVocabulary;
  onBookingSubmitted?: (data: any) => void;
}

export const BookingWidget: React.FC<BookingWidgetProps> = ({
  vocabulary,
  onBookingSubmitted,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-11');
  const [selectedTime, setSelectedTime] = useState<string>('09:00 AM');
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [submitted, setSubmitted] = useState<boolean>(false);

  const timeSlots = ['09:00 AM', '10:30 AM', '02:00 PM', '03:30 PM', '05:00 PM'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const payload = {
      customerName: name,
      customerPhone: phone,
      customerEmail: email,
      appointmentDateTime: `${selectedDate}T${selectedTime}`,
    };

    setSubmitted(true);
    if (onBookingSubmitted) {
      onBookingSubmitted(payload);
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
        <ShieldCheck className="w-5 h-5 text-sky-400" />
        <h3 className="text-base font-bold text-slate-100">
          Book {vocabulary.serviceLabel}
        </h3>
      </div>

      {submitted ? (
        <div className="text-center py-8 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
          <h4 className="font-bold text-slate-100 text-lg">Booking Confirmed!</h4>
          <p className="text-xs text-slate-400">
            Your {vocabulary.serviceLabel.toLowerCase()} is confirmed for{' '}
            <span className="text-sky-400 font-mono font-semibold">{selectedDate} at {selectedTime}</span>.
          </p>
          <button
            onClick={() => setSubmitted(false)}
            className="mt-4 px-4 py-2 text-xs font-semibold text-sky-400 bg-sky-500/10 border border-sky-500/20 rounded-lg hover:bg-sky-500/20 transition-colors"
          >
            Book Another Appointment
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Date Picker */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <CalendarIcon className="w-3.5 h-3.5 text-sky-400" /> Select Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Time Slot Picker */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-sky-400" /> Available Time Slots
            </label>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map((slot) => (
                <button
                  type="button"
                  key={slot}
                  onClick={() => setSelectedTime(slot)}
                  className={`py-2 px-3 rounded-lg border font-mono font-semibold text-center transition-colors ${
                    selectedTime === slot
                      ? 'bg-sky-600 text-white border-sky-500 shadow-sm'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {slot}
                </button>
              ))}
            </div>
          </div>

          {/* Customer Details */}
          <div className="space-y-3 pt-2 border-t border-slate-800/60">
            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" /> {vocabulary.customerLabel} Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Robert Chen"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> Phone Number *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0192"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1 flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-slate-400" /> Email Address (Optional)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="robert@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-lg transition-colors shadow-lg shadow-sky-600/20"
          >
            Confirm {vocabulary.serviceLabel} Booking
          </button>
        </form>
      )}
    </div>
  );
};
