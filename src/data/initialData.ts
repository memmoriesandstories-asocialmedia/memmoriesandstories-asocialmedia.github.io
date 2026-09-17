import { Post, UserProfile } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'user_chenxi',
  name: '林晨希 Alex',
  handle: '@chenxi_alex',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
  coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
  bio: '視覺設計師 & 城市漫遊者 📷 專注於捕捉生活中的光影與微小感動。歡迎交流攝影與設計心得！',
  website: 'https://chenxi-portfolio.design',
  location: '台北市, 台灣',
  joinedDate: '2023年 10月',
  followingCount: 248,
  followersCount: 1420,
};

export const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&h=400&q=80',
];

export const PRESET_COVERS = [
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1470240731273-7821a6eeb6bd?auto=format&fit=crop&w=1600&q=80',
  'https://images.unsplash.com/photo-1477959858617-67f30bc75b82?auto=format&fit=crop&w=1600&q=80',
];

export const SAMPLE_POST_IMAGES = [
  {
    title: '咖啡館午後',
    url: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: '富士山晨曦',
    url: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: '雨後街景',
    url: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: '工作空間靈感',
    url: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
  },
  {
    title: '海邊日落',
    url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post_1',
    author: {
      id: 'user_chenxi',
      name: '林晨希 Alex',
      handle: '@chenxi_alex',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
    },
    content: '週末漫步在迪化街的紅磚巷弄，偶然發現這家隱密的古董咖啡店。老木窗灑落的午後陽光特別迷人，點了一杯手沖肯亞，帶著一本書，享受難得的慢節奏時光。☕✨',
    imageUrl: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80',
    tags: ['咖啡時光', '城市漫遊', '台北日常', '底片攝影'],
    likesCount: 38,
    isLiked: true,
    location: '台北市 · 大稻埕老洋樓咖啡',
    createdAt: '2小時前',
    isBookmarked: false,
    comments: [
      {
        id: 'c_1',
        postId: 'post_1',
        author: {
          id: 'user_sophia',
          name: 'Sophia Chang',
          handle: '@sophia_travel',
          avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
        },
        content: '光影拍得太有氛圍了！請問這家叫什麼名字？我也想去朝聖！',
        createdAt: '1小時前',
        likesCount: 4,
        isLiked: true,
      },
      {
        id: 'c_2',
        postId: 'post_1',
        author: {
          id: 'user_chenxi',
          name: '林晨希 Alex',
          handle: '@chenxi_alex',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
        },
        content: '@sophia_travel 是迪化街一段附近的「時光烘焙所」，下午3點左右光線最漂亮！',
        createdAt: '45分鐘前',
        likesCount: 2,
        isLiked: false,
      },
    ],
  },
  {
    id: 'post_2',
    author: {
      id: 'user_david',
      name: 'David Lee 攝影誌',
      handle: '@david_lens',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
    },
    content: '等待破曉的那一刻，氣溫只有零下三度。當第一道曙光照耀在皚皚積雪的富士山山頭，天際染上了淡粉紫的漸層，瞬間忘卻所有寒冷。大自然永遠是最純粹的調色大師。🏔️',
    imageUrl: 'https://images.unsplash.com/photo-1490806843957-31f4c9a91c65?auto=format&fit=crop&w=1200&q=80',
    tags: ['旅行日記', '風光攝影', '富士山', '日出'],
    likesCount: 126,
    isLiked: false,
    location: '日本 · 山梨縣河口湖',
    createdAt: '5小時前',
    isBookmarked: true,
    comments: [
      {
        id: 'c_3',
        postId: 'post_2',
        author: {
          id: 'user_kevin',
          name: 'Kevin Studio',
          handle: '@kevin_design',
          avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&h=400&q=80',
        },
        content: '極品色調！是用Sony還是Leica拍的呢？太震撼了！',
        createdAt: '3小時前',
        likesCount: 5,
        isLiked: false,
      },
    ],
  },
  {
    id: 'post_3',
    author: {
      id: 'user_kevin',
      name: 'Kevin Studio',
      handle: '@kevin_design',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=400&h=400&q=80',
    },
    content: '重新整理了居家工作桌面的配置。換上了實木升降桌與暖色調間接照明，工作效率與心情直接提升50%。極簡、俐落、讓注意力回歸創造本身。🖥️🌿',
    imageUrl: 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1200&q=80',
    tags: ['數位遊牧', '桌面美學', '設計靈感', '工作空間'],
    likesCount: 89,
    isLiked: true,
    location: '台中市 · Home Studio',
    createdAt: '昨天',
    isBookmarked: false,
    comments: [
      {
        id: 'c_4',
        postId: 'post_3',
        author: {
          id: 'user_chenxi',
          name: '林晨希 Alex',
          handle: '@chenxi_alex',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
        },
        content: '那個螢幕支架看起來好穩，求推薦品牌！',
        createdAt: '昨天',
        likesCount: 1,
        isLiked: false,
      },
    ],
  },
  {
    id: 'post_4',
    author: {
      id: 'user_sophia',
      name: 'Sophia Chang',
      handle: '@sophia_travel',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&h=400&q=80',
    },
    content: '雨後的城市有著獨特的反光之美。霓虹倒映在柏油路面，行人匆匆，每個雨滴都在折射著城市的脈搏。放慢腳步，即使是陰雨天也能捕捉到浪漫。🌧️🌃',
    imageUrl: 'https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80',
    tags: ['城市漫遊', '街頭攝影', '雨天', '夜景'],
    likesCount: 64,
    isLiked: false,
    location: '台北市 · 信義商圈',
    createdAt: '2天前',
    isBookmarked: false,
    comments: [],
  },
];
