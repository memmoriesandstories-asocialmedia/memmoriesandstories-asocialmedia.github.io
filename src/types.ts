export interface Author {
  id: string;
  name: string;
  handle: string;
  avatar: string;
}

export interface Comment {
  id: string;
  postId: string;
  author: Author;
  content: string;
  createdAt: string;
  createdAtTimestamp?: number;
  likesCount: number;
  likes?: string[];
  isLiked?: boolean;
}

export interface Post {
  id: string;
  author: Author;
  content: string;
  imageUrl?: string;
  tags: string[];
  likesCount: number;
  likes?: string[];
  bookmarks?: string[];
  isLiked: boolean;
  comments: Comment[];
  createdAt: string;
  createdAtTimestamp?: number;
  location?: string;
  isBookmarked?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  handle: string;
  avatar: string;
  coverImage: string;
  bio: string;
  website: string;
  location: string;
  joinedDate: string;
  followingCount: number;
  followersCount: number;
  email?: string;
  isAnonymous?: boolean;
}

export interface PostDraft {
  id?: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  location?: string;
  savedAt: number;
}

