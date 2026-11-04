import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BarChart3, CalendarCheck, CalendarClock, PhoneCall, Timer } from 'lucide-react';

import { api } from '../services/api';
import type { Appointment, CallLog } from '../services/api';
import { useVocabulary } from '../services/vocabulary';
import { dateKey, hourInZone, hourLabel, todayKey } from '../services/time';

/** "2 min 5 s", "45 s" */
function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return minutes > 0 ? `${minutes} min ${rest} s` : `${rest} s`;
}

/**
 * Counts taken straight from the appointments and the latest calls the server returns.
 * Nothing here is estimated or made up: if there is no data, the page says so.
 * (Conversion rate, revenue, latency and per-provider load are not shown because the system does not
 * record them.)
 */
export const AnalyticsView: React.FC = () => {
  const { vocabulary, timeZone } = useVocabulary();

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [appointmentList, callList] = await Promise.all([api.getAppointments(), api.getCallLogs()]);
      setAppointments(appointmentList);
      setCalls(callList);
    } catch (err: unknown) {
      setError(err instanceof Error && err.message ? err.message : 'Could not load the analytics.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const now = Date.now();
    const today = todayKey(timeZone);

    const upcoming = appointments.filter((a) => new Date(a.appointmentDateTime).getTime() >= now).length;
    const todayCount = appointments.filter((a) => dateKey(a.appointmentDateTime, timeZone) === today).length;

    const completed = calls.filter((c) => c.status === 'completed').length;
    const failed = calls.filter((c) => c.status === 'failed').length;
    const other = calls.length - completed - failed;

    const timed = calls.filter((c) => typeof c.duration === 'number' && c.duration > 0);
    const averageSeconds = timed.length > 0 ? timed.reduce((sum, c) => sum + (c.duration ?? 0), 0) / timed.length : null;

    const byHour = new Map<number, number>();
    for (const a of appointments) {
      const hour = hourInZone(a.appointmentDateTime, timeZone);
      byHour.set(hour, (byHour.get(hour) ?? 0) + 1);
    }
    const hours = [...byHour.entries()].sort((a, b) => a[0] - b[0]);
    const busiest = hours.reduce((max, [, count]) => Math.max(max, count), 0);

    return { upcoming, todayCount, completed, failed, other, averageSeconds, hours, busiest };
  }, [appointments, calls, timeZone]);

  if (loading) {
    return (
      <div role="status" className="text-sm text-slate-400 py-16 text-center">
        Loading analytics…
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="bg-rose-500/10 border border-rose-500/20 text-rose-300 rounded-2xl p-6 space-y-3">
        <p className="font-semibold">Could not load the analytics.</p>
        <p className="text-sm">{error}</p>
        <button
          onClick={load}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 text-sm font-semibold"
        >
          Try again
        </button>
      </div>
    );
  }

  const cards = [
    {
      title: `Upcoming ${vocabulary.serviceLabel.toLowerCase()}s`,
      value: String(stats.upcoming),
      note: 'Scheduled from now on',
      icon: CalendarClock,
    },
    {
      title: 'Today',
      value: String(stats.todayCount),
      note: `Scheduled today (${timeZone})`,
      icon: CalendarCheck,
    },
    {
      title: 'Calls',
      value: String(calls.length),
      note: calls.length === 0 ? 'No calls recorded yet' : `${stats.completed} completed, latest ${Math.min(calls.length, 30)} shown`,
      icon: PhoneCall,
    },
    {
      title: 'Average call length',
      value: stats.averageSeconds === null ? '—' : formatDuration(stats.averageSeconds),
      note: stats.averageSeconds === null ? 'No call has a recorded length yet' : 'From calls that have a recorded length',
      icon: Timer,
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-2">
          <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" /> Analytics
        </span>
        <h1 className="text-2xl font-extrabold text-slate-100">Analytics</h1>
        <p className="text-xs text-slate-400 mt-1">
          Counts come straight from your scheduled appointments and your latest 30 calls. Nothing is estimated.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</span>
                <div className="p-2.5 rounded-xl border text-sky-400 bg-sky-500/10 border-sky-500/20">
                  <Icon className="w-5 h-5" aria-hidden="true" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-slate-100">{card.value}</div>
                <div className="text-xs text-slate-400 font-medium mt-1">{card.note}</div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="font-bold text-slate-100 text-base">Scheduled appointments by hour of the day</h2>
            <p className="text-xs text-slate-400 mt-0.5">Hours are shown in {timeZone}.</p>
          </div>

          {stats.hours.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No scheduled appointments yet.</p>
          ) : (
            <ul className="space-y-3">
              {stats.hours.map(([hour, count]) => (
                <li key={hour} className="flex items-center text-xs gap-4">
                  <span className="w-12 font-mono text-slate-400 font-semibold">{hourLabel(hour)}</span>
                  <div
                    className="flex-1 bg-slate-950 rounded-full h-4 p-0.5 border border-slate-800 overflow-hidden"
                    role="img"
                    aria-label={`${count} appointments at ${hourLabel(hour)}`}
                  >
                    <div
                      className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full"
                      style={{ width: `${Math.max(4, Math.round((count / stats.busiest) * 100))}%` }}
                    />
                  </div>
                  <span className="w-10 text-right font-mono text-sky-400 font-bold">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h2 className="font-bold text-slate-100 text-base">Latest calls by result</h2>
            <p className="text-xs text-slate-400 mt-0.5">From the latest {Math.min(calls.length, 30)} calls.</p>
          </div>

          {calls.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">No calls recorded yet.</p>
          ) : (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-400">Completed</dt>
                <dd className="font-mono font-bold text-slate-100">{stats.completed}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">In progress or other</dt>
                <dd className="font-mono font-bold text-slate-100">{stats.other}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-400">Failed</dt>
                <dd className="font-mono font-bold text-slate-100">{stats.failed}</dd>
              </div>
            </dl>
          )}
        </div>
      </div>
    </div>
  );
};
