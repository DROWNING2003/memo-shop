export interface Character {
  id: string
  name: string
  description: string
  story: string
  avatar: string
  rating: number
  likes: string
  messages: string
  tags: string[]
  isOnline: boolean
  conversations: Conversation[]
  similarCharacters: SimilarCharacter[]
  category?: string
  popularity?: number
  lastActiveTime?: string
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