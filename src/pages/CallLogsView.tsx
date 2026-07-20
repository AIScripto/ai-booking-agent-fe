import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import type { CallLog } from '../services/api';
import { Phone, Eye, Calendar, Clock, X, Code, User, Mail } from 'lucide-react';

export const CallLogsView: React.FC = () => {
  const [logs, setLogs] = useState<CallLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [selectedLog, setSelectedLog] = useState<CallLog | null>(null);
  const [showJson, setShowJson] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await api.getCallLogs();
      setLogs(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch call logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleOpenDetails = (log: CallLog) => {
    setSelectedLog(log);
    setShowJson(false);
  };

  // Helper to render status badges
  const renderStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'completed') {
      return (
        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/40 border border-emerald-900/40 text-emerald-400">
          Completed
        </span>
      );
    } else if (s === 'failed') {
      return (
        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950/40 border border-rose-900/40 text-rose-400">
          Failed
        </span>
      );
    } else {
      return (
        <span className="inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-950/40 border border-sky-900/40 text-sky-400 animate-pulse">
          In Progress
        </span>
      );
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {error && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl text-sm font-semibold">
          {error}
        </div>
      )}

      {/* Logs Card Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-400"></div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 space-y-2">
            <div className="inline-flex bg-slate-950 p-4 rounded-2xl border border-slate-800 text-slate-500">
              <Phone className="w-8 h-8" />
            </div>
            <h3 className="text-md font-bold text-slate-300">No Call Logs</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Incoming voice calls from Vapi will appear here as soon as they are initiated.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="text-xs text-slate-500 font-bold border-b border-slate-800">
                  <th className="pb-3 pr-4">Timestamp</th>
                  <th className="pb-3 pr-4">Patient</th>
                  <th className="pb-3 pr-4">Session ID</th>
                  <th className="pb-3 pr-4">Call Purpose Summary</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-850">
                {logs.map((log) => {
                  const date = new Date(log.createdAt);
                  const formattedDate = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  });
                  const formattedTime = date.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={log.id} className="text-slate-300 hover:bg-slate-850/20 transition-colors">
                      <td className="py-4 pr-4">
                        <div className="flex flex-col">
                          <span className="font-semibold">{formattedDate}</span>
                          <span className="text-xs text-slate-500 mt-0.5">{formattedTime}</span>
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        {log.customerName ? (
                          <div className="flex flex-col">
                            <span className="font-semibold text-slate-200">{log.customerName}</span>
                            <span className="text-xs text-slate-400 mt-0.5">{log.customerPhone}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-500 italic">Gathering details...</span>
                        )}
                      </td>
                      <td className="py-4 pr-4 font-mono text-xs text-slate-400">
                        {log.callSid ? `${log.callSid.substring(0, 8)}...` : 'N/A'}
                      </td>
                      <td className="py-4 pr-4 max-w-xs truncate text-xs text-slate-350">
                        {log.purpose || (log.status === 'completed' ? 'Booking inquiry' : 'Active Voice Call')}
                      </td>
                      <td className="py-4 pr-4">
                        {renderStatusBadge(log.status)}
                      </td>
                      <td className="py-4 text-right">
                        <button
                          onClick={() => handleOpenDetails(log)}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-sky-300 font-bold text-xs rounded-lg transition-all"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Details</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Dialog Popup */}
      {selectedLog && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[85vh]">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-850 flex-shrink-0">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Voice Call Session</h3>
                <p className="text-xs text-slate-500 font-mono mt-1">Session ID: {selectedLog.callSid || 'N/A'}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="p-1.5 text-slate-500 hover:text-slate-350 hover:bg-slate-850 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content Scrollable */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Date / Status Bar */}
              <div className="flex flex-wrap gap-4 justify-between bg-slate-950/50 border border-slate-850 rounded-xl p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-300 font-semibold">
                    {new Date(selectedLog.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span className="text-xs text-slate-350 font-bold">
                    Duration: <span className="text-sky-400">{selectedLog.duration ? `${selectedLog.duration} seconds` : 'N/A'}</span>
                  </span>
                </div>
                <div>
                  {renderStatusBadge(selectedLog.status)}
                </div>
              </div>

              {/* Patient Details & Purpose Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Patient Profile */}
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-sky-400" />
                    <span>Caller Profile</span>
                  </h4>
                  {selectedLog.customerName ? (
                    <div className="text-sm space-y-1">
                      <p className="text-slate-200 font-bold">{selectedLog.customerName}</p>
                      <p className="text-slate-400 text-xs flex items-center">
                        <Phone className="w-3 h-3 mr-1 text-slate-500" />
                        {selectedLog.customerPhone}
                      </p>
                      {selectedLog.customerEmail && (
                        <p className="text-slate-400 text-xs flex items-center">
                          <Mail className="w-3 h-3 mr-1 text-slate-500" />
                          {selectedLog.customerEmail}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">No customer profile linked to this call.</p>
                  )}
                </div>

                {/* Call Purpose Summary */}
                <div className="bg-slate-950/40 border border-slate-850 p-4 rounded-xl space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Call Purpose & Summary</span>
                  </h4>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {selectedLog.purpose || (selectedLog.status === 'completed' ? 'The user inquired about scheduling or listing dental appointments.' : 'Active ongoing call, final summary pending.')}
                  </p>
                </div>
              </div>

              {/* Navigation Tabs (Transcript vs Raw JSON) */}
              <div className="flex border-b border-slate-800">
                <button
                  onClick={() => setShowJson(false)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all ${
                    !showJson ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Transcript Dialog
                </button>
                <button
                  onClick={() => setShowJson(true)}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-all flex items-center space-x-1.5 ${
                    showJson ? 'border-sky-500 text-sky-400' : 'border-transparent text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Code className="w-3.5 h-3.5" />
                  <span>Raw Webhook Payload</span>
                </button>
              </div>

              {/* Tab Content */}
              {!showJson ? (
                <div className="space-y-4">
                  <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">Voice Transcription</h4>
                  {selectedLog.transcript ? (
                    <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-xl text-sm text-slate-200 leading-relaxed max-h-[250px] overflow-y-auto whitespace-pre-wrap">
                      {selectedLog.transcript}
                    </div>
                  ) : (
                    <div className="bg-slate-950/20 border border-dashed border-slate-850 p-6 rounded-xl text-center text-xs text-slate-500 font-medium">
                      No dialog transcription details were transmitted yet.
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <h4 className="text-xs text-slate-400 font-bold uppercase tracking-wider">JSON Event Details</h4>
                  <pre className="bg-slate-950 p-5 rounded-xl text-xs font-mono text-cyan-400 overflow-auto max-h-[300px] border border-slate-850">
                    {JSON.stringify(selectedLog.payload, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-850 bg-slate-950/20 flex-shrink-0">
              <button
                onClick={() => setSelectedLog(null)}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-sm font-semibold transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
