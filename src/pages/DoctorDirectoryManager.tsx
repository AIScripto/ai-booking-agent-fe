import React, { useState, useEffect } from 'react';
import { useVocabulary } from '../services/vocabulary';
import { api } from '../services/api';
import type { Appointment } from '../services/api';
import type { DoctorResource } from './PublicBookingPage';
import {
  Stethoscope,
  Search,
  Plus,
  Lock,
  Calendar,
  Clock,
  UserCheck,
  ShieldAlert,
  LayoutGrid,
  List,
  CheckCircle2,
  AlertCircle,
  X,
  Mail,
  User,
  Trash2,
  Building2,
  ShieldCheck,
} from 'lucide-react';

export interface Department {
  id: string;
  name: string;
  code?: string;
  description?: string;
  buildingLocation?: string;
  isHipaaRestricted?: boolean;
  maxDailyBookings?: number;
}

export const DoctorDirectoryManager: React.FC = () => {
  const { vocabulary } = useVocabulary();

  const [doctors, setDoctors] = useState<DoctorResource[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // UI Control State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [blockoutActive, setBlockoutActive] = useState<Record<string, boolean>>({});

  // Add Doctor Modal State
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newDocName, setNewDocName] = useState<string>('');
  const [newDocEmail, setNewDocEmail] = useState<string>('');
  const [newDocTitle, setNewDocTitle] = useState<string>('');
  const [newDocDeptId, setNewDocDeptId] = useState<string>('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [branding, appts] = await Promise.all([
        api.getBranding(),
        api.getAppointments(),
      ]);

      if (branding.resources) setDoctors(branding.resources);
      if (branding.departments) setDepartments(branding.departments);
      setAppointments(appts);
    } catch (err: any) {
      setError(err.message || 'Failed to retrieve doctor roster.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlockout = (doctorId: string) => {
    setBlockoutActive((prev) => ({
      ...prev,
      [doctorId]: !prev[doctorId],
    }));
  };

  const handleAddDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName || !newDocEmail) return;

    try {
      const created = await api.createResource({
        name: newDocName,
        email: newDocEmail,
        title: newDocTitle || 'Consultant Specialist',
        departmentId: newDocDeptId || undefined,
      });

      setDoctors((prev) => [created, ...prev]);
      setShowAddModal(false);
      setNewDocName('');
      setNewDocEmail('');
      setNewDocTitle('');
      setNewDocDeptId('');
    } catch (err: any) {
      setError(err.message || 'Failed to onboard new doctor.');
    }
  };

  const handleOffboardDoctor = async (doctorId: string) => {
    if (!window.confirm('Are you sure you want to offboard this consultant? This will remove them from active booking availability.')) return;

    try {
      await api.deleteResource(doctorId);
      setDoctors((prev) => prev.filter((d) => d.id !== doctorId));
    } catch (err: any) {
      setError(err.message || 'Failed to offboard doctor.');
    }
  };

  // Filter doctors by search query and department
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.title && doc.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedDept === 'ALL') return matchesSearch;
    return matchesSearch && doc.title?.toLowerCase().includes(selectedDept.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner & Add Button */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-2">
            <Stethoscope className="w-3.5 h-3.5" /> Enterprise Multi-Department Directory
          </span>
          <h1 className="text-2xl font-extrabold text-slate-100">
            {vocabulary.resourceLabel} & Department Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage {doctors.length} consultants across {departments.length} departments with HIPAA compliance controls.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New {vocabulary.resourceLabel}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Control Bar: Search Filter, Department Pills, View Switcher */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${vocabulary.resourceLabel.toLowerCase()} by name, department, or email...`}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          />
        </div>

        {/* Department Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs overflow-x-auto">
          <button
            onClick={() => setSelectedDept('ALL')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
              selectedDept === 'ALL'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            All Departments ({departments.length})
          </button>
          {departments.map((dept) => (
            <button
              key={dept.id}
              onClick={() => setSelectedDept(dept.name)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedDept === dept.name
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {dept.name}
            </button>
          ))}
        </div>

        {/* View Switcher Toggle */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'grid' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`p-1.5 rounded-lg transition-colors ${
              viewMode === 'table' ? 'bg-slate-800 text-sky-400' : 'text-slate-400 hover:text-slate-200'
            }`}
            title="Table Roster View"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Department Location & Security Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
        {departments.map((d) => (
          <div key={d.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-1.5 shadow-md">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-sky-400" /> {d.name} ({d.code})
              </span>
              {d.isHipaaRestricted && (
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> HIPAA Shield
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">{d.description}</p>
            <div className="text-[11px] text-slate-500 font-mono">Location: {d.buildingLocation}</div>
          </div>
        ))}
      </div>

      {/* Main Roster Display: Grid View vs Table View */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl py-12 text-center text-slate-400 text-xs space-y-2">
          <UserCheck className="w-8 h-8 text-slate-600 mx-auto" />
          <p>No {vocabulary.resourceLabel.toLowerCase()}s match your filter criteria.</p>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID CARDS VIEW */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => {
            const isBlocked = !!blockoutActive[doc.id];
            const docBookingsCount = appointments.length;

            return (
              <div
                key={doc.id}
                className={`bg-slate-900 border rounded-2xl p-6 shadow-xl space-y-5 transition-all relative ${
                  isBlocked ? 'border-rose-500/40 bg-rose-950/10' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Avatar & Name */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-base">
                        <Stethoscope className="w-6 h-6" />
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                          isBlocked ? 'bg-rose-500' : 'bg-emerald-500 animate-pulse'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-100 text-sm">{doc.name}</h3>
                      <p className="text-xs text-slate-400">{doc.title || 'Specialist Consultant'}</p>
                    </div>
                  </div>
                </div>

                {/* Status & Work Hours Details */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-sky-400" /> Duty Hours:
                    </span>
                    <span className="font-mono text-slate-200 font-semibold">09:00 - 17:00</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" /> Active Slots:
                    </span>
                    <span className="font-mono text-sky-400 font-bold">{docBookingsCount} Booked</span>
                  </div>
                </div>

                {/* Emergency Blockout Trigger & Offboard Action */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggleBlockout(doc.id)}
                    className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                      isBlocked
                        ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-lg'
                        : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>{isBlocked ? 'Cancel Blockout' : 'Emergency Time-Off'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleOffboardDoctor(doc.id)}
                    className="p-2.5 bg-slate-950 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 rounded-xl transition-all"
                    title="Offboard / Delete Doctor"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* COMPACT TABLE VIEW */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">{vocabulary.resourceLabel} Name</th>
                <th className="py-3.5 px-4">Specialty / Title</th>
                <th className="py-3.5 px-4">Duty Schedule</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDoctors.map((doc) => {
                const isBlocked = !!blockoutActive[doc.id];
                return (
                  <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-100 flex items-center gap-2">
                      <Stethoscope className="w-4 h-4 text-sky-400" />
                      <div>
                        <div>{doc.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono">{doc.email}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-300">{doc.title || 'Consultant'}</td>
                    <td className="py-3.5 px-4 font-mono text-sky-400">09:00 - 17:00</td>
                    <td className="py-3.5 px-4">
                      {isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          <Lock className="w-3 h-3" /> Emergency OOO
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" /> On Duty
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggleBlockout(doc.id)}
                        className={`px-3 py-1 rounded-lg font-semibold text-xs transition-colors ${
                          isBlocked
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        {isBlocked ? 'Cancel Blockout' : 'Emergency Time-Off'}
                      </button>

                      <button
                        onClick={() => handleOffboardDoctor(doc.id)}
                        className="p-1 rounded-lg bg-slate-950 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition-all"
                        title="Offboard Doctor"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-sky-400" /> Onboard New {vocabulary.resourceLabel}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDoctorSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    placeholder="e.g. Dr. Gregory House"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={newDocEmail}
                    onChange={(e) => setNewDocEmail(e.target.value)}
                    placeholder="gregory.house@citycaremedical.com"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Department / Specialty</label>
                <select
                  value={newDocDeptId}
                  onChange={(e) => setNewDocDeptId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="">Select Department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} ({d.buildingLocation || 'Main Wing'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Specialty Title</label>
                <input
                  type="text"
                  value={newDocTitle}
                  onChange={(e) => setNewDocTitle(e.target.value)}
                  placeholder="e.g. Head of Diagnostic Medicine"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-medium rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 text-white font-bold rounded-xl hover:bg-sky-500 shadow-lg shadow-sky-600/20"
                >
                  Onboard Consultant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
