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
  creator?: {
    id: number;
    username: string;
    email: string;
    nickname?: string;
    avatar_url?: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id?: string
  time: string
  preview: string
  isRead?: boolean
}

export interface SimilarCharacter {
  id?: string
  name: string
  image: string
  category?: string
}

export interface CharacterCategory {
  id: string
  name: string
  isActive: boolean
}

export interface CharacterStats {
  totalCharacters: number
  activeUsers: number
  totalConversations: number
}
