import React, { useState, useRef, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Image as ImageIcon,
  MapPin,
  Tag,
  Upload,
  Sparkles,
  Trash2,
  ShieldAlert,
  ShieldCheck,
  Wand2,
  Cloud,
  CloudUpload,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { SAMPLE_POST_IMAGES } from '../data/initialData';
import { checkProfanity, getProfanityWarning } from '../lib/moderation';

const POPULAR_TAGS = ['生活碎片', '咖啡時光', '城市漫遊', '攝影日記', '美食推薦', '旅行', '設計靈感'];

export const CreatePostModal: React.FC = () => {
  const {
    currentUser,
    isCreatePostOpen,
    setIsCreatePostOpen,
    addPost,
    postDraft,
    savePostDraft,
    clearPostDraft,
    draftStatus,
    lastSavedDraftTime,
    showToast,
    t,
  } = useSocial();

  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState('');
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [showPresetPicker, setShowPresetPicker] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [draftLoadedNotice, setDraftLoadedNotice] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const isLoadedRef = useRef(false);

  // 開啟彈窗時，自動載入並恢復草稿
  useEffect(() => {
    if (isCreatePostOpen) {
      if (postDraft && (postDraft.content || postDraft.imageUrl || postDraft.tags?.length || postDraft.location)) {
        setContent(postDraft.content || '');
        setImageUrl(postDraft.imageUrl || '');
        setSelectedTags(postDraft.tags || []);
        if (postDraft.location) {
          setLocation(postDraft.location);
          setShowLocationInput(true);
        }
        setDraftLoadedNotice(true);
      }
      isLoadedRef.current = true;
    } else {
      isLoadedRef.current = false;
      setDraftLoadedNotice(false);
    }
  }, [isCreatePostOpen, postDraft]);

  // 即時自動儲存貼文草稿 (Debounced auto-save)
  useEffect(() => {
    if (!isCreatePostOpen || !isLoadedRef.current) return;

    const timer = setTimeout(() => {
      if (content.trim() || imageUrl || selectedTags.length > 0 || location.trim()) {
        savePostDraft({
          content,
          imageUrl: imageUrl || undefined,
          tags: selectedTags,
          location: location || undefined,
          savedAt: Date.now(),
        });
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [content, imageUrl, selectedTags, location, isCreatePostOpen, savePostDraft]);

  // 髒話與不當用語即時檢測
  const contentModeration = useMemo(() => checkProfanity(content), [content]);
  const tagsModeration = useMemo(() => checkProfanity(selectedTags.join(' ')), [selectedTags]);
  const hasProfanity = contentModeration.hasProfanity || tagsModeration.hasProfanity;
  const allFlaggedWords = useMemo(
    () => Array.from(new Set([...contentModeration.flaggedWords, ...tagsModeration.flaggedWords])),
    [contentModeration.flaggedWords, tagsModeration.flaggedWords]
  );

  const handlePurifyContent = () => {
    if (contentModeration.hasProfanity) {
      setContent(contentModeration.cleanText);
    }
    if (tagsModeration.hasProfanity) {
      setSelectedTags((prev) => prev.map((t) => checkProfanity(t).cleanText));
    }
  };

  if (!isCreatePostOpen) return null;

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('請選擇圖片檔案（JPG、PNG、WEBP 等）');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setImageUrl(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddCustomTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const clean = customTag.trim().replace(/^#/, '');
    if (clean && !selectedTags.includes(clean)) {
      setSelectedTags([...selectedTags, clean]);
      setCustomTag('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() && !imageUrl) return;

    if (hasProfanity) {
      handlePurifyContent();
      return;
    }

    addPost({
      content: content.trim(),
      imageUrl: imageUrl.trim() || undefined,
      tags: selectedTags,
      location: location.trim() || undefined,
    });

    // Reset and close
    setContent('');
    setImageUrl('');
    setSelectedTags([]);
    setLocation('');
    setShowLocationInput(false);
    setShowTagInput(false);
    setShowPresetPicker(false);
    setIsCreatePostOpen(false);
  };

  const handleDiscardDraft = async () => {
    await clearPostDraft();
    setContent('');
    setImageUrl('');
    setSelectedTags([]);
    setLocation('');
    setShowLocationInput(false);
    setShowTagInput(false);
    setDraftLoadedNotice(false);
    showToast('已清空未發佈草稿');
  };

  const handleSaveDraftManually = () => {
    if (content.trim() || imageUrl || selectedTags.length > 0 || location.trim()) {
      savePostDraft({
        content,
        imageUrl: imageUrl || undefined,
        tags: selectedTags,
        location: location || undefined,
        savedAt: Date.now(),
      });
      showToast('貼文草稿已成功保存！💾');
      setIsCreatePostOpen(false);
    }
  };

  const handleClose = () => {
    if (content.trim() || imageUrl || selectedTags.length > 0) {
      savePostDraft({
        content,
        imageUrl: imageUrl || undefined,
        tags: selectedTags,
        location: location || undefined,
        savedAt: Date.now(),
      });
      showToast('貼文草稿已自動儲存，隨時可回來繼續編輯 ✨');
    }
    setIsCreatePostOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
        {/* Backdrop click */}
        <div className="fixed inset-0" onClick={handleClose} />

        <motion.div
          id="create-post-modal"
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden my-6 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-semibold text-neutral-900">{t('post.create')}</h3>
              <span
                className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"
                title="Enabled"
              >
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>Safe</span>
              </span>
            </div>

            {/* 即時自動儲存狀態燈號 */}
            <div className="flex items-center gap-2.5">
              <div className="text-xs">
                {draftStatus === 'saving' ? (
                  <span className="inline-flex items-center gap-1 text-amber-600 animate-pulse font-medium">
                    <CloudUpload className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t('post.saving')}</span>
                  </span>
                ) : (content.trim() || imageUrl || selectedTags.length > 0) ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600 font-medium" title="Synced">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t('post.draftSaved')}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-neutral-400">
                    <Cloud className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">{t('post.autoSaving')}</span>
                  </span>
                )}
              </div>

              <button
                id="close-create-post-modal-btn"
                onClick={handleClose}
                className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                title={t('post.cancel')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 草稿自動載入提示橫幅 */}
          {draftLoadedNotice && (content || imageUrl || selectedTags.length > 0) && (
            <div className="px-5 py-2 bg-amber-50/80 border-b border-amber-100 flex items-center justify-between gap-2 text-xs text-amber-900">
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{t('post.draftSaved')}</span>
              </div>
              <button
                type="button"
                onClick={handleDiscardDraft}
                className="text-neutral-500 hover:text-rose-600 transition-colors font-medium flex items-center gap-1 shrink-0"
              >
                <Trash2 className="w-3 h-3" />
                <span>{t('post.discardDraft')}</span>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            {/* User header */}
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-neutral-200"
              />
              <div>
                <div className="font-semibold text-sm text-neutral-900 leading-tight">
                  {currentUser.name}
                </div>
                <div className="text-xs text-neutral-500">{currentUser.handle}</div>
              </div>
            </div>

            {/* Content text area */}
            <div>
              <textarea
                id="create-post-content-textarea"
                rows={3}
                placeholder="分享你現在的想法、微小的生活美好或是今日靈感..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={`w-full resize-none border-none focus:ring-0 p-0 text-neutral-800 placeholder-neutral-400 text-base focus:outline-none leading-relaxed ${
                  hasProfanity ? 'text-amber-900' : ''
                }`}
                autoFocus
              />
            </div>

            {/* 髒話與不當用語即時警示與一鍵淨化欄位 */}
            {hasProfanity && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-xs"
              >
                <div className="flex items-start gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900">社群友善防護提醒：</span>
                    <p className="mt-0.5 text-amber-800 leading-relaxed">
                      {getProfanityWarning(allFlaggedWords)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  id="purify-post-content-btn"
                  onClick={handlePurifyContent}
                  className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>一鍵替換遮蔽 (***)</span>
                </button>
              </motion.div>
            )}

            {/* Image Upload / Preview Area */}
            {imageUrl ? (
              <div className="relative rounded-xl overflow-hidden border border-neutral-200 max-h-72 group bg-neutral-950">
                <img
                  src={imageUrl}
                  alt="Post preview"
                  className="w-full h-full max-h-72 object-contain mx-auto"
                />
                <button
                  type="button"
                  id="remove-uploaded-image-btn"
                  onClick={() => setImageUrl('')}
                  className="absolute top-2.5 right-2.5 p-1.5 bg-neutral-900/80 hover:bg-red-600 text-white rounded-full backdrop-blur-xs transition-colors shadow-md"
                  title="移除照片"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-xl p-4 text-center transition-colors ${
                  isDragging
                    ? 'border-rose-500 bg-rose-50/50'
                    : 'border-neutral-200 hover:border-neutral-300 bg-neutral-50/50'
                }`}
              >
                <div className="flex flex-col items-center justify-center gap-2">
                  <div className="p-2.5 bg-white rounded-full shadow-xs text-neutral-600">
                    <Upload className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-neutral-800">
                      拖曳照片至此，或點擊下方按鈕上傳
                    </p>
                    <p className="text-[11px] text-neutral-400 mt-0.5">
                      支援 PNG, JPG, WEBP, GIF 格式
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      id="browse-local-image-btn"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-medium rounded-lg border border-neutral-200 transition-colors shadow-xs"
                    >
                      從本機選擇照片
                    </button>
                    <button
                      type="button"
                      id="pick-preset-image-btn"
                      onClick={() => setShowPresetPicker(!showPresetPicker)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      精選範例照片
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleFileSelect(e.target.files[0]);
                      }
                    }}
                  />
                </div>
              </div>
            )}

            {/* Preset Images Drawer */}
            {showPresetPicker && !imageUrl && (
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <div className="text-xs font-medium text-neutral-600 flex items-center justify-between">
                  <span>點選快速加入範例高畫質圖片：</span>
                  <button
                    type="button"
                    onClick={() => setShowPresetPicker(false)}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {SAMPLE_POST_IMAGES.map((sample, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setImageUrl(sample.url);
                        setShowPresetPicker(false);
                      }}
                      className="aspect-square rounded-lg overflow-hidden border border-neutral-200 hover:ring-2 hover:ring-rose-500 transition-all group"
                      title={sample.title}
                    >
                      <img
                        src={sample.url}
                        alt={sample.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Optional Location Input */}
            {showLocationInput && (
              <div className="flex items-center gap-2 px-3 py-2 bg-neutral-50 rounded-xl border border-neutral-200">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <input
                  id="post-location-input"
                  type="text"
                  placeholder="新增地點（例如：台北市 · 誠品信義店）"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full bg-transparent text-xs text-neutral-800 placeholder-neutral-400 focus:outline-none"
                />
                {location && (
                  <button
                    type="button"
                    onClick={() => setLocation('')}
                    className="text-neutral-400 hover:text-neutral-600"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            {/* Tag Selection / Custom Tags */}
            {showTagInput && (
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2.5">
                <div className="text-xs font-semibold text-neutral-700">選擇或新增標籤：</div>
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-xs px-2.5 py-1 rounded-full transition-all font-medium ${
                          isSelected
                            ? 'bg-rose-500 text-white shadow-xs'
                            : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="自訂標籤 (按 Enter 新增)"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    onKeyDown={handleAddCustomTag}
                    className="flex-1 bg-white px-3 py-1.5 text-xs text-neutral-800 rounded-lg border border-neutral-200 focus:outline-none focus:border-rose-400"
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomTag}
                    className="px-3 py-1.5 text-xs bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 font-medium"
                  >
                    新增
                  </button>
                </div>
              </div>
            )}

            {/* Selected Tags Pills Preview */}
            {selectedTags.length > 0 && !showTagInput && (
              <div className="flex flex-wrap gap-1.5 items-center">
                <span className="text-[11px] text-neutral-400 font-medium">標籤：</span>
                {selectedTags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 font-medium border border-rose-100"
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => toggleTag(t)}
                      className="hover:text-rose-800"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Quick action bar */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  id="action-add-photo-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-neutral-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="選擇照片"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  id="action-toggle-tag-btn"
                  onClick={() => setShowTagInput(!showTagInput)}
                  className={`p-2 rounded-xl transition-colors ${
                    showTagInput
                      ? 'text-rose-600 bg-rose-50'
                      : 'text-neutral-500 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  title="標籤"
                >
                  <Tag className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  id="action-toggle-location-btn"
                  onClick={() => setShowLocationInput(!showLocationInput)}
                  className={`p-2 rounded-xl transition-colors ${
                    showLocationInput
                      ? 'text-rose-600 bg-rose-50'
                      : 'text-neutral-500 hover:text-rose-600 hover:bg-rose-50'
                  }`}
                  title="新增地點"
                >
                  <MapPin className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="save-post-draft-btn"
                  onClick={handleSaveDraftManually}
                  disabled={!content.trim() && !imageUrl}
                  className="px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 font-medium hover:bg-neutral-100 rounded-xl transition-colors disabled:opacity-40"
                  title={t('post.saveDraft')}
                >
                  {t('post.saveDraft')}
                </button>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-3 py-2 text-sm text-neutral-500 hover:text-neutral-800 font-medium transition-colors"
                >
                  {t('post.cancel')}
                </button>
                <button
                  id="submit-post-btn"
                  type="submit"
                  disabled={(!content.trim() && !imageUrl) || hasProfanity}
                  className={`px-5 py-2 text-sm font-semibold rounded-xl text-white shadow-sm transition-all ${
                    hasProfanity
                      ? 'bg-neutral-400 cursor-not-allowed opacity-60'
                      : 'bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:hover:bg-rose-600 shadow-rose-600/20'
                  }`}
                  title={hasProfanity ? 'Profanity detected' : t('post.publish')}
                >
                  {hasProfanity ? 'Clean word' : t('post.publish')}
                </button>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
