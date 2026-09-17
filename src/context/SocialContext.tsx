import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Post, UserProfile, Comment, PostDraft } from '../types';
import { INITIAL_POSTS, INITIAL_USER, PRESET_AVATARS, PRESET_COVERS } from '../data/initialData';
import { LanguageCode, translations, SUPPORTED_LANGUAGES } from '../lib/i18n';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  signInAnonymously,
  onAuthStateChanged,
  FirebaseUser,
} from '../lib/firebase';
import {
  subscribeToPosts,
  seedInitialPostsIfEmpty,
  savePostDoc,
  deletePostDoc,
  updatePostLikeDoc,
  updatePostBookmarkDoc,
  addCommentToPostDoc,
  toggleCommentLikeDoc,
  deleteCommentFromPostDoc,
  getUserProfileDoc,
  saveUserProfileDoc,
  saveDraftDoc,
  getDraftDoc,
  deleteDraftDoc,
} from '../lib/firestoreService';
import { checkProfanity } from '../lib/moderation';

interface SocialContextType {
  firebaseUser: FirebaseUser | null;
  isAuthenticated: boolean;
  isAuthLoading: boolean;
  currentUser: UserProfile;
  posts: Post[];
  postDraft: PostDraft | null;
  savePostDraft: (draft: PostDraft) => Promise<void>;
  clearPostDraft: () => Promise<void>;
  draftStatus: 'idle' | 'saving' | 'saved';
  lastSavedDraftTime: number | null;
  activeTab: 'feed' | 'explore' | 'bookmarks' | 'profile';
  setActiveTab: (tab: 'feed' | 'explore' | 'bookmarks' | 'profile') => void;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isCreatePostOpen: boolean;
  setIsCreatePostOpen: (open: boolean) => void;
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'login' | 'register';
  setAuthModalMode: (mode: 'login' | 'register') => void;
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  toastMessage: string | null;
  showToast: (msg: string) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, displayName: string) => Promise<void>;
  loginAsGuest: () => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addPost: (postData: { content: string; imageUrl?: string; tags: string[]; location?: string }) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  toggleBookmarkPost: (postId: string) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  toggleLikeComment: (postId: string, commentId: string) => Promise<void>;
  deleteComment: (postId: string, commentId: string) => Promise<void>;
  resetAllData: () => void;
}

const SocialContext = createContext<SocialContextType | undefined>(undefined);

const STORAGE_KEY_POSTS = 'social_app_posts_v2';
const STORAGE_KEY_USER = 'social_app_user_v2';
const STORAGE_KEY_DRAFT = 'social_app_post_draft_v2';
const STORAGE_KEY_LANG = 'social_app_lang_v2';

export const SocialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // 11 Languages Support - English as default!
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LANG);
      if (saved && SUPPORTED_LANGUAGES.some((l) => l.code === saved)) {
        return saved as LanguageCode;
      }
    } catch {}
    return 'en'; // Default language is English!
  });

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY_LANG, lang);
    } catch {}
  }, []);

  const t = useCallback(
    (key: string): string => {
      const dict = translations[language] || translations['en'];
      if (dict && dict[key]) {
        return dict[key];
      }
      return translations['en']?.[key] || key;
    },
    [language]
  );

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER);
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  const [posts, setPosts] = useState<Post[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POSTS);
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  // 草稿自動儲存狀態
  const [postDraft, setPostDraft] = useState<PostDraft | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRAFT);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [draftStatus, setDraftStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [lastSavedDraftTime, setLastSavedDraftTime] = useState<number | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_DRAFT);
      if (saved) {
        const parsed = JSON.parse(saved);
        return parsed.savedAt || null;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [activeTab, setActiveTab] = useState<'feed' | 'explore' | 'bookmarks' | 'profile'>('feed');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCreatePostOpen, setIsCreatePostOpen] = useState<boolean>(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2800);
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Helper to map raw post to post with user-specific like/bookmark status
  const mapPostWithUserInteractions = useCallback(
    (post: Post, userId: string): Post => {
      const isLiked = Boolean(post.likes && post.likes.includes(userId));
      const isBookmarked = Boolean(post.bookmarks && post.bookmarks.includes(userId));
      const comments = (post.comments || []).map((c) => ({
        ...c,
        isLiked: Boolean(c.likes && c.likes.includes(userId)),
      }));

      return {
        ...post,
        isLiked,
        isBookmarked,
        comments,
      };
    },
    []
  );

  // Sync with Firestore: Seed and subscribe to real-time posts
  useEffect(() => {
    // Check and seed initial posts if Firestore is empty
    seedInitialPostsIfEmpty(INITIAL_POSTS);

    // Subscribe to Firestore posts updates
    const unsubscribe = subscribeToPosts(
      (firestorePosts) => {
        if (firestorePosts && firestorePosts.length > 0) {
          const currentUserId = currentUser.id;
          setPosts((prev) => {
            const remoteIds = new Set(firestorePosts.map((p) => p.id));
            // 保留本地剛發佈但尚未出現在遠端快照中的新貼文 (1小時內)
            const localRecent = prev.filter(
              (p) => !remoteIds.has(p.id) && Date.now() - (p.createdAtTimestamp || 0) < 3600000
            );
            const combined = [...localRecent, ...firestorePosts];
            const mapped = combined.map((p) => mapPostWithUserInteractions(p, currentUserId));
            try {
              localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(mapped));
            } catch (e) {
              console.error('LocalStorage write error', e);
            }
            return mapped;
          });
        }
      },
      (error) => {
        console.warn('Real-time post sync error:', error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [currentUser.id, mapPostWithUserInteractions]);

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setIsAuthLoading(false);

      if (user) {
        // User is logged in, fetch their Firestore user profile
        try {
          const profile = await getUserProfileDoc(user.uid);
          if (profile) {
            setCurrentUser(profile);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(profile));
          } else {
            // New user, create initial profile in Firestore
            const initialHandle = user.email
              ? `@${user.email.split('@')[0]}`
              : `@user_${user.uid.substring(0, 5)}`;
            const newProfile: UserProfile = {
              id: user.uid,
              name: user.displayName || (user.isAnonymous ? '訪客創作者' : '新會員'),
              handle: initialHandle,
              avatar: user.photoURL || PRESET_AVATARS[0],
              coverImage: PRESET_COVERS[0],
              bio: user.isAnonymous
                ? '以訪客模式體驗中，歡迎瀏覽或發佈即時動態！'
                : '探索生活靈感與美好時刻 ✨',
              website: '',
              location: '台北市, 台灣',
              joinedDate: new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' }),
              followingCount: 8,
              followersCount: 3,
              email: user.email || undefined,
              isAnonymous: user.isAnonymous,
            };
            await saveUserProfileDoc(newProfile);
            setCurrentUser(newProfile);
            localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newProfile));
          }
        } catch (e) {
          console.warn('Failed to fetch/save profile on login:', e);
        }
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // 從 Firestore 雲端同步草稿 (若使用者有登入)
  useEffect(() => {
    if (currentUser?.id) {
      getDraftDoc(currentUser.id)
        .then((cloudDraft) => {
          if (cloudDraft && (cloudDraft.content || cloudDraft.imageUrl || cloudDraft.tags?.length)) {
            setPostDraft((localDraft) => {
              if (!localDraft || cloudDraft.savedAt > (localDraft.savedAt || 0)) {
                try {
                  localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(cloudDraft));
                } catch (e) {
                  console.warn('LocalStorage draft sync error:', e);
                }
                setLastSavedDraftTime(cloudDraft.savedAt);
                return cloudDraft;
              }
              return localDraft;
            });
          }
        })
        .catch((err) => console.warn('Failed to load cloud draft:', err));
    }
  }, [currentUser?.id]);

  // 儲存草稿 (同時儲存於 localStorage 與 Firestore)
  const savePostDraft = useCallback(
    async (draft: PostDraft) => {
      setDraftStatus('saving');
      const updatedDraft: PostDraft = {
        ...draft,
        savedAt: Date.now(),
      };
      setPostDraft(updatedDraft);
      setLastSavedDraftTime(updatedDraft.savedAt);

      try {
        localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(updatedDraft));
      } catch (e) {
        console.warn('Failed to save draft to localStorage:', e);
      }

      if (currentUser?.id) {
        try {
          await saveDraftDoc(currentUser.id, updatedDraft);
        } catch (e) {
          console.warn('Failed to save draft to Firestore:', e);
        }
      }

      setDraftStatus('saved');
    },
    [currentUser?.id]
  );

  // 清除已送出或捨棄的草稿
  const clearPostDraft = useCallback(async () => {
    setPostDraft(null);
    setLastSavedDraftTime(null);
    setDraftStatus('idle');
    try {
      localStorage.removeItem(STORAGE_KEY_DRAFT);
    } catch (e) {
      console.warn('Failed to remove draft from localStorage:', e);
    }

    if (currentUser?.id) {
      try {
        await deleteDraftDoc(currentUser.id);
      } catch (e) {
        console.warn('Failed to delete draft from Firestore:', e);
      }
    }
  }, [currentUser?.id]);

  // Update posts when currentUser changes (recompute isLiked/isBookmarked)
  useEffect(() => {
    setPosts((prev) => prev.map((p) => mapPostWithUserInteractions(p, currentUser.id)));
  }, [currentUser.id, mapPostWithUserInteractions]);

  // Auth actions
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    showToast(`歡迎回來，${result.user.displayName || '會員'}！🎉`);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    const res = await signInWithEmailAndPassword(auth, email, pass);
    showToast(`登入成功！歡迎 ${res.user.displayName || email} 🎉`);
  };

  const registerWithEmail = async (email: string, pass: string, displayName: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    const newProfile: UserProfile = {
      id: res.user.uid,
      name: displayName,
      handle: `@${email.split('@')[0]}`,
      avatar: PRESET_AVATARS[Math.floor(Math.random() * PRESET_AVATARS.length)],
      coverImage: PRESET_COVERS[0],
      bio: '熱愛分享生活美好碎片！✨',
      website: '',
      location: '台北市, 台灣',
      joinedDate: new Date().toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' }),
      followingCount: 5,
      followersCount: 1,
      email: email,
      isAnonymous: false,
    };
    await saveUserProfileDoc(newProfile);
    setCurrentUser(newProfile);
    showToast(`註冊成功，歡迎 ${displayName}！🎊`);
  };

  const loginAsGuest = async () => {
    const res = await signInAnonymously(auth);
    showToast('已進入訪客體驗模式！🌟');
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      // Reset to default sample user for browsing
      setCurrentUser(INITIAL_USER);
      localStorage.removeItem(STORAGE_KEY_USER);
      showToast('已安全登出 👋');
    } catch (e) {
      console.error('Logout error:', e);
    }
  };

  const updateUserProfile = async (updated: Partial<UserProfile>) => {
    // 過濾不雅字詞
    const sanitizedUpdated: Partial<UserProfile> = {
      ...updated,
      name: updated.name ? checkProfanity(updated.name).cleanText : updated.name,
      bio: updated.bio ? checkProfanity(updated.bio).cleanText : updated.bio,
      handle: updated.handle ? checkProfanity(updated.handle).cleanText : updated.handle,
    };

    const nextUser = { ...currentUser, ...sanitizedUpdated };
    setCurrentUser(nextUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(nextUser));

    // Save to Firestore if authenticated
    if (firebaseUser) {
      try {
        await saveUserProfileDoc(nextUser);
      } catch (e) {
        console.warn('Failed to update profile to Firestore:', e);
      }
    }

    showToast('個人檔案已成功更新！✨');
  };

  const addPost = async (postData: {
    content: string;
    imageUrl?: string;
    tags: string[];
    location?: string;
  }) => {
    // 確保有身分（若無登入則背景無縫匿名登入，避免發表失敗）
    let authorId = currentUser.id;
    if (!firebaseUser) {
      try {
        const cred = await signInAnonymously(auth);
        authorId = cred.user.uid;
      } catch (err) {
        console.warn('Anonymous fallback auth on post:', err);
      }
    } else {
      authorId = firebaseUser.uid;
    }

    // 髒話過濾與防護
    const contentCheck = checkProfanity(postData.content);
    const cleanContent = contentCheck.cleanText;
    const cleanTags = postData.tags.map((t) => checkProfanity(t).cleanText);
    const cleanLocation = postData.location ? checkProfanity(postData.location).cleanText : undefined;

    if (contentCheck.hasProfanity) {
      showToast(`檢測到不當字詞（${contentCheck.flaggedWords.join('、')}），已自動淨化遮蔽 🛡️`);
    }

    const newPost: Post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      author: {
        id: authorId,
        name: currentUser.name,
        handle: currentUser.handle,
        avatar: currentUser.avatar,
      },
      content: cleanContent,
      imageUrl: postData.imageUrl,
      tags: cleanTags,
      likesCount: 0,
      likes: [],
      bookmarks: [],
      isLiked: false,
      comments: [],
      createdAt: '剛剛',
      createdAtTimestamp: Date.now(),
      location: cleanLocation,
      isBookmarked: false,
    };

    // 1. 樂觀更新狀態
    setPosts((prev) => [newPost, ...prev.filter((p) => p.id !== newPost.id)]);

    // 2. 真正雙重自動持久化儲存：先即時寫入 LocalStorage，確保重新整理零遺失
    try {
      const saved = localStorage.getItem(STORAGE_KEY_POSTS);
      const existing = saved ? JSON.parse(saved) : [];
      const updated = [newPost, ...existing.filter((p: Post) => p.id !== newPost.id)];
      localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updated));
    } catch (e) {
      console.warn('LocalStorage save error:', e);
    }

    // 3. 真正自動儲存至 Firestore 雲端資料庫
    try {
      await savePostDoc(newPost);
      showToast('貼文已成功發佈並自動永久儲存！✨');
    } catch (e) {
      console.warn('Failed to save post to Firestore:', e);
      showToast('貼文已在本機成功永久儲存！');
    }

    // 4. 發佈成功後自動清理已送出的貼文草稿
    await clearPostDraft();
  };

  const toggleLikePost = async (postId: string) => {
    if (!firebaseUser) {
      openAuthModal('login');
      showToast('請先登入後再按讚！');
      return;
    }

    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const nextIsLiked = !targetPost.isLiked;

    // Optimistic update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const currentLikes = post.likes || [];
          const nextLikes = nextIsLiked
            ? [...currentLikes, currentUser.id]
            : currentLikes.filter((id) => id !== currentUser.id);

          return {
            ...post,
            isLiked: nextIsLiked,
            likes: nextLikes,
            likesCount: nextLikes.length,
          };
        }
        return post;
      })
    );

    // Save to Firestore
    try {
      await updatePostLikeDoc(postId, currentUser.id, nextIsLiked);
    } catch (e) {
      console.warn('Failed to update like in Firestore:', e);
    }
  };

  const toggleBookmarkPost = async (postId: string) => {
    if (!firebaseUser) {
      openAuthModal('login');
      showToast('請先登入後再收藏貼文！');
      return;
    }

    const targetPost = posts.find((p) => p.id === postId);
    if (!targetPost) return;

    const nextSaved = !targetPost.isBookmarked;
    showToast(nextSaved ? '已收藏此貼文 📑' : '已取消收藏');

    // Optimistic update
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id === postId) {
          const currentBookmarks = post.bookmarks || [];
          const nextBookmarks = nextSaved
            ? [...currentBookmarks, currentUser.id]
            : currentBookmarks.filter((id) => id !== currentUser.id);

          return {
            ...post,
            isBookmarked: nextSaved,
            bookmarks: nextBookmarks,
          };
        }
        return post;
      })
    );

    // Save to Firestore
    try {
      await updatePostBookmarkDoc(postId, currentUser.id, nextSaved);
    } catch (e) {
      console.warn('Failed to update bookmark in Firestore:', e);
    }
  };

  const deletePost = async (postId: string) => {
    if (!firebaseUser) {
      openAuthModal('login');
      return;
    }

    // Optimistic update
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    showToast('貼文已刪除');

    // Save to Firestore
    try {
      await deletePostDoc(postId);
    } catch (e) {
      console.warn('Failed to delete post in Firestore:', e);
    }
  };

  const addComment = async (postId: string, content: string) => {
    if (!firebaseUser) {
      openAuthModal('login');
      showToast('請先登入後再留言！');
      return;
    }
    if (!content.trim()) return;

    const commentCheck = checkProfanity(content);
    const cleanCommentText = commentCheck.cleanText;

    if (commentCheck.hasProfanity) {
      showToast(`留言含有敏感字詞（${commentCheck.flaggedWords.join('、')}），已自動遮蔽保護 🛡️`);
    }

    const newComment: Comment = {
      id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 5)}`,
      postId,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        handle: currentUser.handle,
        avatar: currentUser.avatar,
      },
      content: cleanCommentText,
      createdAt: '剛剛',
      createdAtTimestamp: Date.now(),
      likesCount: 0,
      likes: [],
      isLiked: false,
    };

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...p.comments, newComment],
          };
        }
        return p;
      })
    );
    showToast('留言已送出 💬');

    // Save to Firestore
    try {
      await addCommentToPostDoc(postId, newComment);
    } catch (e) {
      console.warn('Failed to save comment in Firestore:', e);
    }
  };

  const toggleLikeComment = async (postId: string, commentId: string) => {
    if (!firebaseUser) {
      openAuthModal('login');
      showToast('請先登入後再點讚留言！');
      return;
    }

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: p.comments.map((c) => {
              if (c.id === commentId) {
                const isLiked = !c.isLiked;
                const likes = c.likes || [];
                const nextLikes = isLiked
                  ? [...likes, currentUser.id]
                  : likes.filter((id) => id !== currentUser.id);

                return {
                  ...c,
                  isLiked,
                  likes: nextLikes,
                  likesCount: nextLikes.length,
                };
              }
              return c;
            }),
          };
        }
        return p;
      })
    );

    // Save to Firestore
    try {
      await toggleCommentLikeDoc(postId, commentId, currentUser.id);
    } catch (e) {
      console.warn('Failed to update comment like in Firestore:', e);
    }
  };

  const deleteComment = async (postId: string, commentId: string) => {
    if (!firebaseUser) {
      openAuthModal('login');
      return;
    }

    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id === postId) {
          return {
            ...p,
            comments: p.comments.filter((c) => c.id !== commentId),
          };
        }
        return p;
      })
    );
    showToast('留言已刪除');

    // Save to Firestore
    try {
      await deleteCommentFromPostDoc(postId, commentId);
    } catch (e) {
      console.warn('Failed to delete comment in Firestore:', e);
    }
  };

  const resetAllData = () => {
    setCurrentUser(INITIAL_USER);
    setPosts(INITIAL_POSTS);
    localStorage.removeItem(STORAGE_KEY_USER);
    localStorage.removeItem(STORAGE_KEY_POSTS);
    seedInitialPostsIfEmpty(INITIAL_POSTS);
    showToast('已重置為初始示範資料');
  };

  return (
    <SocialContext.Provider
      value={{
        firebaseUser,
        isAuthenticated: Boolean(firebaseUser),
        isAuthLoading,
        currentUser,
        posts,
        postDraft,
        savePostDraft,
        clearPostDraft,
        draftStatus,
        lastSavedDraftTime,
        activeTab,
        setActiveTab,
        selectedTag,
        setSelectedTag,
        searchQuery,
        setSearchQuery,
        isCreatePostOpen,
        setIsCreatePostOpen,
        isEditProfileOpen,
        setIsEditProfileOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal,
        closeAuthModal,
        language,
        setLanguage,
        t,
        toastMessage,
        showToast,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        loginAsGuest,
        logout,
        updateUserProfile,
        addPost,
        toggleLikePost,
        toggleBookmarkPost,
        deletePost,
        addComment,
        toggleLikeComment,
        deleteComment,
        resetAllData,
      }}
    >
      {children}
    </SocialContext.Provider>
  );
};

export const useSocial = () => {
  const context = useContext(SocialContext);
  if (!context) {
    throw new Error('useSocial must be used within a SocialProvider');
  }
  return context;
};
