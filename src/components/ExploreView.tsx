import React, { useState } from 'react';
import {
  Compass,
  TrendingUp,
  Heart,
  MessageCircle,
  Sparkles,
  Search,
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { PostCard } from './PostCard';

const CATEGORIES = [
  '全部',
  '咖啡時光',
  '城市漫遊',
  '底片攝影',
  '旅行日記',
  '設計靈感',
  '數位遊牧',
];

export const ExploreView: React.FC = () => {
  const { posts, selectedTag, setSelectedTag, t } = useSocial();
  const [currentCategory, setCurrentCategory] = useState<string>('全部');
  const [viewMode, setViewMode] = useState<'grid' | 'stream'>('grid');

  const filteredPosts = posts.filter((post) => {
    if (selectedTag) {
      return post.tags.includes(selectedTag);
    }
    if (currentCategory !== '全部') {
      return post.tags.includes(currentCategory);
    }
    return true;
  });

  const photoPosts = filteredPosts.filter((p) => p.imageUrl);

  return (
    <div className="space-y-6">
      {/* Category Pills Header */}
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-rose-500" />
            <h2 className="text-base font-bold text-neutral-900">{t('explore.title')}</h2>
          </div>
          <div className="flex items-center gap-1 bg-neutral-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
              }`}
            >
              {t('explore.grid')}
            </button>
            <button
              onClick={() => setViewMode('stream')}
              className={`px-3 py-1 rounded-lg transition-all ${
                viewMode === 'stream' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'
              }`}
            >
              {t('explore.list')}
            </button>
          </div>
        </div>

        {/* Categories scroll */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isActive = selectedTag ? selectedTag === cat : currentCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedTag(null);
                  setCurrentCategory(cat);
                }}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
                  isActive
                    ? 'bg-neutral-900 text-white shadow-xs'
                    : 'bg-neutral-100 hover:bg-neutral-200 text-neutral-600'
                }`}
              >
                {cat === '全部' ? '✨ 全部' : `#${cat}`}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content View */}
      {viewMode === 'stream' ? (
        <div className="space-y-4">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div>
          {photoPosts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {photoPosts.map((post) => (
                <div
                  key={post.id}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-200 shadow-xs cursor-pointer"
                >
                  <img
                    src={post.imageUrl}
                    alt={post.content}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-between text-white">
                    <div className="flex items-center gap-2">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-white"
                      />
                      <span className="text-xs font-semibold truncate">{post.author.name}</span>
                    </div>

                    <div>
                      <p className="text-xs line-clamp-2 mb-2 font-normal text-neutral-200">
                        {post.content}
                      </p>
                      <div className="flex items-center gap-4 text-xs font-semibold">
                        <div className="flex items-center gap-1">
                          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                          <span>{post.likesCount}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3.5 h-3.5" />
                          <span>{post.comments.length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-2">
              <Sparkles className="w-8 h-8 text-neutral-400 mx-auto" />
              <p className="text-sm font-semibold text-neutral-800">此分類暫無相片內容</p>
              <p className="text-xs text-neutral-500">歡迎點擊右上方「發佈」來上傳分享！</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
