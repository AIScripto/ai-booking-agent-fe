import React, { useState } from 'react';
import { KeyRound, User, CalendarCheck } from 'lucide-react';
import { DEFAULT_TENANT_ID } from '../config/env';
import { setTenantId } from '../services/tenant';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Initial mock login logic
    setTimeout(() => {
      if (username === 'admin' && password === '1234') {
        localStorage.setItem('auth_token', 'mock_jwt_token_12345');
        // The tenant comes from build-time config, not a literal. Set
        // VITE_DEFAULT_TENANT_ID in .env to point a dev build at a seeded tenant.
        // TODO: replace this stub with the real /auth/login response, which
        // should return the tenant alongside the token.
        if (DEFAULT_TENANT_ID) setTenantId(DEFAULT_TENANT_ID);
        onLogin();
      } else {
        setError('Invalid username or password.');
      }
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Decorative Blur Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-sky-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

      {/* Login Card */}
      <div className="card w-full max-w-md p-8 rounded-2xl border border-slate-800 bg-slate-900/65 backdrop-blur-md shadow-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex bg-sky-500/10 p-3 rounded-2xl text-sky-400 mb-4 border border-sky-500/10">
            <CalendarCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent">
            Voice Agent Booking
          </h2>
          <p className="text-slate-400 text-sm mt-2 font-medium">
            Sign in to manage your appointments & call logs
          </p>
        </div>

        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 px-4 py-3 rounded-xl text-xs font-semibold mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <User className="w-5 h-5" />
              </span>
              <input
                type="text"
                required
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm font-medium focus:outline-none focus:border-sky-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2">
            <label className="text-xs text-slate-400 font-bold uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                <KeyRound className="w-5 h-5" />
              </span>
              <input
                type="password"
                required
                placeholder="••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 placeholder-slate-600 text-sm font-medium focus:outline-none focus:border-sky-500/50 transition-colors"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 text-slate-950 font-bold rounded-xl text-sm shadow-lg hover:shadow-sky-500/10 transition-all duration-200"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 font-medium">
          Default Tenant ID: <span className="font-mono text-[10px] text-slate-400">9eb441c7-f788...</span>
        </div>
      </div>
    </div>
  );
};
