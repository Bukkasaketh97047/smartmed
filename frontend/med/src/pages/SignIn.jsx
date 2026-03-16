import React, { useState } from 'react';
import { loginUser } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const GOOGLE_AUTH_URL = import.meta.env.PROD 
  ? 'https://smartmed-2-qlz8.onrender.com/oauth2/authorization/google'
  : 'http://localhost:8080/oauth2/authorization/google';

function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await loginUser({ username, password });
      login({
        username: response.data.username,
        token: response.data.token,
        role: response.data.role,
      });
      if (response.data.role === 'ROLE_ADMIN') {
        navigate('/admin');
      } else {
        navigate('/products');
      }
    } catch (err) {
      if (!err.response) {
        setError('Network error: Cannot reach backend. Is it running?');
      } else {
        setError(err.response.data?.message || err.response.data || 'Invalid username or password');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      {/* Background glow */}
      <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(circle at top, rgba(34,197,94,0.2) 0%, transparent 55%), radial-gradient(circle at bottom, rgba(14,165,233,0.2) 0%, transparent 55%)' }} />

      <div className="w-full max-w-5xl grid lg:grid-cols-[1.2fr,1fr] bg-slate-900/70 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden" style={{ backdropFilter: 'blur(20px)' }}>

        {/* Left: Branding */}
        <div className="relative hidden lg:flex flex-col justify-between p-10" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, #0f172a 50%, rgba(14,165,233,0.08) 100%)' }}>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1 text-xs text-emerald-300 border border-emerald-500/30">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live patient insights · 24/7
            </div>
            <h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-slate-50" style={{ background: 'none', WebkitTextFillColor: 'initial' }}>
              SmartMed
            </h1>
            <p className="mt-3 text-sm text-slate-300 max-w-md">
              Precision healthcare at your fingertips. Monitor orders, track medications,
              and streamline your medical operations from a single, intelligent dashboard.
            </p>
          </div>
          <div className="grid gap-4 mt-8">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide mb-2">Today at a glance</p>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-xs text-slate-400">Active Orders</p>
                  <p className="text-lg font-semibold text-emerald-400">128</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Critical Alerts</p>
                  <p className="text-lg font-semibold text-rose-400">3</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">On-time Rate</p>
                  <p className="text-lg font-semibold text-sky-400">97%</p>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs text-slate-400 mb-2 italic">
                "SmartMed has completely transformed how we track prescriptions and lab orders across our network."
              </p>
              <p className="text-xs font-medium text-slate-300">Dr. Ananya Rao</p>
              <p className="text-xs text-slate-500">Chief Medical Officer</p>
            </div>
          </div>
        </div>

        {/* Right: Login Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-slate-950/60">
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl flex items-center justify-center text-slate-950 text-xl font-bold shadow-lg" style={{ background: 'linear-gradient(135deg, #34d399, #38bdf8)', boxShadow: '0 0 20px rgba(52,211,153,0.3)' }}>
                M
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-50">SmartMed</span>
            </div>
            <a href="https://wa.me/918738030604" target="_blank" rel="noreferrer" className="text-xs text-emerald-300 hover:text-emerald-200 underline-offset-4 hover:underline">
              Chat on WhatsApp
            </a>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50" style={{ background: 'none', WebkitTextFillColor: 'initial' }}>
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-slate-400">Sign in to manage orders, prescriptions, and patient flows.</p>

          <form className="mt-6 space-y-5" onSubmit={handleLogin}>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">Email or Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 outline-none transition"
                style={{ boxSizing: 'border-box' }}
                placeholder="doctor@hospital.com"
              />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-medium text-slate-300">Password</label>
                <button type="button" className="text-xs text-sky-300 hover:text-sky-200 border-none bg-transparent cursor-pointer">Forgot password?</button>
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 outline-none transition"
                style={{ boxSizing: 'border-box' }}
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-xs text-rose-400 text-center">{error}</p>}

            <button
              type="submit"
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:brightness-110"
              style={{ background: 'linear-gradient(90deg, #10b981, #38bdf8)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}
            >
              Sign In
            </button>
          </form>

          <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
            <div className="h-px flex-1 bg-slate-800" />
            <span>OR</span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <button
            type="button"
            onClick={() => window.location.href = GOOGLE_AUTH_URL}
            className="mt-3 w-full inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900/70 px-4 py-2.5 text-xs font-medium text-slate-100 hover:bg-slate-900 transition cursor-pointer"
          >
            <span className="h-4 w-4 rounded-full bg-white/90 text-xs flex items-center justify-center text-slate-900 font-bold">G</span>
            Continue with Google
          </button>

          <p className="mt-6 text-xs text-slate-400 text-center">
            Don't have an account?{' '}
            <Link to="/signup" className="text-emerald-300 hover:text-emerald-200 underline-offset-4 hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default SignIn;
