import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, Bot, MessageSquare, LayoutGrid, Loader2 } from 'lucide-react';
import { Button, Input } from '../../../components';
import useAuthStore from '../../../stores/authStore';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setErrorMsg(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Panel - Dark Gradient & Branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-[radial-gradient(120%_120%_at_0%_0%,#0B1A4E_0%,#071239_35%,#040B26_70%,#020818_100%)] text-white p-12 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-16">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <span className="text-2xl font-bold tracking-tight">Sellrise</span>
          </div>

          <div className="max-w-lg mt-20">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#050D2E] border border-blue-900/50 text-sm font-medium mb-8 text-blue-200 shadow-xl">
              <Sparkles className="w-4 h-4" /> AI-Powered Sales Agent
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-6 leading-[1.15]">
              Sell where your <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">
                customers chat
              </span>
            </h1>
            <p className="text-slate-400 text-lg mb-12 leading-relaxed">
              Engage leads across WhatsApp, Instagram, TikTok, and more with an AI agent that never misses a message.
            </p>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-md">
                <Bot className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-medium text-slate-200">Automated replies</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-md">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-slate-200">Omnichannel support</span>
              </div>
              <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-2 backdrop-blur-md">
                <LayoutGrid className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-medium text-slate-200">Unified dashboard</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-slate-400 text-sm font-medium">
          © {new Date().getFullYear()} Sellrise Limited. All rights reserved.
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex flex-col flex-1 items-center justify-center p-8 sm:p-12 relative">

        <div className="w-full max-w-[420px] space-y-8 animate-[fadeIn_0.5s_ease-out]">
          {/* Mobile Logo */}
          <div className="flex lg:hidden items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-xl font-bold text-white">S</span>
            </div>
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Sellrise</span>
          </div>

          <div className="text-center lg:text-left">
            <h2 className="text-[32px] font-extrabold text-gray-900 tracking-tight mb-2">
              Welcome back
            </h2>
            <p className="text-gray-500 text-base">
              Please enter your details to sign in.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleLogin}>
            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                {errorMsg}
              </div>
            )}
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-gray-700" htmlFor="email">
                  Email
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-[13px] font-bold text-gray-700" htmlFor="password">
                  Password
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="block w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-colors cursor-pointer"
                />
                <label htmlFor="remember-me" className="ml-2.5 block text-sm font-medium text-gray-600 cursor-pointer">
                  Remember me
                </label>
              </div>

              <div className="text-sm">
                <Link to="/forgot-password" className="font-semibold text-blue-600 hover:text-blue-700 transition-colors">
                  Forgot password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 border border-transparent rounded-xl shadow-lg shadow-blue-500/30 text-[15px] font-bold text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all hover:scale-[1.02] active:scale-[0.98] mt-4 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Sign in <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-10">
            Don't have an account?{' '}
            <Link to="/signup" className="font-semibold text-blue-600 hover:text-blue-700 hover:underline transition-all">
              Start your free trial
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
