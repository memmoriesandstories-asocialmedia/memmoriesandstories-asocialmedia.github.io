import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  LogIn,
  UserPlus,
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';

export const AuthModal: React.FC = () => {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalMode,
    setAuthModalMode,
    loginWithGoogle,
    loginWithEmail,
    registerWithEmail,
    loginAsGuest,
  } = useSocial();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isAuthModalOpen) return null;

  const handleModeChange = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setErrorMessage(null);
  };

  const getFriendlyErrorMessage = (error: any): string => {
    const code = error?.code || '';
    if (code === 'auth/invalid-credential' || code === 'auth/wrong-password' || code === 'auth/user-not-found') {
      return '電子郵件或密碼不正確，請重新檢查。';
    }
    if (code === 'auth/email-already-in-use') {
      return '此電子郵件已被註冊，請直接點選登入。';
    }
    if (code === 'auth/weak-password') {
      return '密碼長度建議至少 6 個字元。';
    }
    if (code === 'auth/invalid-email') {
      return '請輸入有效的電子郵件格式。';
    }
    if (code === 'auth/popup-closed-by-user') {
      return 'Google 登入視窗已關閉。';
    }
    if (code === 'auth/popup-blocked') {
      return '瀏覽器封鎖了彈出式視窗，請允許彈出視窗後重試。';
    }
    return error?.message || '登入時發生錯誤，請稍後再試。';
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (authModalMode === 'login') {
        await loginWithEmail(email, password);
      } else {
        if (!displayName.trim()) {
          setErrorMessage('請輸入顯示名稱。');
          setLoading(false);
          return;
        }
        await registerWithEmail(email, password, displayName.trim());
      }
      closeAuthModal();
      setEmail('');
      setPassword('');
      setDisplayName('');
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await loginWithGoogle();
      closeAuthModal();
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setErrorMessage(null);
    setLoading(true);
    try {
      await loginAsGuest();
      closeAuthModal();
    } catch (err: any) {
      setErrorMessage(getFriendlyErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs overflow-y-auto">
        <div className="fixed inset-0" onClick={closeAuthModal} />

        <motion.div
          id="auth-modal"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-6 z-10"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-tr from-rose-500 via-rose-600 to-amber-500 p-6 text-white text-center relative">
            <button
              id="close-auth-modal-btn"
              onClick={closeAuthModal}
              className="absolute top-4 right-4 p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm mx-auto flex items-center justify-center mb-3 shadow-inner">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-bold tracking-tight">歡迎來到社群分享</h3>
            <p className="text-xs text-white/85 mt-1">
              登入即可發佈動態、按讚、收藏貼文與管理專屬個人主頁
            </p>
          </div>

          <div className="p-6 space-y-5">
            {/* Tabs: Login vs Register */}
            <div className="flex rounded-xl bg-neutral-100 p-1">
              <button
                type="button"
                id="auth-tab-login"
                onClick={() => handleModeChange('login')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  authModalMode === 'login'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>會員登入</span>
              </button>
              <button
                type="button"
                id="auth-tab-register"
                onClick={() => handleModeChange('register')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  authModalMode === 'register'
                    ? 'bg-white text-neutral-900 shadow-xs'
                    : 'text-neutral-500 hover:text-neutral-900'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>註冊帳號</span>
              </button>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMessage}</div>
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              id="google-sign-in-btn"
              type="button"
              disabled={loading}
              onClick={handleGoogleAuth}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-800 text-sm font-semibold shadow-xs transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>使用 Google 快速登入</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-neutral-200 w-full" />
              <span className="bg-white px-3 text-[11px] text-neutral-400 uppercase tracking-wider shrink-0 font-medium">
                或使用電子信箱
              </span>
            </div>

            {/* Email Form */}
            <form onSubmit={handleEmailAuth} className="space-y-3.5">
              {authModalMode === 'register' && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    顯示名稱
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="auth-display-name-input"
                      type="text"
                      required
                      placeholder="你的暱稱或姓名"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/15 transition-all"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  電子郵件
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-email-input"
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/15 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  密碼
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="auth-password-input"
                    type="password"
                    required
                    placeholder="請輸入密碼 (至少 6 碼)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white text-xs sm:text-sm text-neutral-800 placeholder-neutral-400 pl-10 pr-3.5 py-2.5 rounded-xl border border-neutral-200 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/15 transition-all"
                  />
                </div>
              </div>

              <button
                id="auth-submit-btn"
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:scale-98 text-white text-sm font-semibold shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>處理中...</span>
                  </>
                ) : authModalMode === 'login' ? (
                  <span>登入帳號</span>
                ) : (
                  <span>註冊並開始使用</span>
                )}
              </button>
            </form>

            {/* Guest / Anonymous quick option */}
            <div className="pt-2 border-t border-neutral-100 flex flex-col items-center gap-2">
              <button
                id="auth-guest-login-btn"
                type="button"
                disabled={loading}
                onClick={handleGuestLogin}
                className="text-xs text-neutral-500 hover:text-neutral-800 font-medium hover:underline transition-colors flex items-center gap-1"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>不想註冊？以訪客模式快速體驗</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
