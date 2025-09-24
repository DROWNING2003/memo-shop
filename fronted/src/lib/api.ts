
import axios, { AxiosInstance } from 'axios';
import {
  APIResponse,
  UploadResponse,
  User,
  LoginResponse,
  UserLoginRequest,
  UserCreateRequest,
  Character,
  CharacterCreateRequest,
  CharacterUpdateRequest,
  Postcard,
  PostcardCreateRequest,
  PostcardUpdateRequest,
  PostcardListParams,
  CharacterListParams,
  PaginatedResponse,
  UserResponse,
  UserUpdateRequest
} from '@/types/api';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080',
    });
    
    // 添加请求拦截器，自动添加认证令牌
    this.client.interceptors.request.use((config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // 添加响应拦截器，处理认证失败
    this.client.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (error.response?.status === 401) {
          // 认证失败，清除本地存储的token并跳转到登录页面
          this.removeAuthToken();
          // 检查是否在浏览器环境中
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
          }
        }
        return Promise.reject(error);
      }
    );
  }

  // 用户认证相关方法
  async login(credentials: UserLoginRequest): Promise<LoginResponse> {
    const response = await this.client.post<APIResponse<LoginResponse>>('/api/auth/login', credentials);
    const result = response.data.data;
    // 登录成功后保存token
    if (result.token) {
      localStorage.setItem('token', result.token);
    }
    return result;
  }

  async register(userData: UserCreateRequest): Promise<UserResponse> {
    const response = await this.client.post<APIResponse<UserResponse>>('/api/auth/register', userData);
    return response.data.data;
  }

  async getUserProfile(): Promise<UserResponse> {
    const response = await this.client.get<APIResponse<UserResponse>>('/api/users/profile');
    return response.data.data;
  }

  async updateUserProfile(userData: UserUpdateRequest): Promise<UserResponse> {
    const response = await this.client.put<APIResponse<UserResponse>>('/api/users/profile', userData);
    return response.data.data;
  }

  async getUserById(id: number): Promise<UserResponse> {
    const response = await this.client.get<APIResponse<UserResponse>>(`/api/users/${id}`);
    return response.data.data;
  }

  // 角色相关方法
  async getCharacters(params?: CharacterListParams): Promise<PaginatedResponse<Character>> {
    const response = await this.client.get<APIResponse<PaginatedResponse<Character>>>('/api/characters', { params });
    return response.data.data;
  }

  async getFavoriteCharacters(params?: { page?: number; page_size?: number }): Promise<PaginatedResponse<Character>> {
    const response = await this.client.get<APIResponse<PaginatedResponse<Character>>>('/api/characters/favorites', { params });
    return response.data.data;
  }

  async getMyCharacters(params?: { page?: number; page_size?: number }): Promise<PaginatedResponse<Character>> {
    const response = await this.client.get<APIResponse<PaginatedResponse<Character>>>('/api/characters/my', { params });
    return response.data.data;
  }

  async getCharacter(id: number): Promise<Character> {
    const response = await this.client.get<APIResponse<Character>>(`/api/characters/${id}`);
    return response.data.data;
  }

  async createCharacter(characterData: CharacterCreateRequest): Promise<Character> {
    const response = await this.client.post<APIResponse<Character>>('/api/characters', characterData);
    return response.data.data;
  }

  async updateCharacter(id: number, characterData: CharacterUpdateRequest): Promise<Character> {
    const response = await this.client.put<APIResponse<Character>>(`/api/characters/${id}`, characterData);
    return response.data.data;
  }

  async deleteCharacter(id: number): Promise<void> {
    await this.client.delete<APIResponse<void>>(`/api/characters/${id}`);
  }

  async checkCharacterFavorite(id: number): Promise<{ is_favorite: boolean }> {
    const response = await this.client.get<APIResponse<{ is_favorite: boolean }>>(`/api/characters/${id}/favorite`);
    return response.data.data;
  }

  async toggleCharacterFavorite(id: number): Promise<{ is_favorite: boolean }> {
    const response = await this.client.post<APIResponse<{ is_favorite: boolean }>>(`/api/characters/${id}/favorite`);
    return response.data.data;
  }

  // 明信片相关方法
  async getPostcards(params?: PostcardListParams): Promise<PaginatedResponse<Postcard>> {
    const response = await this.client.get<APIResponse<PaginatedResponse<Postcard>>>('/api/postcards', { params });
    return response.data.data;
  }

  async getPostcard(id: number): Promise<Postcard> {
    const response = await this.client.get<APIResponse<Postcard>>(`/api/postcards/${id}`);
    return response.data.data;
  }

  async createPostcard(postcardData: PostcardCreateRequest): Promise<Postcard> {
    const response = await this.client.post<APIResponse<Postcard>>('/api/postcards', postcardData);
    return response.data.data;
  }

  async updatePostcard(id: number, postcardData: PostcardUpdateRequest): Promise<Postcard> {
    const response = await this.client.put<APIResponse<Postcard>>(`/api/postcards/${id}`, postcardData);
    return response.data.data;
  }

  async deletePostcard(id: number): Promise<void> {
    await this.client.delete<APIResponse<void>>(`/api/postcards/${id}`);
  }

  async getConversation(conversationId: string): Promise<Postcard[]> {
    const response = await this.client.get<APIResponse<Postcard[]>>(`/api/postcards/conversations/${conversationId}`);
    return response.data.data;
  }

  // 文件上传相关方法
  async uploadCharacterAvatar(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post<APIResponse<UploadResponse>>('/api/upload/character-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  async uploadAudio(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post<APIResponse<UploadResponse>>('/api/upload/audio', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  async uploadImage(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post<APIResponse<UploadResponse>>('/api/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  async uploadAvatar(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post<APIResponse<UploadResponse>>('/api/upload/avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  }

  // 工具方法
  setAuthToken(token: string): void {
    localStorage.setItem('token', token);
  }

  removeAuthToken(): void {
    localStorage.removeItem('token');
  }

  getAuthToken(): string | null {
    return localStorage.getItem('token');
  }
}

export const apiClient = new ApiClient();
