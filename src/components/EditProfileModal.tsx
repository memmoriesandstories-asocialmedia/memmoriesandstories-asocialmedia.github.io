import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Upload, Check, Sparkles, ShieldAlert, Wand2, ShieldCheck } from 'lucide-react';
import { useSocial } from '../context/SocialContext';
import { PRESET_AVATARS, PRESET_COVERS } from '../data/initialData';
import { checkProfanity, getProfanityWarning } from '../lib/moderation';

export const EditProfileModal: React.FC = () => {
  const { currentUser, isEditProfileOpen, setIsEditProfileOpen, updateUserProfile, showToast } =
    useSocial();

  const [name, setName] = useState(currentUser.name);
  const [handle, setHandle] = useState(currentUser.handle);
  const [bio, setBio] = useState(currentUser.bio);
  const [website, setWebsite] = useState(currentUser.website);
  const [location, setLocation] = useState(currentUser.location);
  const [avatar, setAvatar] = useState(currentUser.avatar);
  const [coverImage, setCoverImage] = useState(currentUser.coverImage);

  const [showAvatarPresets, setShowAvatarPresets] = useState(false);
  const [showCoverPresets, setShowCoverPresets] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  // 髒話與不當詞彙檢測
  const nameModeration = useMemo(() => checkProfanity(name), [name]);
  const bioModeration = useMemo(() => checkProfanity(bio), [bio]);
  const handleModeration = useMemo(() => checkProfanity(handle), [handle]);

  const hasProfanity =
    nameModeration.hasProfanity || bioModeration.hasProfanity || handleModeration.hasProfanity;

  const flaggedWords = useMemo(
    () =>
      Array.from(
        new Set([
          ...nameModeration.flaggedWords,
          ...bioModeration.flaggedWords,
          ...handleModeration.flaggedWords,
        ])
      ),
    [nameModeration.flaggedWords, bioModeration.flaggedWords, handleModeration.flaggedWords]
  );

  const handlePurifyProfile = () => {
    if (nameModeration.hasProfanity) setName(nameModeration.cleanText);
    if (bioModeration.hasProfanity) setBio(bioModeration.cleanText);
    if (handleModeration.hasProfanity) setHandle(handleModeration.cleanText);
    showToast('已自動遮蔽不雅字詞');
  };

  if (!isEditProfileOpen) return null;

  const handleAvatarFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setAvatar(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCoverFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      if (typeof e.target?.result === 'string') {
        setCoverImage(e.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (hasProfanity) {
      showToast('個人資料含有不當字詞，請點擊「一鍵遮蔽」或修改後再儲存');
      return;
    }

    let formattedHandle = handle.trim();
    if (!formattedHandle.startsWith('@')) {
      formattedHandle = `@${formattedHandle}`;
    }

    updateUserProfile({
      name: name.trim(),
      handle: formattedHandle,
      bio: bio.trim(),
      website: website.trim(),
      location: location.trim(),
      avatar,
      coverImage,
    });

    setIsEditProfileOpen(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto">
        <div className="fixed inset-0" onClick={() => setIsEditProfileOpen(false)} />

        <motion.div
          id="edit-profile-modal"
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-6 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-semibold text-neutral-900">編輯個人檔案</h3>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                <span>防護中</span>
              </span>
            </div>
            <button
              id="close-edit-profile-modal-btn"
              onClick={() => setIsEditProfileOpen(false)}
              className="p-1.5 rounded-full text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* 髒話與不當詞彙警示橫幅 */}
            {hasProfanity && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950">
                <div className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-amber-900">個人資料含有不雅字詞：</span>
                    <p className="mt-0.5 text-amber-800">
                      {getProfanityWarning(flaggedWords)}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePurifyProfile}
                  className="shrink-0 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-xl shadow-xs transition-colors"
                >
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>一鍵遮蔽 (***)</span>
                </button>
              </div>
            )}
            {/* Visual Cover & Avatar Editor */}
            <div className="relative">
              {/* Cover */}
              <div className="h-32 sm:h-36 w-full rounded-2xl overflow-hidden relative bg-neutral-900 group">
                <img
                  src={coverImage}
                  alt="Cover preview"
                  className="w-full h-full object-cover group-hover:opacity-85 transition-opacity"
                />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/35 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => coverInputRef.current?.click()}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/90 hover:bg-white text-neutral-800 text-xs font-semibold rounded-lg shadow-sm backdrop-blur-xs transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>上傳封面</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCoverPresets(!showCoverPresets)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-white/90 hover:bg-white text-neutral-800 text-xs font-semibold rounded-lg shadow-sm backdrop-blur-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>選樣式</span>
                  </button>
                </div>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleCoverFile(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Cover Presets Drawer */}
              {showCoverPresets && (
                <div className="mt-2 p-2 bg-neutral-50 rounded-xl border border-neutral-200 grid grid-cols-4 gap-1.5">
                  {PRESET_COVERS.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setCoverImage(preset);
                        setShowCoverPresets(false);
                      }}
                      className="h-12 rounded-lg overflow-hidden border border-neutral-200 hover:ring-2 hover:ring-rose-500"
                    >
                      <img src={preset} alt="preset cover" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Avatar */}
              <div className="relative -mt-12 ml-4 inline-block">
                <div className="relative group/avatar">
                  <img
                    src={avatar}
                    alt="Avatar preview"
                    className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white shadow-md bg-white"
                  />
                  <div
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 rounded-2xl bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer text-white"
                    title="上傳新大頭貼"
                  >
                    <Camera className="w-6 h-6" />
                  </div>
                </div>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleAvatarFile(e.target.files[0]);
                    }
                  }}
                />
              </div>

              {/* Avatar quick presets bar */}
              <div className="flex items-center gap-2 mt-2 ml-4">
                <span className="text-[11px] text-neutral-400 font-medium">快速切換頭貼：</span>
                <div className="flex items-center gap-1.5">
                  {PRESET_AVATARS.slice(0, 5).map((presetAv, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setAvatar(presetAv)}
                      className={`w-6 h-6 rounded-full overflow-hidden border transition-all ${
                        avatar === presetAv ? 'ring-2 ring-rose-500 scale-110' : 'opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={presetAv} alt="preset avatar" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Inputs */}
            <div className="space-y-3.5">
              {/* Display Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  顯示名稱 *
                </label>
                <input
                  id="edit-profile-name-input"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="例如：林晨希 Alex"
                  className="w-full px-3.5 py-2 text-sm text-neutral-800 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white rounded-xl border border-neutral-200 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/15 transition-all"
                />
              </div>

              {/* Handle */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  帳號 ID
                </label>
                <input
                  id="edit-profile-handle-input"
                  type="text"
                  value={handle}
                  onChange={(e) => setHandle(e.target.value)}
                  placeholder="@your_handle"
                  className="w-full px-3.5 py-2 text-sm text-neutral-800 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white rounded-xl border border-neutral-200 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/15 transition-all"
                />
              </div>

              {/* Bio */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-neutral-700">
                    個人簡介
                  </label>
                  <span className="text-[11px] text-neutral-400">{bio.length}/160</span>
                </div>
                <textarea
                  id="edit-profile-bio-input"
                  rows={3}
                  maxLength={160}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="介紹你的專業、興趣、正在做的事情..."
                  className="w-full px-3.5 py-2 text-sm text-neutral-800 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white rounded-xl border border-neutral-200 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/15 transition-all resize-none"
                />
              </div>

              {/* Location & Website grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    所在城市 / 地區
                  </label>
                  <input
                    id="edit-profile-location-input"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="例如：台北市, 台灣"
                    className="w-full px-3.5 py-2 text-sm text-neutral-800 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white rounded-xl border border-neutral-200 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    個人網站或作品集連結
                  </label>
                  <input
                    id="edit-profile-website-input"
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2 text-sm text-neutral-800 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white rounded-xl border border-neutral-200 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-500/15 transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsEditProfileOpen(false)}
                className="px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
              >
                取消
              </button>
              <button
                id="save-profile-btn"
                type="submit"
                disabled={!name.trim() || hasProfanity}
                className={`flex items-center gap-1.5 px-5 py-2 text-sm font-semibold rounded-xl text-white shadow-xs transition-colors ${
                  hasProfanity
                    ? 'bg-neutral-400 cursor-not-allowed opacity-60'
                    : 'bg-neutral-900 hover:bg-neutral-800 disabled:opacity-50'
                }`}
                title={hasProfanity ? '個人資料含有不當用語，請先淨化' : '儲存變更'}
              >
                <Check className="w-4 h-4" />
                <span>{hasProfanity ? '請先淨化字詞' : '儲存變更'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
