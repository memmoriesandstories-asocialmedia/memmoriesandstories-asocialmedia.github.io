import React from 'react';
import { Bookmark, PlusCircle } from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { PostCard } from './PostCard';

export const BookmarksView: React.FC = () => {
  const { posts, setActiveTab, t } = useSocial();
  const bookmarkedPosts = posts.filter((p) => p.isBookmarked);

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-neutral-200/80 p-4 sm:p-5 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Bookmark className="w-5 h-5 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <h2 className="text-base font-bold text-neutral-900">{t('bookmarks.title')}</h2>
            <p className="text-xs text-neutral-500">
              {bookmarkedPosts.length} {t('nav.bookmarks')}
            </p>
          </div>
        </div>
      </div>

      {bookmarkedPosts.length > 0 ? (
        <div className="space-y-4">
          {bookmarkedPosts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center mx-auto">
            <Bookmark className="w-6 h-6" />
          </div>
          <h3 className="font-semibold text-neutral-800 text-base">{t('bookmarks.empty')}</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {t('bookmarks.emptySubtitle')}
          </p>
          <button
            onClick={() => setActiveTab('feed')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-semibold rounded-xl transition-colors"
          >
            {t('nav.feed')}
          </button>
        </div>
      )}
    </div>
  );
};
