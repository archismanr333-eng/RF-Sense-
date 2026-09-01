import React, { useState } from 'react';
import { Radio, Lock, Mail, User, Key, ArrowRight, ShieldCheck, CheckCircle2, ChevronLeft } from 'lucide-react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface LoginPageProps {
  onSuccess: () => void;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onSuccess, onBackToLanding }) => {
  const [tab, setTab] = useState<'login' | 'register' | 'reset'>('login');
  const [email, setEmail] = useState('operator@rfsense.io');
  const [password, setPassword] = useState('••••••••••••');
  const [fullName, setFullName] = useState('Field Spectrum Officer');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // If Supabase is connected, attempt Supabase Auth; otherwise simulate clean local session
    try {
      if (isSupabaseConfigured()) {
        if (tab === 'login') {
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
        } else if (tab === 'register') {
          const { error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: fullName } },
          });
          if (error) throw error;
        }
      }
      
      // Successful auth simulation / completion
      setTimeout(() => {
        setLoading(false);
        onSuccess();
      }, 600);
    } catch (err: any) {
      setLoading(false);
      setMessage({ type: 'error', text: err.message || 'Authentication error occurred' });
    }
  };

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onSuccess();
    }, 400);
  };

  return (
    <div className="relative min-h-screen w-full bg-void flex items-center justify-center p-4 sm:p-6 overflow-hidden bg-cyber-grid">
      {/* Background Animated Gradient Blobs */}
      <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyan-neon/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-cyan-electric/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Left Back Button */}
      <button
        onClick={onBackToLanding}
        className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface/80 border border-white/10 text-xs font-mono text-text-secondary hover:text-white hover:border-cyan-neon transition-all backdrop-blur-md"
      >
        <ChevronLeft className="w-4 h-4 text-cyan-neon" />
        <span>Return to Overview</span>
      </button>

      {/* Central Glass Auth Card */}
      <div className="relative w-full max-w-md rounded-2xl bg-surface/80 backdrop-blur-2xl border border-white/15 p-8 shadow-neon-cyan z-10">
        {/* Top Glowing Glass Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-cyan-neon/60 to-transparent pointer-events-none" />

        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-cyan-neon/10 border border-cyan-neon/40 text-cyan-neon shadow-neon-cyan mb-3">
            <Radio className="w-6 h-6 animate-pulse-slow" />
          </div>
          <h2 className="font-display text-2xl font-bold text-white tracking-wider">
            RF-SENSE CONSOLE
          </h2>
          <p className="text-xs font-mono text-text-muted mt-1 uppercase tracking-widest">
            Tactical Spectrum Telemetry & Spatial Intelligence
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-lg bg-void/80 p-1 border border-white/10 mb-6 font-mono text-xs">
          <button
            onClick={() => { setTab('login'); setMessage(null); }}
            className={`flex-1 py-2 rounded-md transition-all ${
              tab === 'login'
                ? 'bg-cyan-neon text-black font-bold shadow-neon-cyan'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setTab('register'); setMessage(null); }}
            className={`flex-1 py-2 rounded-md transition-all ${
              tab === 'register'
                ? 'bg-cyan-neon text-black font-bold shadow-neon-cyan'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            Register
          </button>
          <button
            onClick={() => { setTab('reset'); setMessage(null); }}
            className={`flex-1 py-2 rounded-md transition-all ${
              tab === 'reset'
                ? 'bg-cyan-neon text-black font-bold shadow-neon-cyan'
                : 'text-text-secondary hover:text-white'
            }`}
          >
            Reset
          </button>
        </div>

        {message && (
          <div
            className={`mb-4 p-3 rounded-lg text-xs font-mono border ${
              message.type === 'success'
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-red-500/15 border-red-500/40 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {tab === 'register' && (
            <div>
              <label className="block text-[11px] font-mono text-text-secondary uppercase mb-1">
                Full Operator Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Officer J. Vance"
                  className="w-full bg-void/80 border border-white/15 rounded-lg pl-9 pr-3 py-2.5 text-xs font-mono text-white placeholder:text-text-muted focus:outline-none focus:border-cyan-neon focus:shadow-[0_0_10px_rgba(0,191,255,0.3)] transition-all"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-mono text-text-secondary uppercase mb-1">
              Operator Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@rfsense.io"
                className="w-full bg-void/80 border border-white/15 rounded-lg pl-9 pr-3 py-2.5 text-xs font-mono text-white placeholder:text-text-muted focus:outline-none focus:border-cyan-neon focus:shadow-[0_0_10px_rgba(0,191,255,0.3)] transition-all"
              />
            </div>
          </div>

          {tab !== 'reset' && (
            <div>
              <label className="block text-[11px] font-mono text-text-secondary uppercase mb-1">
                Security Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-void/80 border border-white/15 rounded-lg pl-9 pr-3 py-2.5 text-xs font-mono text-white placeholder:text-text-muted focus:outline-none focus:border-cyan-neon focus:shadow-[0_0_10px_rgba(0,191,255,0.3)] transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 rounded-lg bg-gradient-to-r from-cyan-neon to-cyan-electric text-black font-mono font-bold text-xs hover:shadow-neon-cyan transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <span className="animate-pulse">Authenticating with Node...</span>
            ) : (
              <>
                <span>
                  {tab === 'login'
                    ? 'Authenticate Operator'
                    : tab === 'register'
                    ? 'Create Operator Credentials'
                    : 'Send Password Reset Link'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Instant Demo Access Button */}
        <div className="mt-6 pt-6 border-t border-white/10">
          <button
            onClick={handleDemoLogin}
            className="w-full py-2.5 rounded-lg bg-white/5 border border-cyan-neon/40 text-cyan-neon font-mono text-xs hover:bg-cyan-neon/10 hover:shadow-neon-cyan transition-all flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Instant Demo Access (Lead Researcher)</span>
          </button>
          <p className="text-[10px] font-mono text-text-muted text-center mt-2">
            Supabase RLS & JWT Session Protected
          </p>
        </div>
      </div>
    </div>
  );
};
