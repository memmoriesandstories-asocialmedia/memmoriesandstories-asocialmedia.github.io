import React from 'react';
import { SocialProvider, useSocial } from './context/SocialContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FeedView } from './components/FeedView';
import { ExploreView } from './components/ExploreView';
import { BookmarksView } from './components/BookmarksView';
import { ProfileView } from './components/ProfileView';
import { CreatePostModal } from './components/CreatePostModal';
import { EditProfileModal } from './components/EditProfileModal';
import { AuthModal } from './components/AuthModal';
import { LoginGate } from './components/LoginGate';
import { Toast } from './components/Toast';
import {
  Home,
  Compass,
  PlusCircle,
  Bookmark,
  Loader2,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setIsCreatePostOpen,
    currentUser,
    isAuthenticated,
    isAuthLoading,
    openAuthModal,
    t,
  } = useSocial();

  // 1. 若仍在檢查驗證狀態，顯示乾淨優雅的載入畫面
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-600 flex items-center justify-center font-bold text-xl animate-bounce">
          M
        </div>
        <div className="flex items-center gap-2 text-neutral-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin text-rose-500" />
          <span>Checking authorization...</span>
        </div>
      </div>
    );
  }

  // 2. 使用者要求：改為必須登入 (Mandatory Login Gate)
  if (!isAuthenticated) {
    return (
      <>
        <LoginGate />
        <Toast />
      </>
    );
  }

  // 3. 已驗證登入後進入社群平台
  return (
    <div className="min-h-screen bg-neutral-100/60 text-neutral-900 flex flex-col font-sans selection:bg-rose-500 selection:text-white pb-20 md:pb-8">
      {/* Top Navigation */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Feed / Profile Column */}
          <div
            className={`${
              activeTab === 'profile' ? 'lg:col-span-12' : 'lg:col-span-8'
            } w-full space-y-6`}
          >
            {activeTab === 'feed' && <FeedView />}
            {activeTab === 'explore' && <ExploreView />}
            {activeTab === 'bookmarks' && <BookmarksView />}
            {activeTab === 'profile' && <ProfileView />}
          </div>

          {/* Right Sidebar (Shown on feed/explore/bookmarks) */}
          {activeTab !== 'profile' && (
            <div className="hidden lg:block lg:col-span-4 sticky top-24">
              <Sidebar />
            </div>
          )}
        </div>
      </main>

      {/* Bottom Mobile Tab Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 py-2 flex items-center justify-around md:hidden shadow-lg">
        <button
          onClick={() => setActiveTab('feed')}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            activeTab === 'feed' ? 'text-rose-600 font-semibold' : 'text-neutral-500'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px]">{t('nav.feed')}</span>
        </button>

        <button
          onClick={() => setActiveTab('explore')}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            activeTab === 'explore' ? 'text-rose-600 font-semibold' : 'text-neutral-500'
          }`}
        >
          <Compass className="w-5 h-5" />
          <span className="text-[10px]">{t('nav.explore')}</span>
        </button>

        {/* Center Floating Post Button */}
        <button
          onClick={() => {
            if (!isAuthenticated) {
              openAuthModal('login');
            } else {
              setIsCreatePostOpen(true);
            }
          }}
          className="flex items-center justify-center w-11 h-11 rounded-full bg-rose-600 text-white shadow-md shadow-rose-600/30 -mt-4 active:scale-95 transition-transform"
          title={t('nav.post')}
        >
          <PlusCircle className="w-6 h-6" />
        </button>

        <button
          onClick={() => setActiveTab('bookmarks')}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            activeTab === 'bookmarks' ? 'text-rose-600 font-semibold' : 'text-neutral-500'
          }`}
        >
          <Bookmark className="w-5 h-5" />
          <span className="text-[10px]">{t('nav.bookmarks')}</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`flex flex-col items-center gap-0.5 p-1 ${
            activeTab === 'profile' ? 'text-rose-600 font-semibold' : 'text-neutral-500'
          }`}
        >
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className={`w-5 h-5 rounded-full object-cover ${
              activeTab === 'profile' ? 'ring-2 ring-rose-600' : ''
            }`}
          />
          <span className="text-[10px]">{t('nav.profile')}</span>
        </button>
      </div>

      {/* Global Modals & Toast */}
      <CreatePostModal />
      <EditProfileModal />
      <AuthModal />
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <SocialProvider>
      <MainLayout />
    </SocialProvider>
  );
}
