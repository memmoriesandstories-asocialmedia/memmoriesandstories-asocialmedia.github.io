import React, { useState, useMemo } from 'react';
import { Heart, Trash2, Send, ShieldAlert, Wand2 } from 'lucide-react';
import { Comment } from '../types';
import { useSocial } from '../context/SocialContext';
import { checkProfanity } from '../lib/moderation';

interface CommentSectionProps {
  postId: string;
  comments: Comment[];
}

export const CommentSection: React.FC<CommentSectionProps> = ({ postId, comments }) => {
  const { currentUser, addComment, toggleLikeComment, deleteComment, showToast } = useSocial();
  const [commentText, setCommentText] = useState('');

  const commentModeration = useMemo(() => checkProfanity(commentText), [commentText]);

  const handleSendComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (commentModeration.hasProfanity) {
      showToast('留言含有不當字詞，請點擊「一鍵淨化」或修改後再送出！');
      return;
    }

    addComment(postId, commentText.trim());
    setCommentText('');
  };

  const handlePurifyComment = () => {
    setCommentText(commentModeration.cleanText);
  };

  return (
    <div className="space-y-3 pt-3 border-t border-neutral-100">
      {/* Existing Comments List */}
      {comments.length > 0 && (
        <div className="space-y-2.5">
          {comments.map((comment) => {
            const isOwnComment = comment.author.id === currentUser.id;
            return (
              <div
                key={comment.id}
                className="flex items-start justify-between gap-2.5 group/comment text-xs"
              >
                <div className="flex items-start gap-2.5 flex-1 min-w-0">
                  <img
                    src={comment.author.avatar}
                    alt={comment.author.name}
                    className="w-7 h-7 rounded-full object-cover shrink-0 mt-0.5 ring-1 ring-neutral-200"
                  />
                  <div className="bg-neutral-50 rounded-xl px-3 py-2 flex-1 min-w-0 border border-neutral-100">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className="font-semibold text-neutral-900 truncate">
                          {comment.author.name}
                        </span>
                        <span className="text-neutral-400 text-[11px] shrink-0">
                          {comment.createdAt}
                        </span>
                      </div>
                      {isOwnComment && (
                        <button
                          type="button"
                          onClick={() => deleteComment(postId, comment.id)}
                          className="text-neutral-400 hover:text-red-500 p-0.5 opacity-0 group-hover/comment:opacity-100 transition-opacity"
                          title="刪除留言"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                    <p className="text-neutral-700 leading-relaxed break-words whitespace-pre-wrap">
                      {comment.content}
                    </p>
                  </div>
                </div>

                {/* Like comment button */}
                <button
                  type="button"
                  onClick={() => toggleLikeComment(postId, comment.id)}
                  className={`shrink-0 flex items-center gap-1 mt-2.5 px-1 py-0.5 rounded transition-colors ${
                    comment.isLiked
                      ? 'text-rose-500'
                      : 'text-neutral-400 hover:text-neutral-600'
                  }`}
                  title={comment.isLiked ? '取消讚' : '讚'}
                >
                  <Heart
                    className={`w-3.5 h-3.5 ${
                      comment.isLiked ? 'fill-rose-500 text-rose-500' : ''
                    }`}
                  />
                  {comment.likesCount > 0 && (
                    <span className="text-[11px] font-medium">{comment.likesCount}</span>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Add New Comment Input */}
      <div className="space-y-2">
        <form onSubmit={handleSendComment} className="flex items-center gap-2 pt-1">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-7 h-7 rounded-full object-cover shrink-0 ring-1 ring-neutral-200"
          />
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="留個友善的想法吧..."
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className={`w-full bg-neutral-100 hover:bg-neutral-100/80 focus:bg-white text-xs text-neutral-800 placeholder-neutral-400 pl-3.5 pr-9 py-2 rounded-full border transition-all ${
                commentModeration.hasProfanity
                  ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-500/20 text-amber-900'
                  : 'border-transparent focus:border-neutral-300 focus:ring-rose-500/20'
              } focus:outline-none focus:ring-2`}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || commentModeration.hasProfanity}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-rose-600 hover:bg-rose-50 disabled:text-neutral-300 disabled:hover:bg-transparent transition-colors"
              title={commentModeration.hasProfanity ? '包含不當字詞，請先淨化' : '送出留言'}
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

        {/* 髒話警示與一鍵淨化提示 */}
        {commentModeration.hasProfanity && (
          <div className="flex items-center justify-between gap-2 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
            <div className="flex items-center gap-1.5 min-w-0">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="truncate">
                偵測到不當字詞：
                {commentModeration.flaggedWords.map((w) => `「${w}」`).join(' ')}
              </span>
            </div>
            <button
              type="button"
              onClick={handlePurifyComment}
              className="shrink-0 flex items-center gap-1 px-2 py-0.5 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-md shadow-xs transition-colors"
            >
              <Wand2 className="w-3 h-3" />
              <span>一鍵淨化 (***)</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
