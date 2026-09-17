import React, { useState } from 'react';
import {
  Sparkles,
  Compass,
  Home,
  Bookmark,
  PlusCircle,
  Search,
  LogIn,
  LogOut,
  X,
  Globe,
  CheckCircle2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useSocial } from '../context/SocialContext';
import { SUPPORTED_LANGUAGES } from '../lib/i18n';

export const Navbar: React.FC = () => {
  const {
    currentUser,
    isAuthenticated,
    openAuthModal,
    logout,
    activeTab,
    setActiveTab,
    searchQuery,
    setSearchQuery,
    setIsCreatePostOpen,
    language,
    setLanguage,
    t,
  } = useSocial();

  const [isLangOpen, setIsLangOpen] = useState(false);

  const currentLang =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <header className="sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-neutral-200/80 shadow-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <div
          id="nav-logo"
          onClick={() => setActiveTab('feed')}
          className="flex items-center gap-2.5 cursor-pointer select-none shrink-0 group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-neutral-900 block leading-tight">
              {t('app.name')}
            </span>
            <span className="text-xs text-neutral-500 font-medium hidden sm:block">
              {t('app.slogan')}
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative flex-1 max-w-md hidden md:block">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="nav-search-input"
            type="text"
            placeholder={t('nav.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-100/80 hover:bg-neutral-100 focus:bg-white text-sm text-neutral-800 placeholder-neutral-400 pl-10 pr-9 py-2 rounded-full border border-transparent focus:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all"
          />
          {searchQuery && (
            <button
              id="nav-clear-search-btn"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Action Controls & Navigation */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Main Feed Tab Button */}
          <button
            id="nav-tab-feed"
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'feed'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <Home className="w-4 h-4" />
            <span className="hidden sm:inline">{t('nav.feed')}</span>
          </button>

          {/* Explore Tab */}
          <button
            id="nav-tab-explore"
            onClick={() => setActiveTab('explore')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'explore'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span className="hidden sm:inline">{t('nav.explore')}</span>
          </button>

          {/* Bookmarks Tab */}
          <button
            id="nav-tab-bookmarks"
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'bookmarks'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span className="hidden sm:inline">{t('nav.bookmarks')}</span>
          </button>

          {/* New Post CTA */}
          <button
            id="nav-create-post-btn"
            onClick={() => {
              if (!isAuthenticated) {
                openAuthModal('login');
              } else {
                setIsCreatePostOpen(true);
              }
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 active:scale-95 text-white shadow-sm shadow-rose-600/25 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{t('nav.post')}</span>
          </button>

          {/* 11 Languages Switcher Dropdown */}
          <div className="relative">
            <button
              id="nav-language-btn"
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center gap-1 px-2.5 py-2 rounded-xl text-xs sm:text-sm font-medium text-neutral-700 hover:bg-neutral-100 border border-neutral-200 transition-colors"
              title="Change Language (11 available)"
            >
              <span className="text-sm">{currentLang.flag}</span>
              <span className="hidden lg:inline">{currentLang.nativeName}</span>
              <Globe className="w-3.5 h-3.5 text-neutral-500" />
            </button>

            <AnimatePresence>
              {isLangOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 5 }}
                  className="absolute right-0 mt-2 w-52 bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden z-50 py-1.5 max-h-72 overflow-y-auto"
                >
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider">
                    {t('nav.language')} (11)
                  </div>
                  {SUPPORTED_LANGUAGES.map((item) => (
                    <button
                      key={item.code}
                      onClick={() => {
                        setLanguage(item.code);
                        setIsLangOpen(false);
                      }}
                      className={`w-full px-3 py-1.5 text-left text-xs flex items-center justify-between hover:bg-neutral-50 transition-colors ${
                        language === item.code ? 'font-bold text-rose-600 bg-rose-50/50' : 'text-neutral-700'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span>{item.flag}</span>
                        <span>{item.nativeName}</span>
                      </div>
                      {language === item.code && <CheckCircle2 className="w-3.5 h-3.5 text-rose-600" />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Authentication State Button */}
          {isAuthenticated ? (
            <div className="flex items-center gap-1.5">
              <button
                id="nav-user-profile-btn"
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border transition-all ${
                  activeTab === 'profile'
                    ? 'border-rose-500 ring-2 ring-rose-500/20 bg-rose-50/50'
                    : 'border-neutral-200 hover:border-neutral-300 bg-white'
                }`}
                title={t('nav.profile')}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-7 h-7 rounded-full object-cover ring-1 ring-neutral-200"
                />
                <span className="text-xs font-semibold text-neutral-800 max-w-[70px] truncate hidden md:inline">
                  {currentUser.name}
                </span>
              </button>
              <button
                id="nav-logout-btn"
                onClick={logout}
                title={t('nav.logout')}
                className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="nav-login-btn"
              onClick={() => openAuthModal('login')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-white shadow-xs transition-all"
            >
              <LogIn className="w-4 h-4" />
              <span>{t('auth.login')} / {t('auth.register')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Search Bar row when screen is small */}
      <div className="px-4 pb-2.5 md:hidden">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="nav-search-input-mobile"
            type="text"
            placeholder={t('nav.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-neutral-100 text-sm text-neutral-800 placeholder-neutral-400 pl-10 pr-8 py-1.5 rounded-full border border-neutral-200 focus:outline-none focus:bg-white focus:ring-2 focus:ring-rose-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

