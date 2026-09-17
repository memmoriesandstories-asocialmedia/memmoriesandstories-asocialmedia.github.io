import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Tag,
  Sparkles,
  Flame,
  Clock,
  Camera,
  X,
  Search,
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { PostCard } from './PostCard';

export const FeedView: React.FC = () => {
  const {
    currentUser,
    posts,
    postDraft,
    isAuthenticated,
    openAuthModal,
    searchQuery,
    setSearchQuery,
    selectedTag,
    setSelectedTag,
    setIsCreatePostOpen,
    t,
  } = useSocial();

  const handleCreatePostClick = () => {
    setIsCreatePostOpen(true);
  };

  const [filterMode, setFilterMode] = useState<'latest' | 'popular' | 'mediaOnly'>('latest');

  // Filter posts by search query and selected tag
  let filteredPosts = posts.filter((post) => {
    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchContent = post.content.toLowerCase().includes(q);
      const matchAuthor = post.author.name.toLowerCase().includes(q) || post.author.handle.toLowerCase().includes(q);
      const matchTag = post.tags.some((t) => t.toLowerCase().includes(q));
      const matchLocation = post.location?.toLowerCase().includes(q);
      if (!matchContent && !matchAuthor && !matchTag && !matchLocation) {
        return false;
      }
    }

    // Tag filter
    if (selectedTag) {
      if (!post.tags.includes(selectedTag)) {
        return false;
      }
    }

    // Media filter
    if (filterMode === 'mediaOnly' && !post.imageUrl) {
      return false;
    }

    return true;
  });

  // Sort
  if (filterMode === 'popular') {
    filteredPosts = [...filteredPosts].sort((a, b) => b.likesCount - a.likesCount);
  }

  return (
    <div className="space-y-4">
      {/* Quick Composer Box */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-xs">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-200"
          />
          <button
            id="quick-composer-trigger-btn"
            onClick={handleCreatePostClick}
            className="flex-1 bg-neutral-100/80 hover:bg-neutral-100 text-left px-4 py-2.5 rounded-full text-xs sm:text-sm text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            {currentUser.name}，{t('post.placeholder')}
          </button>
        </div>

        {/* 自動儲存的草稿提醒 */}
        {postDraft && (postDraft.content || postDraft.imageUrl) && (
          <div
            onClick={handleCreatePostClick}
            className="mt-3 px-3 py-2 bg-amber-50 hover:bg-amber-100/90 border border-amber-200/80 rounded-xl flex items-center justify-between text-xs text-amber-900 cursor-pointer transition-colors shadow-2xs"
          >
            <div className="flex items-center gap-1.5 truncate">
              <span className="font-semibold text-amber-800 shrink-0">📝 {t('post.draftSaved')}：</span>
              <span className="truncate text-neutral-600">
                {postDraft.content || (postDraft.imageUrl ? 'Image draft' : '')}
              </span>
            </div>
            <span className="shrink-0 text-amber-700 font-semibold text-[11px] underline ml-2">
              {t('post.resumeDraft')}
            </span>
          </div>
        )}

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 px-1">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCreatePostClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <ImageIcon className="w-4 h-4 text-emerald-500" />
              <span>{t('post.addImage')}</span>
            </button>
            <button
              onClick={handleCreatePostClick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <Tag className="w-4 h-4 text-rose-500" />
              <span>{t('post.addTags')}</span>
            </button>
          </div>

          <button
            onClick={handleCreatePostClick}
            className="px-4 py-1.5 text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white rounded-xl shadow-xs transition-colors"
          >
            {t('nav.post')}
          </button>
        </div>
      </div>

      {/* Active Search or Tag Filter Banner */}
      {(searchQuery || selectedTag) && (
        <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-100 rounded-xl text-xs text-neutral-700">
          <div className="flex items-center gap-2">
            {searchQuery && (
              <span>
                Search: <strong className="text-neutral-900">"{searchQuery}"</strong>
              </span>
            )}
            {selectedTag && (
              <span className="bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-semibold">
                #{selectedTag}
              </span>
            )}
            <span className="text-neutral-400">({filteredPosts.length} posts)</span>
          </div>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag(null);
            }}
            className="text-neutral-500 hover:text-neutral-900 flex items-center gap-1 text-xs font-medium"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear filters</span>
          </button>
        </div>
      )}

      {/* Filter Mode Tabs */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-neutral-200/80 shadow-2xs">
          <button
            onClick={() => setFilterMode('latest')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'latest'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{t('feed.latest')}</span>
          </button>

          <button
            onClick={() => setFilterMode('popular')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'popular'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{t('feed.popular')}</span>
          </button>

          <button
            onClick={() => setFilterMode('mediaOnly')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              filterMode === 'mediaOnly'
                ? 'bg-neutral-900 text-white shadow-xs'
                : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{t('feed.photos')}</span>
          </button>
        </div>
      </div>

      {/* Posts Feed List */}
      {filteredPosts.length > 0 ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-neutral-100 text-neutral-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-neutral-800 text-base">沒有找到相符的貼文</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            試試看其他關鍵字，或是發佈一則新動態來與大家分享！
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedTag(null);
            }}
            className="text-xs font-semibold text-rose-600 hover:underline"
          >
            重設篩選條件
          </button>
        </div>
      )}
    </div>
  );
};
