import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { Activity, Eye, EyeOff, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [showForgot, setShowForgot] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotForm, setForgotForm] = useState({ email: '', newPassword: '', confirmPassword: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Email and password are required');

    setLoading(true);
    try {
      const { data } = await api.post('/login', form);
      login(data.token, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotForm.email || !forgotForm.newPassword || !forgotForm.confirmPassword) {
      return toast.error('Please fill all forgot password fields');
    }
    if (forgotForm.newPassword.length < 6) {
      return toast.error('New password must be at least 6 characters');
    }
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      return toast.error('Passwords do not match');
    }

    setForgotLoading(true);
    try {
      const { data } = await api.post('/forgot-password', {
        email: forgotForm.email,
        newPassword: forgotForm.newPassword,
      });
      toast.success(data.message || 'Password reset successful');
      setShowForgot(false);
      setForgotForm({ email: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to reset password');
    } finally {
      setForgotLoading(false);
    }
  };

  const inputClass = "w-full bg-slate-800 border border-slate-700 text-white rounded-xl px-4 py-3 text-sm placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all";

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-transparent to-purple-900/20 pointer-events-none" />

      <div className="w-full max-w-md relative">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/30 mb-4">
            <Activity size={28} className="text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome Back</h1>
          <p className="text-slate-400 mt-1">Sign in to your FitTrack account</p>
        </div>

        <div className="bg-slate-800/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
              <input
                name="email" type="email" value={form.email} onChange={handleChange}
                placeholder="john@example.com" className={inputClass}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <input
                  name="password" type={showPw ? 'text' : 'password'} value={form.password}
                  onChange={handleChange} placeholder="Your password" className={inputClass + ' pr-10'}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div className="mt-1.5 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setForgotForm((prev) => ({ ...prev, email: form.email }));
                    setShowForgot(true);
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              id="login-btn"
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><LogIn size={18} /> Sign In</>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-400 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors">
              Sign up
            </Link>
          </p>
        </div>
      </div>

      {showForgot && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-2xl">
            <h2 className="text-white text-lg font-semibold mb-1">Reset Password</h2>
            <p className="text-slate-400 text-sm mb-4">Enter your email and set a new password.</p>

            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <input
                type="email"
                placeholder="Email"
                value={forgotForm.email}
                onChange={(e) => setForgotForm({ ...forgotForm, email: e.target.value })}
                className={inputClass}
              />
              <input
                type="password"
                placeholder="New password"
                value={forgotForm.newPassword}
                onChange={(e) => setForgotForm({ ...forgotForm, newPassword: e.target.value })}
                className={inputClass}
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={forgotForm.confirmPassword}
                onChange={(e) => setForgotForm({ ...forgotForm, confirmPassword: e.target.value })}
                className={inputClass}
              />

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowForgot(false)}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white rounded-xl py-2.5 text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-60"
                >
                  {forgotLoading ? 'Resetting...' : 'Reset Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
