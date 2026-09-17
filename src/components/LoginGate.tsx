import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Lock,
  Mail,
  KeyRound,
  User,
  Sparkles,
  ArrowRight,
  Globe,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { SUPPORTED_LANGUAGES, LanguageCode } from '../lib/i18n';

export const LoginGate: React.FC = () => {
  const {
    loginWithEmail,
    registerWithEmail,
    loginWithGoogle,
    loginAsGuest,
    language,
    setLanguage,
    t,
  } = useSocial();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await loginWithEmail(email, password);
      } else {
        await registerWithEmail(email, password, displayName);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Authentication failed';
      if (msg.includes('auth/invalid-credential') || msg.includes('auth/user-not-found') || msg.includes('auth/wrong-password')) {
        setErrorMsg('Invalid email or password. Please try again or create an account.');
      } else if (msg.includes('auth/email-already-in-use')) {
        setErrorMsg('This email is already registered. Please sign in instead.');
      } else if (msg.includes('auth/weak-password')) {
        setErrorMsg('Password must be at least 6 characters.');
      } else {
        setErrorMsg(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogle = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Google sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuest = async () => {
    setErrorMsg(null);
    setIsLoading(true);
    try {
      await loginAsGuest();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Guest sign-in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const currentLangInfo =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="min-h-screen bg-neutral-900 text-white flex flex-col relative overflow-hidden selection:bg-rose-500 selection:text-white">
      {/* Background visual accents */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar with Language Selector */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-rose-600/30">
            M
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">{t('app.name')}</h1>
            <p className="text-[11px] text-neutral-400 hidden sm:block">{t('app.slogan')}</p>
          </div>
        </div>

        {/* 11 Languages Switcher */}
        <div className="relative">
          <button
            type="button"
            id="login-lang-selector-btn"
            onClick={() => setIsLangOpen(!isLangOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-800/90 hover:bg-neutral-700 text-neutral-200 border border-neutral-700 text-xs font-medium transition-colors"
          >
            <span className="text-sm">{currentLangInfo.flag}</span>
            <span>{currentLangInfo.nativeName}</span>
            <Globe className="w-3.5 h-3.5 text-neutral-400 ml-1" />
          </button>

          <AnimatePresence>
            {isLangOpen && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                className="absolute right-0 mt-2 w-56 bg-neutral-800 border border-neutral-700 rounded-2xl shadow-xl overflow-hidden z-50 py-1.5 max-h-80 overflow-y-auto"
              >
                <div className="px-3 py-1.5 text-[10px] font-semibold tracking-wider text-neutral-400 uppercase">
                  Select Language (11 Available)
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => {
                      setLanguage(lang.code);
                      setIsLangOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left text-xs flex items-center justify-between hover:bg-neutral-700 transition-colors ${
                      language === lang.code ? 'text-rose-400 font-semibold bg-neutral-700/50' : 'text-neutral-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-base">{lang.flag}</span>
                      <span>{lang.nativeName}</span>
                    </div>
                    {language === lang.code && <CheckCircle2 className="w-3.5 h-3.5 text-rose-400" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div className="w-full max-w-md bg-neutral-800/90 backdrop-blur-xl border border-neutral-700/70 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Header text */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 text-xs font-semibold">
              <Lock className="w-3.5 h-3.5" />
              <span>{t('auth.mustLoginNotice')}</span>
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {mode === 'login' ? t('auth.login') : t('auth.register')}
            </h2>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs mx-auto">
              {t('auth.gateSubtitle')}
            </p>
          </div>

          {/* Error Banner */}
          {errorMsg && (
            <div className="p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-xs text-rose-200 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-400" />
                  <span>{t('auth.name')}</span>
                </label>
                <input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={t('auth.namePlaceholder')}
                  className="w-full px-3.5 py-2.5 bg-neutral-900/80 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
                />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                <span>{t('auth.email')}</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.emailPlaceholder')}
                className="w-full px-3.5 py-2.5 bg-neutral-900/80 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-neutral-400" />
                <span>{t('auth.password')}</span>
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t('auth.passwordPlaceholder')}
                className="w-full px-3.5 py-2.5 bg-neutral-900/80 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-rose-600 hover:bg-rose-500 active:scale-[0.99] text-white font-semibold rounded-xl text-sm shadow-md shadow-rose-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <span>{isLoading ? t('auth.signingIn') : mode === 'login' ? t('auth.signInBtn') : t('auth.signUpBtn')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Social / Alternative buttons */}
          <div className="space-y-3 pt-1">
            <div className="relative flex items-center justify-center">
              <div className="border-t border-neutral-700 w-full" />
              <span className="bg-neutral-800 px-3 text-[10px] text-neutral-400 font-semibold uppercase tracking-wider absolute">
                {t('auth.or')}
              </span>
            </div>

            <button
              type="button"
              onClick={handleGoogle}
              disabled={isLoading}
              className="w-full py-2.5 bg-neutral-900/90 hover:bg-neutral-700 text-white text-xs font-medium border border-neutral-700 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
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
              <span>{t('auth.googleBtn')}</span>
            </button>

            <button
              type="button"
              onClick={handleGuest}
              disabled={isLoading}
              className="w-full py-2.5 bg-neutral-700/60 hover:bg-neutral-700 text-amber-300 text-xs font-medium border border-neutral-600/80 rounded-xl flex items-center justify-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{t('auth.guestBtn')}</span>
            </button>
          </div>

          {/* Toggle Login/Register */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setErrorMsg(null);
              }}
              className="text-xs text-neutral-400 hover:text-white transition-colors"
            >
              {mode === 'login' ? t('auth.noAccount') : t('auth.haveAccount')}{' '}
              <span className="text-rose-400 font-semibold underline ml-1">
                {mode === 'login' ? t('auth.register') : t('auth.login')}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer info */}
      <footer className="relative z-10 py-4 text-center text-xs text-neutral-500 border-t border-neutral-800">
        <div className="flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-neutral-400" />
          <span>Moments & Stories Platform • Multi-Language (11 Languages) • Secured by Firebase</span>
        </div>
      </footer>
    </div>
  );
};
