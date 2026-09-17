import React, { useState } from 'react';
import {
  MapPin,
  Link as LinkIcon,
  Calendar,
  Edit3,
  Grid,
  Heart,
  FileText,
  PlusCircle,
  Sparkles,
  LogIn,
  LogOut,
  ShieldCheck,
  Mail,
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { PostCard } from './PostCard';

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    posts,
    isAuthenticated,
    firebaseUser,
    logout,
    openAuthModal,
    setIsEditProfileOpen,
    setIsCreatePostOpen,
    t,
  } = useSocial();

  const [activeSubTab, setActiveSubTab] = useState<'posts' | 'liked' | 'media'>('posts');

  const myPosts = posts.filter((p) => p.author.id === currentUser.id);
  const likedPosts = posts.filter((p) => p.isLiked);
  const mediaPosts = posts.filter((p) => p.author.id === currentUser.id && p.imageUrl);

  // Total likes received on user's own posts
  const totalLikesReceived = myPosts.reduce((acc, p) => acc + p.likesCount, 0);

  return (
    <div className="space-y-6">
      {/* Unauthenticated / Guest Welcome Banner */}
      {!isAuthenticated && (
        <div className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-rose-500/10 border border-rose-200/80 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-neutral-900">
                登入您的專屬帳號
              </h4>
              <p className="text-xs text-neutral-600 mt-0.5">
                登入後即可享有雲端同步、發佈動態、自訂個人檔案與永久保存點讚記錄
              </p>
            </div>
          </div>
          <button
            id="profile-login-banner-btn"
            onClick={() => openAuthModal('login')}
            className="px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors shrink-0 flex items-center gap-1.5"
          >
            <LogIn className="w-4 h-4" />
            <span>登入 / 註冊</span>
          </button>
        </div>
      )}

      {/* Profile Card Header */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        {/* Cover Photo */}
        <div className="h-44 sm:h-56 w-full relative bg-neutral-100">
          <img
            src={currentUser.coverImage}
            alt="Profile cover"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
        </div>

        {/* Profile Info Row */}
        <div className="px-5 sm:px-8 pb-6 relative">
          {/* Avatar and Action Button */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-4">
            <div className="relative">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-28 h-28 sm:w-36 sm:h-36 rounded-2xl sm:rounded-3xl object-cover ring-4 ring-white shadow-lg bg-white"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isAuthenticated ? (
                <>
                  <button
                    id="profile-edit-btn"
                    onClick={() => setIsEditProfileOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-neutral-900 hover:bg-neutral-800 text-white shadow-xs transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                    <span>編輯個人檔案</span>
                  </button>
                  <button
                    id="profile-new-post-btn"
                    onClick={() => setIsCreatePostOpen(true)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 transition-colors"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>發新動態</span>
                  </button>
                  <button
                    id="profile-logout-btn"
                    onClick={logout}
                    className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200 transition-colors"
                    title="登出帳號"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <button
                  id="profile-cta-login-btn"
                  onClick={() => openAuthModal('login')}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white shadow-sm transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>登入您的會員帳號</span>
                </button>
              )}
            </div>
          </div>

          {/* Names and Bio */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">
                  {currentUser.name}
                </h1>
                {isAuthenticated && (
                  <span
                    className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-medium flex items-center gap-1"
                    title="已通過 Firebase 雲端身份驗證"
                  >
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    <span>已連線雲端</span>
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm font-medium text-neutral-400">{currentUser.handle}</p>
                {currentUser.email && (
                  <span className="text-xs text-neutral-400 flex items-center gap-1">
                    <Mail className="w-3 h-3 text-neutral-400" />
                    {currentUser.email}
                  </span>
                )}
              </div>
            </div>

            {/* Bio text */}
            <p className="text-sm sm:text-base text-neutral-700 leading-relaxed max-w-2xl whitespace-pre-wrap">
              {currentUser.bio}
            </p>

            {/* Meta tags: Location, Website, Joined Date */}
            <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-neutral-500 pt-1">
              {currentUser.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>{currentUser.location}</span>
                </div>
              )}
              {currentUser.website && (
                <div className="flex items-center gap-1">
                  <LinkIcon className="w-3.5 h-3.5 text-blue-500" />
                  <a
                    href={currentUser.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline font-medium"
                  >
                    {currentUser.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                <span>加入於 {currentUser.joinedDate}</span>
              </div>
            </div>

            {/* Statistics Row */}
            <div className="flex items-center gap-6 pt-3 border-t border-neutral-100">
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-neutral-900">{myPosts.length}</span>
                <span className="text-xs text-neutral-500">{t('profile.posts')}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-neutral-900">
                  {currentUser.followersCount.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-500">{t('profile.followers')}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-neutral-900">
                  {currentUser.followingCount.toLocaleString()}
                </span>
                <span className="text-xs text-neutral-500">{t('profile.following')}</span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="text-base font-bold text-rose-600">
                  {totalLikesReceived}
                </span>
                <span className="text-xs text-neutral-500">{t('profile.likes')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sub Navigation Tabs */}
        <div className="flex items-center border-t border-neutral-100 bg-neutral-50/50 px-6">
          <button
            id="subtab-my-posts"
            onClick={() => setActiveSubTab('posts')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeSubTab === 'posts'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>{t('profile.myPosts')} ({myPosts.length})</span>
          </button>
          <button
            id="subtab-liked-posts"
            onClick={() => setActiveSubTab('liked')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeSubTab === 'liked'
                ? 'border-rose-500 text-rose-600'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Heart className="w-4 h-4" />
            <span>{t('profile.likedPosts')} ({likedPosts.length})</span>
          </button>
          <button
            id="subtab-media-grid"
            onClick={() => setActiveSubTab('media')}
            className={`flex items-center gap-2 py-3.5 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
              activeSubTab === 'media'
                ? 'border-neutral-900 text-neutral-900'
                : 'border-transparent text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Grid className="w-4 h-4" />
            <span>{t('profile.mediaWall')} ({mediaPosts.length})</span>
          </button>
        </div>
      </div>

      {/* Sub Tab Content */}
      {activeSubTab === 'posts' && (
        <div className="space-y-4">
          {myPosts.length > 0 ? (
            myPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-neutral-800">尚未發佈任何動態</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                {isAuthenticated
                  ? '點擊下方按鈕上傳照片並記錄當下的靈感與生活吧！'
                  : '登入帳號後即可開始發佈專屬於你的社群貼文。'}
              </p>
              <button
                onClick={() => {
                  if (isAuthenticated) {
                    setIsCreatePostOpen(true);
                  } else {
                    openAuthModal('login');
                  }
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>{isAuthenticated ? '發佈第一則動態' : '立即登入發佈'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'liked' && (
        <div className="space-y-4">
          {likedPosts.length > 0 ? (
            likedPosts.map((post) => <PostCard key={post.id} post={post} />)
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-neutral-800">尚未按讚任何貼文</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                在首頁或探索發現喜歡的作品時，點擊愛心收藏進您的讚好列表。
              </p>
            </div>
          )}
        </div>
      )}

      {activeSubTab === 'media' && (
        <div>
          {mediaPosts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {mediaPosts.map((post) => (
                <div
                  key={post.id}
                  className="aspect-square bg-neutral-100 rounded-xl overflow-hidden relative group cursor-pointer border border-neutral-200"
                >
                  <img
                    src={post.imageUrl}
                    alt={post.content}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 text-white font-semibold text-sm">
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4 fill-white" />
                      <span>{post.likesCount}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      <span>{post.comments.length}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto">
                <Grid className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-neutral-800">尚無照片作品</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                發佈包含相片的貼文後，都會在此以相片牆形式呈現。
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
