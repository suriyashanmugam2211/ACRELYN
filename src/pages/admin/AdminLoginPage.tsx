import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Shield, Lock, Mail, ArrowRight, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { repository } from '../../lib/storage';
import { getSupabaseConfig } from '../../lib/supabase';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Form states - standard login inputs
  const [email, setEmail] = useState<string>('admin@acrelyn.com');
  const [password, setPassword] = useState<string>('acrelyn2026');
  const [fullName, setFullName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { isConfigured } = getSupabaseConfig();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide both email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await repository.loginAdmin(email, password);
    setLoading(false);

    if (result.success) {
      navigate('/admin/dashboard');
    } else {
      setError(result.error || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please provide email and password.');
      return;
    }

    setLoading(true);
    setError(null);

    const result = await repository.registerAdminInSupabase(email, password, fullName || 'Operations Admin');
    setLoading(false);

    if (result.success) {
      setSuccessMessage(result.message || 'Admin account successfully registered in Supabase!');
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 1500);
    } else {
      setError(result.error || 'Registration failed in Supabase Auth.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF7] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-3">
        <Link to="/" className="inline-flex items-center gap-2 justify-center">
          <div className="w-10 h-10 rounded-xl bg-[#087F5B] text-white flex items-center justify-center font-bold shadow-[0_0_15px_rgba(0,230,160,0.4)]">
            A
          </div>
          <span className="font-serif text-3xl font-bold text-[#142B25]">
            ACRELYN
          </span>
        </Link>
        <h2 className="font-serif text-2xl font-bold text-[#142B25]">
          Administrator Authentication
        </h2>
        <p className="text-xs text-[#71817A]">
          Restricted operations portal. Please sign in with your administrator credentials.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-2xl border border-[#DCEBE4] shadow-md space-y-6">
          {/* Tab Selector */}
          <div className="flex items-center bg-[#F7FAF8] p-1 rounded-xl border border-[#DCEBE4] text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-colors font-bold ${
                tab === 'login'
                  ? 'bg-white text-[#087F5B] shadow-xs border border-[#DCEBE4]'
                  : 'text-[#71817A] hover:text-[#142B25]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 rounded-lg transition-colors font-bold ${
                tab === 'register'
                  ? 'bg-white text-[#087F5B] shadow-xs border border-[#DCEBE4]'
                  : 'text-[#71817A] hover:text-[#142B25]'
              }`}
            >
              Create Supabase User
            </button>
          </div>

          {error && (
            <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{error}</div>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-xs text-emerald-800 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">{successMessage}</div>
            </div>
          )}

          {tab === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#647067] absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@acrelyn.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8FAF7] border border-[#E3E9E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#647067] absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8FAF7] border border-[#E3E9E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#0B3D2E] hover:bg-[#135541] disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Authenticating Session...</span>
                ) : (
                  <>
                    <span>Sign In to Admin Portal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Admin Full Name
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Suriya Kumar"
                  className="w-full px-3 py-2 text-sm bg-[#F8FAF7] border border-[#E3E9E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#647067] absolute left-3 top-3" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your-email@example.com"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8FAF7] border border-[#E3E9E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#17211D] mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#647067] absolute left-3 top-3" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full pl-9 pr-3 py-2 text-sm bg-[#F8FAF7] border border-[#E3E9E4] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 bg-[#10B981] hover:bg-[#059669] disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-sm transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Registering in Supabase Auth...</span>
                ) : (
                  <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Create User in Supabase Auth</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Admin Credentials Reference Note (Standard manual login) */}
          <div className="p-3 bg-[#F7FAF8] rounded-xl border border-[#DCEBE4] text-xs space-y-1">
            <div className="flex items-center justify-between text-[11px] font-bold text-[#142B25]">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#087F5B]" />
                <span>Admin Credentials Reference</span>
              </span>
              <span className="text-[#087F5B] font-mono text-[10px] bg-[#B8FFE5]/60 px-2 py-0.5 rounded border border-[#00E6A0]/40">Normal Login</span>
            </div>
            <div className="text-[11px] text-[#71817A] font-mono">
              Email: <strong className="text-[#142B25]">admin@acrelyn.com</strong> &bull; Password: <strong className="text-[#142B25]">acrelyn2026</strong>
            </div>
          </div>

          <div className="text-center pt-2">
            <Link to="/" className="text-xs text-[#71817A] hover:text-[#087F5B] font-medium transition-colors">
              &larr; Return to Public Marketplace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
