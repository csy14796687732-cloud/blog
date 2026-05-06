import type { UserRole, PostStatus, CommentStatus } from './enums.js';

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  display_name: string;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export interface UserPublic {
  id: string;
  username: string;
  display_name: string;
  avatar: string | null;
  bio: string | null;
  role: UserRole;
  created_at: string;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  cover_image: string | null;
  status: PostStatus;
  featured: boolean;
  view_count: number;
  author_id: string;
  category_id: string | null;
  published_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export interface PostWithRelations extends Post {
  author: UserPublic;
  category: Category | null;
  tags: Tag[];
  like_count: number;
  comment_count: number;
  is_liked?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: Date;
  post_count?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
  post_count?: number;
}

export interface Comment {
  id: string;
  content: string;
  status: CommentStatus;
  user_id: string;
  post_id: string;
  parent_id: string | null;
  created_at: Date;
  user?: UserPublic;
  replies?: Comment[];
}

export interface Like {
  id: string;
  user_id: string;
  post_id: string;
  created_at: Date;
}

export interface PageView {
  id: string;
  post_id: string | null;
  ip: string;
  user_agent: string | null;
  path: string;
  created_at: Date;
}
