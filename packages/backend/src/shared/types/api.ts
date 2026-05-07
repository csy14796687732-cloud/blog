import type { PostWithRelations, UserPublic, Category, Tag, Comment } from './models.js';

// Generic API response
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  display_name?: string;
}

export interface AuthResponse {
  user: UserPublic;
  token: string;
}

export interface UpdateProfileRequest {
  display_name?: string;
  bio?: string;
  avatar?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

// Posts
export interface CreatePostRequest {
  title: string;
  content: string;
  excerpt?: string;
  cover_image?: string;
  status?: 'draft' | 'published';
  featured?: boolean;
  category_id?: string;
  tags?: string[];
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {}

export interface PostListResponse extends PaginatedResponse<PostWithRelations> {}

export interface SearchParams {
  q: string;
  page?: number;
  pageSize?: number;
}

export interface PostFilterParams {
  page?: number;
  pageSize?: number;
  category?: string;
  tag?: string;
  status?: string;
  search?: string;
}

// Categories
export interface CreateCategoryRequest {
  name: string;
  description?: string;
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

// Tags
export interface CreateTagRequest {
  name: string;
}

export interface UpdateTagRequest extends Partial<CreateTagRequest> {}

// Comments
export interface CreateCommentRequest {
  content: string;
  parent_id?: string;
}

export interface CommentFilterParams {
  page?: number;
  pageSize?: number;
  status?: string;
}

// Dashboard
export interface DashboardStats {
  totalPosts: number;
  totalComments: number;
  totalUsers: number;
  totalViews: number;
  publishedPosts: number;
  draftPosts: number;
  pendingComments: number;
  totalCategories: number;
  totalTags: number;
}

export interface ViewsTrend {
  date: string;
  count: number;
}

export interface PopularPost {
  id: string;
  title: string;
  slug: string;
  view_count: number;
  like_count: number;
  comment_count: number;
}
