import React, { useState } from 'react';
import { registerUser } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

function SignUp() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await registerUser({ username, email, password });
      setSuccess('Account created! Redirecting to sign in...');
      setTimeout(() => navigate('/signin'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 -z-10" style={{ background: 'radial-gradient(circle at top, rgba(34,197,94,0.2) 0%, transparent 55%), radial-gradient(circle at bottom, rgba(14,165,233,0.2) 0%, transparent 55%)' }} />

      <div className="w-full max-w-5xl grid lg:grid-cols-[1.1fr,1fr] bg-slate-900/70 border border-slate-800/80 rounded-3xl shadow-2xl overflow-hidden" style={{ backdropFilter: 'blur(20px)' }}>

        {/* Left: Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center bg-slate-950/60">
          <div className="flex items-center justify-between mb-6">
            <div className="inline-flex items-center gap-2">
              <div className="h-9 w-9 rounded-2xl flex items-center justify-center text-slate-950 text-xl font-bold" style={{ background: 'linear-gradient(135deg, #34d399, #38bdf8)', boxShadow: '0 0 20px rgba(52,211,153,0.3)' }}>
                M
              </div>
              <span className="text-sm font-semibold tracking-tight text-slate-50">SmartMed</span>
            </div>
            <a href="https://wa.me/918738030604" target="_blank" rel="noreferrer" className="text-xs text-emerald-300 hover:text-emerald-200 underline-offset-4 hover:underline">Chat on WhatsApp</a>
          </div>

          <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50" style={{ background: 'none', WebkitTextFillColor: 'initial' }}>
            Join SmartMed
          </h2>
          <p className="mt-1 text-sm text-slate-400">Create your account to access the full SmartMed dashboard.</p>

          <form className="mt-6 space-y-5" onSubmit={handleSignup}>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 outline-none transition"
                style={{ boxSizing: 'border-box' }}
                placeholder="Dr. Raghavendra"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 outline-none transition"
                style={{ boxSizing: 'border-box' }}
                placeholder="you@hospital.com"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-2.5 text-sm text-slate-50 placeholder:text-slate-500 focus:border-emerald-400 outline-none transition"
                style={{ boxSizing: 'border-box' }}
                placeholder="At least 8 characters"
                required
              />
            </div>

            {error && <p className="text-xs text-rose-400 text-center">{error}</p>}
            {success && <p className="text-xs text-emerald-400 text-center">{success}</p>}

            <button
              type="submit"
              className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:brightness-110"
              style={{ background: 'linear-gradient(90deg, #10b981, #38bdf8)', boxShadow: '0 4px 20px rgba(16,185,129,0.3)' }}
            >
              Create Account
            </button>
          </form>

          <p className="mt-6 text-xs text-slate-400 text-center">
            Already have an account?{' '}
            <Link to="/signin" className="text-emerald-300 hover:text-emerald-200 underline-offset-4 hover:underline">Sign in</Link>
          </p>
        </div>

        {/* Right: Features */}
        <div className="relative hidden lg:flex flex-col justify-between p-10" style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.08) 0%, #0f172a 50%, rgba(14,165,233,0.08) 100%)' }}>
          <div>
            <p className="text-xs font-medium text-emerald-300 uppercase tracking-widest">Premium medical management</p>
            <h3 className="mt-3 text-3xl font-semibold text-slate-50" style={{ background: 'none', WebkitTextFillColor: 'initial' }}>
              Built for modern hospitals and clinics.
            </h3>
            <p className="mt-3 text-sm text-slate-300 max-w-md">
              Track prescriptions, lab orders, and patient notifications from a single command center. Designed for speed, safety, and clarity.
            </p>
          </div>
          <div className="grid mt-6 gap-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs font-semibold text-slate-200 mb-1">Real-time order tracking</p>
              <p className="text-xs text-slate-400">See every medication order update instantly with color-coded statuses.</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs font-semibold text-slate-200 mb-1">Safety-first alerts</p>
              <p className="text-xs text-slate-400">Smart alerts for delays, interactions, and missed doses before they become critical.</p>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4">
              <p className="text-xs font-semibold text-slate-200 mb-1">AI-powered August Mind</p>
              <p className="text-xs text-slate-400">24/7 mental wellness support integrated directly into your health dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
