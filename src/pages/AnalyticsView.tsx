import React from 'react';
import {
  TrendingUp,
  PhoneCall,
  Clock,
  Zap,
  Users,
  BarChart3,
  DollarSign,
} from 'lucide-react';

import { useVocabulary } from '../services/vocabulary';

export const AnalyticsView: React.FC = () => {
  const { vocabulary, industry } = useVocabulary();

  const metrics = [
    {
      title: 'Voice AI Conversion Rate',
      value: '94.2%',
      change: '+3.1% vs last week',
      icon: TrendingUp,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      title: 'Average Call Resolution',
      value: '38s',
      change: '-4s SLA optimization',
      icon: Clock,
      color: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    },
    {
      title: 'Cache Latency (P99)',
      value: '2ms',
      change: 'Target <50ms maintained',
      icon: Zap,
      color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20',
    },
    {
      title: 'Monthly Revenue Generated',
      value: '$24,850',
      change: '+18% growth',
      icon: DollarSign,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  const hourlyVolume = [
    { hour: '8 AM', calls: 14, bookings: 12 },
    { hour: '9 AM', calls: 32, bookings: 29 },
    { hour: '10 AM', calls: 48, bookings: 45 },
    { hour: '11 AM', calls: 56, bookings: 51 },
    { hour: '12 PM', calls: 28, bookings: 24 },
    { hour: '1 PM', calls: 35, bookings: 31 },
    { hour: '2 PM', calls: 42, bookings: 39 },
    { hour: '3 PM', calls: 39, bookings: 36 },
    { hour: '4 PM', calls: 22, bookings: 20 },
  ];

  const staffLoad = [
    { name: 'Dr. Sarah Jenkins', bookings: 42, load: '84%', status: 'Optimal' },
    { name: 'Dr. Marcus Vance', bookings: 38, load: '76%', status: 'Optimal' },
    { name: 'Dr. Emily Chen', bookings: 45, load: '90%', status: 'High Load' },
  ];

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-2">
            <BarChart3 className="w-3.5 h-3.5" /> Executive Operations Intelligence
          </span>
          <h1 className="text-2xl font-extrabold text-slate-100">
            Analytics & SLA Telemetry
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics for {vocabulary.customerLabel} bookings, Voice AI latency, and {vocabulary.resourceLabel} load balancing.
          </p>
        </div>

        <div className="bg-slate-950 px-4 py-2 rounded-xl border border-slate-800 text-xs text-slate-300">
          Industry Preset: <span className="text-sky-400 font-bold">{industry}</span>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((m) => {
          const Icon = m.icon;
          return (
            <div
              key={m.title}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {m.title}
                </span>
                <div className={`p-2.5 rounded-xl border ${m.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-4">
                <div className="text-3xl font-extrabold text-slate-100">{m.value}</div>
                <div className="text-xs text-emerald-400 font-medium mt-1">{m.change}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Grid: Hourly Volume Heatmap & Staff Load Balancing */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Peak Call Volume Heatmap */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <PhoneCall className="w-5 h-5 text-sky-400" /> Hourly Call & Booking Distribution
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Voice AI call traffic volume paired against successful bookings
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {hourlyVolume.map((item) => {
              const maxCalls = 60;
              const callWidthPercent = Math.round((item.calls / maxCalls) * 100);

              return (
                <div key={item.hour} className="flex items-center text-xs gap-4">
                  <span className="w-12 font-mono text-slate-400 font-semibold">{item.hour}</span>
                  <div className="flex-1 bg-slate-950 rounded-full h-4 p-0.5 border border-slate-800 overflow-hidden relative">
                    <div
                      className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${callWidthPercent}%` }}
                    />
                  </div>
                  <span className="w-24 text-right font-mono text-slate-300">
                    <span className="text-sky-400 font-bold">{item.bookings}</span> / {item.calls} calls
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Staff Load Balancing */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" /> {vocabulary.resourceLabel} Utilization
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Round-robin load balancing status</p>
          </div>

          <div className="space-y-4">
            {staffLoad.map((s) => (
              <div key={s.name} className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-200">{s.name}</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20">
                    {s.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400 pt-1">
                  <span>{s.bookings} Bookings Locked</span>
                  <span className="font-mono text-sky-400 font-bold">{s.load} Capacity</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
