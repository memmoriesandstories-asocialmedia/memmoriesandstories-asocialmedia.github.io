import React from 'react';
import {
  TrendingUp,
  PlusCircle,
  LogIn,
  ShieldCheck,
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';

const TRENDING_TAGS = [
  { tag: '咖啡時光', count: 184 },
  { tag: '城市漫遊', count: 142 },
  { tag: '攝影日記', count: 320 },
  { tag: '數位遊牧', count: 96 },
  { tag: '設計靈感', count: 215 },
  { tag: '旅行日記', count: 410 },
  { tag: '生活碎片', count: 528 },
];

export const Sidebar: React.FC = () => {
  const {
    currentUser,
    posts,
    isAuthenticated,
    openAuthModal,
    selectedTag,
    setSelectedTag,
    setActiveTab,
    setIsCreatePostOpen,
    t,
  } = useSocial();

  const myPostsCount = posts.filter((p) => p.author.id === currentUser.id).length;

  const handleTagSelect = (tag: string) => {
    if (selectedTag === tag) {
      setSelectedTag(null);
    } else {
      setSelectedTag(tag);
      setActiveTab('explore');
    }
  };

  return (
    <aside className="space-y-5">
      {/* Current User Quick Summary Card or Login Prompt Card */}
      {isAuthenticated ? (
        <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs overflow-hidden">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-xl object-cover ring-1 ring-neutral-200"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h4 className="font-semibold text-sm text-neutral-900 truncate">
                  {currentUser.name}
                </h4>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </div>
              <p className="text-xs text-neutral-400 truncate">{currentUser.handle}</p>
            </div>
          </div>

          <p className="text-xs text-neutral-600 mt-3 line-clamp-2 leading-relaxed">
            {currentUser.bio}
          </p>

          <div className="grid grid-cols-3 gap-2 text-center py-3 my-3 border-y border-neutral-100">
            <div>
              <div className="text-xs font-bold text-neutral-900">{myPostsCount}</div>
              <div className="text-[11px] text-neutral-400">{t('profile.posts')}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900">{currentUser.followersCount}</div>
              <div className="text-[11px] text-neutral-400">{t('profile.followers')}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-neutral-900">{currentUser.followingCount}</div>
              <div className="text-[11px] text-neutral-400">{t('profile.following')}</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="sidebar-view-profile-btn"
              onClick={() => setActiveTab('profile')}
              className="flex-1 py-2 text-xs font-semibold bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded-xl transition-colors text-center"
            >
              {t('profile.edit')}
            </button>
            <button
              id="sidebar-create-post-btn"
              onClick={() => setIsCreatePostOpen(true)}
              className="p-2 text-white bg-rose-600 hover:bg-rose-500 rounded-xl transition-colors shadow-xs"
              title={t('nav.post')}
            >
              <PlusCircle className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 text-white rounded-2xl p-5 shadow-sm space-y-3">
          <div className="flex items-center gap-2 text-rose-400">
            <LogIn className="w-4 h-4" />
            <span className="text-xs font-bold tracking-wide uppercase">{t('auth.login')}</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{t('auth.gateSubtitle')}</h4>
          </div>
          <button
            id="sidebar-login-cta-btn"
            onClick={() => openAuthModal('login')}
            className="w-full py-2 px-3 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-xs transition-colors text-center"
          >
            {t('auth.login')} / {t('auth.register')}
          </button>
        </div>
      )}

      {/* Trending Tags Widget */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
            <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
            <span>{t('explore.trending')}</span>
          </h4>
          {selectedTag && (
            <button
              onClick={() => setSelectedTag(null)}
              className="text-[11px] text-rose-600 hover:underline font-medium"
            >
              {t('explore.all')}
            </button>
          )}
        </div>

        <div className="space-y-1.5">
          {TRENDING_TAGS.map((item) => {
            const isSelected = selectedTag === item.tag;
            return (
              <button
                key={item.tag}
                onClick={() => handleTagSelect(item.tag)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition-all text-left ${
                  isSelected
                    ? 'bg-rose-50 text-rose-700 font-semibold border border-rose-200'
                    : 'hover:bg-neutral-50 text-neutral-700'
                }`}
              >
                <span className="font-medium">#{item.tag}</span>
                <span className="text-[11px] text-neutral-400">{item.count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer Info */}
      <div className="px-2 text-[11px] text-neutral-400 space-y-1">
        <p>© 2026 Moments & Stories • Multi-Language Support (11 Languages)</p>
        <p>Built with React & Vite • Safe & Friendly Community</p>
      </div>
    </aside>
  );
};
