import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { Post, UserProfile, Comment, PostDraft } from '../types';

const POSTS_COLLECTION = 'posts';
const USERS_COLLECTION = 'users';
const DRAFTS_COLLECTION = 'drafts';

/**
 * Listen to real-time posts updates
 */
export const subscribeToPosts = (
  onSuccess: (posts: Post[]) => void,
  onError?: (error: Error) => void
) => {
  const postsQuery = query(
    collection(db, POSTS_COLLECTION),
    orderBy('createdAtTimestamp', 'desc'),
    limit(50)
  );

  return onSnapshot(
    postsQuery,
    (snapshot) => {
      const posts: Post[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Post;
        posts.push({
          ...data,
          id: docSnap.id,
          comments: data.comments || [],
          likes: data.likes || [],
          bookmarks: data.bookmarks || [],
          tags: data.tags || [],
        });
      });
      onSuccess(posts);
    },
    (err) => {
      console.warn('Firestore real-time subscription error, fallbacking:', err);
      if (onError) onError(err);
    }
  );
};

/**
 * Check if posts collection is empty and seed initial posts
 */
export const seedInitialPostsIfEmpty = async (initialPosts: Post[]): Promise<boolean> => {
  try {
    const snapshot = await getDocs(query(collection(db, POSTS_COLLECTION), limit(1)));
    if (snapshot.empty) {
      console.log('Seeding initial community posts into Firestore...');
      const batch = writeBatch(db);
      initialPosts.forEach((post, index) => {
        const postRef = doc(db, POSTS_COLLECTION, post.id);
        const timestamp = Date.now() - index * 3600 * 1000;
        batch.set(postRef, {
          ...post,
          createdAtTimestamp: post.createdAtTimestamp || timestamp,
          likes: post.likes || [],
          bookmarks: post.bookmarks || [],
        });
      });
      await batch.commit();
      return true;
    }
    return false;
  } catch (err) {
    console.warn('Failed to check or seed initial posts:', err);
    return false;
  }
};

/**
 * Save or update a post document
 */
export const savePostDoc = async (post: Post): Promise<void> => {
  const postRef = doc(db, POSTS_COLLECTION, post.id);
  await setDoc(postRef, {
    ...post,
    createdAtTimestamp: post.createdAtTimestamp || Date.now(),
    likes: post.likes || [],
    bookmarks: post.bookmarks || [],
    comments: post.comments || [],
  });
};

/**
 * Delete a post document
 */
export const deletePostDoc = async (postId: string): Promise<void> => {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  await deleteDoc(postRef);
};

/**
 * Update like status for a post
 */
export const updatePostLikeDoc = async (
  postId: string,
  userId: string,
  isLiked: boolean
): Promise<void> => {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const snap = await getDoc(postRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const currentLikes: string[] = data.likes || [];
  let nextLikes: string[];

  if (isLiked) {
    nextLikes = currentLikes.includes(userId) ? currentLikes : [...currentLikes, userId];
  } else {
    nextLikes = currentLikes.filter((id) => id !== userId);
  }

  await updateDoc(postRef, {
    likes: nextLikes,
    likesCount: nextLikes.length,
  });
};

/**
 * Update bookmark status for a post
 */
export const updatePostBookmarkDoc = async (
  postId: string,
  userId: string,
  isBookmarked: boolean
): Promise<void> => {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const snap = await getDoc(postRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const currentBookmarks: string[] = data.bookmarks || [];
  let nextBookmarks: string[];

  if (isBookmarked) {
    nextBookmarks = currentBookmarks.includes(userId)
      ? currentBookmarks
      : [...currentBookmarks, userId];
  } else {
    nextBookmarks = currentBookmarks.filter((id) => id !== userId);
  }

  await updateDoc(postRef, {
    bookmarks: nextBookmarks,
  });
};

/**
 * Add a comment to a post
 */
export const addCommentToPostDoc = async (postId: string, comment: Comment): Promise<void> => {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const snap = await getDoc(postRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const comments: Comment[] = data.comments || [];
  const updatedComments = [...comments, comment];

  await updateDoc(postRef, {
    comments: updatedComments,
  });
};

/**
 * Toggle like on a comment
 */
export const toggleCommentLikeDoc = async (
  postId: string,
  commentId: string,
  userId: string
): Promise<void> => {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const snap = await getDoc(postRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const comments: Comment[] = data.comments || [];
  const updatedComments = comments.map((c) => {
    if (c.id === commentId) {
      const likes: string[] = c.likes || [];
      const isLiked = likes.includes(userId);
      const nextLikes = isLiked ? likes.filter((id) => id !== userId) : [...likes, userId];
      return {
        ...c,
        likes: nextLikes,
        likesCount: nextLikes.length,
      };
    }
    return c;
  });

  await updateDoc(postRef, {
    comments: updatedComments,
  });
};

/**
 * Delete a comment from a post
 */
export const deleteCommentFromPostDoc = async (
  postId: string,
  commentId: string
): Promise<void> => {
  const postRef = doc(db, POSTS_COLLECTION, postId);
  const snap = await getDoc(postRef);
  if (!snap.exists()) return;

  const data = snap.data();
  const comments: Comment[] = data.comments || [];
  const updatedComments = comments.filter((c) => c.id !== commentId);

  await updateDoc(postRef, {
    comments: updatedComments,
  });
};

/**
 * Get or create UserProfile document
 */
export const getUserProfileDoc = async (userId: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch user profile from Firestore:', err);
    return null;
  }
};

/**
 * Save user profile to Firestore
 */
export const saveUserProfileDoc = async (profile: UserProfile): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, profile.id);
    await setDoc(userRef, profile, { merge: true });
  } catch (err) {
    console.warn('Failed to save user profile to Firestore:', err);
  }
};

/**
 * Save draft document for a user
 */
export const saveDraftDoc = async (userId: string, draft: PostDraft): Promise<void> => {
  try {
    const draftRef = doc(db, DRAFTS_COLLECTION, userId);
    await setDoc(draftRef, draft, { merge: true });
  } catch (err) {
    console.warn('Failed to save draft to Firestore:', err);
  }
};

/**
 * Get draft document for a user
 */
export const getDraftDoc = async (userId: string): Promise<PostDraft | null> => {
  try {
    const draftRef = doc(db, DRAFTS_COLLECTION, userId);
    const snap = await getDoc(draftRef);
    if (snap.exists()) {
      return snap.data() as PostDraft;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch draft from Firestore:', err);
    return null;
  }
};

/**
 * Delete draft document for a user
 */
export const deleteDraftDoc = async (userId: string): Promise<void> => {
  try {
    const draftRef = doc(db, DRAFTS_COLLECTION, userId);
    await deleteDoc(draftRef);
  } catch (err) {
    console.warn('Failed to delete draft from Firestore:', err);
  }
};

