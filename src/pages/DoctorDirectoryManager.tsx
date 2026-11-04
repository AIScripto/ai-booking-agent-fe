import React, { useState, useEffect } from 'react';
import { useVocabulary } from '../services/vocabulary';
import { api } from '../services/api';
import type { Resource as DoctorResource } from '../services/api';
import {
  Stethoscope,
  Search,
  Plus,
  UserCheck,
  LayoutGrid,
  List,
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
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // UI Control State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDept, setSelectedDept] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

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
      const branding = await api.getBranding();
      setDoctors(branding.resources ?? []);
      setDepartments(branding.departments ?? []);
      setError('');
    } catch (err: unknown) {
      setError(err instanceof Error && err.message ? err.message : 'Failed to load the providers.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDoctorSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocName || !newDocEmail) return;

    try {
      const created = await api.createResource({
        name: newDocName,
        email: newDocEmail,
        title: newDocTitle || undefined,
        departmentId: newDocDeptId || undefined,
      });

      setDoctors((prev) => [created, ...prev]);
      setShowAddModal(false);
      setNewDocName('');
      setNewDocEmail('');
      setNewDocTitle('');
      setNewDocDeptId('');
    } catch (err: unknown) {
      setError(err instanceof Error && err.message ? err.message : 'Failed to add the provider.');
    }
  };

  const handleOffboardDoctor = async (doctorId: string) => {
    if (!window.confirm('Are you sure you want to offboard this consultant? This will remove them from active booking availability.')) return;

    try {
      await api.deleteResource(doctorId);
      setDoctors((prev) => prev.filter((d) => d.id !== doctorId));
    } catch (err: unknown) {
      setError(err instanceof Error && err.message ? err.message : 'Failed to remove the provider.');
    }
  };

  // Filter doctors by search query and department
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (doc.title && doc.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      doc.email.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedDept === 'ALL') return matchesSearch;
    return matchesSearch && doc.departmentId === selectedDept;
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
            <Stethoscope className="w-3.5 h-3.5" aria-hidden="true" /> Directory
          </span>
          <h1 className="text-2xl font-extrabold text-slate-100">
            {vocabulary.resourceLabel} & Department Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {doctors.length} {vocabulary.resourceLabel.toLowerCase()}{doctors.length === 1 ? '' : 's'} in {departments.length} department{departments.length === 1 ? '' : 's'}.
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
              onClick={() => setSelectedDept(dept.id)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                selectedDept === dept.id
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

      {/* Roster: only what the system knows about a provider (name, email, title, department) */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl py-12 text-center text-slate-400 text-xs space-y-2">
          <UserCheck className="w-8 h-8 text-slate-600 mx-auto" aria-hidden="true" />
          <p>
            {doctors.length === 0
              ? `No ${vocabulary.resourceLabel.toLowerCase()}s have been added yet.`
              : `No ${vocabulary.resourceLabel.toLowerCase()}s match your filter.`}
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doc) => (
            <div key={doc.id} className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl space-y-4 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center">
                    <Stethoscope className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 text-sm">{doc.name}</h3>
                    {doc.title && <p className="text-xs text-slate-400">{doc.title}</p>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleOffboardDoctor(doc.id)}
                  className="p-2.5 bg-slate-950 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 rounded-xl transition-all"
                  aria-label={`Remove ${doc.name}`}
                  title={`Remove ${doc.name}`}
                >
                  <Trash2 className="w-4 h-4" aria-hidden="true" />
                </button>
              </div>
              <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Email</span>
                  <span className="font-mono text-slate-200 truncate ml-3">{doc.email}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Department</span>
                  <span className="text-slate-200">{departments.find((d) => d.id === doc.departmentId)?.name ?? '—'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">{vocabulary.resourceLabel}</th>
                <th className="py-3.5 px-4">Title</th>
                <th className="py-3.5 px-4">Department</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredDoctors.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-slate-100">
                    <div>{doc.name}</div>
                    <div className="text-[10px] text-slate-500 font-mono">{doc.email}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-300">{doc.title ?? '—'}</td>
                  <td className="py-3.5 px-4 text-slate-300">{departments.find((d) => d.id === doc.departmentId)?.name ?? '—'}</td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleOffboardDoctor(doc.id)}
                      className="p-1 rounded-lg bg-slate-950 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/40 transition-all"
                      aria-label={`Remove ${doc.name}`}
                      title={`Remove ${doc.name}`}
                    >
                      <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                    </button>
                  </td>
                </tr>
              ))}
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
                    placeholder="Full name"
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
                    placeholder="name@example.com"
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
