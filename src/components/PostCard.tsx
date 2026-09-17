import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  MapPin,
  Trash2,
} from 'lucide-react';
import { Post } from '../types';
import { useSocial } from '../context/SocialContext';
import { CommentSection } from './CommentSection';

interface PostCardProps {
  post: Post;
}

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const {
    currentUser,
    toggleLikePost,
    toggleBookmarkPost,
    deletePost,
    setSelectedTag,
    setActiveTab,
    showToast,
  } = useSocial();

  const [showComments, setShowComments] = useState(true);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);

  const isOwnPost = post.author.id === currentUser.id;

  const handleDoubleTap = () => {
    if (!post.isLiked) {
      toggleLikePost(post.id);
    }
    setShowHeartAnimation(true);
    setTimeout(() => {
      setShowHeartAnimation(false);
    }, 850);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('貼文連結已複製至剪貼簿！📋');
    } else {
      showToast('貼文分享成功！');
    }
  };

  const handleTagClick = (tag: string) => {
    setSelectedTag(tag);
    setActiveTab('explore');
  };

  return (
    <article
      id={`post-${post.id}`}
      className="bg-white rounded-2xl border border-neutral-200/80 shadow-xs hover:shadow-sm transition-shadow overflow-hidden"
    >
      {/* Post Header */}
      <div className="p-4 sm:p-5 pb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <img
            src={post.author.avatar}
            alt={post.author.name}
            className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-200"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-neutral-900 leading-tight">
                {post.author.name}
              </span>
              <span className="text-xs text-neutral-400 font-normal">
                {post.author.handle}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-neutral-400 mt-0.5">
              <span>{post.createdAt}</span>
              {post.location && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-0.5 text-neutral-500">
                    <MapPin className="w-3 h-3 text-rose-500" />
                    {post.location}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Delete button for author's own post */}
        {isOwnPost && (
          <button
            id={`delete-post-${post.id}-btn`}
            onClick={() => deletePost(post.id)}
            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
            title="刪除這則貼文"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Post Text Content */}
      <div className="px-4 sm:px-5 pb-3">
        <p className="text-neutral-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {post.tags.map((tag) => (
              <button
                key={tag}
                type="button"
                onClick={() => handleTagClick(tag)}
                className="text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50/60 hover:bg-rose-50 px-2.5 py-0.5 rounded-full transition-colors"
              >
                #{tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Post Media / Image */}
      {post.imageUrl && (
        <div
          className="relative bg-neutral-950 overflow-hidden cursor-pointer select-none group max-h-[500px]"
          onDoubleClick={handleDoubleTap}
        >
          <img
            src={post.imageUrl}
            alt="Post media"
            className="w-full h-full max-h-[500px] object-cover sm:object-contain mx-auto group-hover:scale-[1.01] transition-transform duration-300"
            loading="lazy"
          />

          {/* Double-tap heart animation overlay */}
          <AnimatePresence>
            {showHeartAnimation && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1.25, 1], opacity: [0, 1, 0] }}
                exit={{ scale: 1.4, opacity: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <Heart className="w-24 h-24 text-white fill-rose-500 drop-shadow-2xl" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Interaction Actions Bar */}
      <div className="px-4 sm:px-5 py-3">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Like Button */}
            <button
              id={`like-post-${post.id}-btn`}
              onClick={() => toggleLikePost(post.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-90 ${
                post.isLiked
                  ? 'bg-rose-50 text-rose-600'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  post.isLiked ? 'fill-rose-500 text-rose-500 scale-110' : ''
                }`}
              />
              <span>{post.likesCount} 個讚</span>
            </button>

            {/* Comment Button */}
            <button
              id={`comment-toggle-${post.id}-btn`}
              onClick={() => setShowComments(!showComments)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments.length} 則留言</span>
            </button>

            {/* Share Button */}
            <button
              id={`share-post-${post.id}-btn`}
              onClick={handleShare}
              className="p-1.5 rounded-full text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
              title="分享貼文"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>

          {/* Bookmark Button */}
          <button
            id={`bookmark-post-${post.id}-btn`}
            onClick={() => toggleBookmarkPost(post.id)}
            className={`p-1.5 rounded-full transition-colors ${
              post.isBookmarked
                ? 'text-amber-600 bg-amber-50'
                : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'
            }`}
            title={post.isBookmarked ? '取消收藏' : '收藏貼文'}
          >
            <Bookmark
              className={`w-4 h-4 ${post.isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`}
            />
          </button>
        </div>

        {/* Expandable Comments Section */}
        {showComments && (
          <CommentSection postId={post.id} comments={post.comments} />
        )}
      </div>
    </article>
  );
};
