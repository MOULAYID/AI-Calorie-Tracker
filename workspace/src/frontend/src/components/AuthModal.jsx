import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Check, LogIn, KeyRound, ShieldCheck } from 'lucide-react';
import { 
  loginUser, 
  registerUser, 
  verifyEmail, 
  resendVerificationCode, 
  requestForgotPassword, 
  resetPassword 
} from '../services/api';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [mode, setMode] = useState('login'); // login | register | verify_email | forgot_password | reset_password
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Verification & Reset states
  const [verificationCode, setVerificationCode] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [codePreview, setCodePreview] = useState('');
  
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await registerUser(name || 'User', email, password);
      if (res.verification_code_preview) {
        setCodePreview(res.verification_code_preview);
      }
      setMessage(`Verification code sent to ${email}! Check terminal log or input preview code below.`);
      setMode('verify_email');
    } catch (err) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyEmail = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await verifyEmail(email, verificationCode);
      setMessage('✅ Email verified successfully! Logging you in...');
      const loginRes = await loginUser(email, password);
      onAuthSuccess(loginRes.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setMessage('Resending verification code...');
    try {
      const res = await resendVerificationCode(email);
      if (res.verification_code_preview) {
        setCodePreview(res.verification_code_preview);
      }
      setMessage(`New 6-digit code sent to ${email}!`);
    } catch (err) {
      setError(err.message || 'Failed to resend code');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await requestForgotPassword(email);
      if (res.reset_token_preview) {
        setResetToken(res.reset_token_preview);
      }
      setMessage(`Password reset link/token generated! Enter your reset token & new password below.`);
      setMode('reset_password');
    } catch (err) {
      setError(err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      await resetPassword(resetToken, newPassword);
      setMessage('✅ Password reset successfully! You can now sign in.');
      setPassword(newPassword);
      setMode('login');
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await loginUser(email, password);
      onAuthSuccess(res.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const fillAdminCredentials = () => {
    setEmail('admin@nutriscan.app');
    setPassword('admin123');
    setMode('login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-panel rounded-3xl w-full max-w-sm overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => { setMode('login'); setError(''); setMessage(''); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${mode === 'login' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('register'); setError(''); setMessage(''); }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${mode === 'register' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'}`}
            >
              Sign Up
            </button>
          </div>

          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3 text-xs">
          
          {error && (
            <div className="p-2.5 bg-rose-500/20 border border-rose-500/30 text-rose-300 rounded-xl text-[11px] font-semibold">
              {error}
            </div>
          )}

          {message && (
            <div className="p-2.5 bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 rounded-xl text-[11px] font-semibold space-y-1">
              <div>{message}</div>
              {codePreview && <div className="text-[10px] text-amber-300">Code Preview: <strong>{codePreview}</strong></div>}
            </div>
          )}

          {/* MODE: SIGN IN */}
          {mode === 'login' && (
            <form onSubmit={handleLogin} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-slate-400 font-semibold">Password</label>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot_password'); setError(''); setMessage(''); }}
                    className="text-[10px] text-emerald-400 font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
              >
                {loading ? 'Signing In...' : <><LogIn className="w-4 h-4" /> Sign In</>}
              </button>
            </form>
          )}

          {/* MODE: REGISTER */}
          {mode === 'register' && (
            <form onSubmit={handleRegister} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Full Name</label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 mt-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
              >
                {loading ? 'Creating Account...' : <><Check className="w-4 h-4 stroke-[3]" /> Create Account & Verify Email</>}
              </button>
            </form>
          )}

          {/* MODE: VERIFY EMAIL */}
          {mode === 'verify_email' && (
            <form onSubmit={handleVerifyEmail} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Enter 6-Digit Email Code</label>
                <div className="relative">
                  <ShieldCheck className="w-4 h-4 text-teal-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="e.g. 123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-teal-500/40 rounded-xl text-slate-100 font-extrabold text-center tracking-widest text-base focus:outline-none focus:border-teal-400"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-teal-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95 transition"
              >
                {loading ? 'Verifying...' : <><Check className="w-4 h-4 stroke-[3]" /> Verify Account</>}
              </button>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={handleResendCode}
                  className="text-[10px] text-slate-400 hover:text-emerald-400 font-semibold underline"
                >
                  Resend 6-Digit Verification Code
                </button>
              </div>
            </form>
          )}

          {/* MODE: FORGOT PASSWORD */}
          {mode === 'forgot_password' && (
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <p className="text-[11px] text-slate-400">
                Enter your email address below and we will send you a password reset code/link.
              </p>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition"
              >
                {loading ? 'Sending Request...' : <><KeyRound className="w-4 h-4" /> Send Reset Code</>}
              </button>
            </form>
          )}

          {/* MODE: RESET PASSWORD */}
          {mode === 'reset_password' && (
            <form onSubmit={handleResetPassword} className="space-y-3">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Reset Code / Token</label>
                <input
                  type="text"
                  required
                  placeholder="Paste reset token"
                  value={resetToken}
                  onChange={(e) => setResetToken(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">New Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-2xl bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
              >
                {loading ? 'Updating Password...' : <><Check className="w-4 h-4 stroke-[3]" /> Save New Password</>}
              </button>
            </form>
          )}

          <div className="pt-2 border-t border-slate-800 text-center">
            <button
              type="button"
              onClick={fillAdminCredentials}
              className="text-[10px] text-amber-400 font-semibold hover:underline"
            >
              🔑 Fill Owner Admin Credentials (admin@nutriscan.app)
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
