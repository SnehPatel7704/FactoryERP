import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import apiClient from '../utils/apiClient';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // console.log(email, password);
    try {
      const data = await apiClient.post('/auth/login', { email, password });

      // Valid credentials
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      window.location.href = '/dashboard';
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f141a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 custom-scrollbar">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center flex-col items-center">
          <Settings size={48} className="text-secondary animate-pulse" />
          <h2 className="mt-4 text-center text-3xl font-extrabold text-white">
            Factory <span className="text-secondary">OS</span>
          </h2>
          <p className="mt-2 text-center text-xs text-slate-400 uppercase tracking-[0.2em] font-bold">
            Authorized Personnel Only
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface-container border border-primary/20 py-8 px-4 shadow-2xl sm:rounded-lg sm:px-10 relative overflow-hidden">
          {/* Subtle industrial texture */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-secondary to-transparent"></div>

          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
                User ID:
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-outline/30 rounded-md shadow-sm bg-[#13181f] text-slate-200 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-[0.2em]">
                Password:
              </label>
              <div className="mt-1">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-3 border border-outline/30 rounded-md shadow-sm bg-[#13181f] text-slate-200 focus:outline-none focus:ring-secondary focus:border-secondary sm:text-sm transition-colors font-mono"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-error/10 border border-error/50 p-3 rounded">
                <p className="text-xs text-error font-bold tracking-wide uppercase">{error}</p>
              </div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-xs font-bold uppercase tracking-widest text-surface-container-lowest bg-secondary hover:bg-secondary-fixed-dim focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-secondary focus:ring-offset-[#0f141a] transition-all disabled:opacity-50"
              >
                {loading ? 'Authenticating...' : 'Login'}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-primary/20 pt-4 text-center">
            <p className="text-[10px] text-slate-500 font-mono">
              System Admin Default: admin@featherafine.com / admin123
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
