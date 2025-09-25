// API 响应类型定义
export interface APIResponse<T = unknown> {
  code: number;
  message: string;
  data: T;
}

export interface PaginatedResponse<T = unknown> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

// 用户相关类型
export interface User {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar_url?: string;
  signature?: string;
  language?: string;
  font_size?: string;
  dark_mode?: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserLoginRequest {
  email: string;
  password: string;
}

export interface UserCreateRequest {
  username: string;
  email: string;
  password: string;
  nickname?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// 角色相关类型
export interface Character {
  id: number;
  name: string;
  description: string;
  avatar_url?: string;
  voice_url?: string;
  voice_id?: string; // 音色ID字段，用于AI生成声音
  user_role_name: string;
  user_role_desc: string;
  visibility: 'private' | 'public';
  is_active: boolean;
  popularity_score: number;
  usage_count: number;
  creator_id: number;
  creator?: User;
  created_at: string;
  updated_at: string;
}

export interface CharacterCreateRequest {
  name: string;
  description: string;
  user_role_name: string;
  user_role_desc: string;
  avatar_url?: string;
  voice_url?: string;
  voice_id?: string; // 音色ID字段，用于AI生成声音
  visibility?: 'private' | 'public';
}

// 明信片相关类型
export interface Postcard {
  id: number;
  content: string;
  conversation_id?: string;
  character_id: number;
  character?: Character;
  user_id: number;
  user?: User;
  image_url?: string;
  ai_generated_image_url?: string;
  voice_url?: string;
  postcard_template?: string;
  type: 'user' | 'ai'; // 新增的type字段，表示明信片类型
  status: 'draft' | 'sent' | 'delivered' | 'read';
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface PostcardCreateRequest {
  character_id: number;
  content: string;
  conversation_id?: string;
  image_url?: string;
  voice_url?: string;
  postcard_template?: string;
  type?: 'user' | 'ai'; // 新增的type字段
}

export interface PostcardUpdateRequest {
  content?: string;
  image_url?: string;
  voice_url?: string;
  postcard_template?: string;
  type?: 'user' | 'ai'; // 新增的type字段
  status?: 'draft' | 'sent' | 'delivered' | 'read';
  is_favorite?: boolean;
}

// 查询参数类型
export interface PostcardListParams {
  page?: number;
  page_size?: number;
  conversation_id?: string;
  character_id?: number;
  status?: 'draft' | 'sent' | 'delivered' | 'read';
  is_favorite?: boolean;
  sort_by?: 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  type?: 'user' | 'ai' | 'all'; // 过滤明信片类型
}

export interface CharacterListParams {
  page?: number;
  page_size?: number;
  visibility?: 'private' | 'public';
  creator_id?: number;
  search?: string;
  sort_by?: 'created_at' | 'popularity_score' | 'usage_count';
  sort_order?: 'asc' | 'desc';
}

// 角色更新请求类型
export interface CharacterUpdateRequest {
  name?: string;
  description?: string;
  user_role_name?: string;
  user_role_desc?: string;
  avatar_url?: string;
  voice_url?: string;
  voice_id?: string; // 音色ID字段，用于AI生成声音
  is_active?: boolean;
  visibility?: 'private' | 'public';
}

// 用户响应类型
export interface UserResponse {
  id: number;
  username: string;
  email: string;
  nickname?: string;
  avatar_url?: string;
  signature?: string;
  language?: string;
  font_size?: string;
  dark_mode?: boolean;
  created_at: string;
  updated_at: string;
}

// 用户更新请求类型
export interface UserUpdateRequest {
  nickname?: string;
  avatar_url?: string;
  signature?: string;
  language?: string;
  font_size?: 'small' | 'medium' | 'large';
  dark_mode?: boolean;
}

// 上传响应类型
export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}
