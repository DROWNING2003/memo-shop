'use client'

import React from 'react'
import { ArrowLeft, Heart, MessageCircle, Phone, Share2, Star } from 'lucide-react'
import { Character } from '@/types/character'

interface CharacterDetailProps {
  character?: Character
  onBack?: () => void
  onShare?: () => void
  onStartChat?: () => void
  onCall?: () => void
  onLike?: () => void
}

const defaultCharacter: Character = {
  id: '1',
  name: '小樱',
  description: '温柔善良的魔法少女，总是带着治愈的笑容。\n擅长倾听他人的烦恼，用温暖的话语抚慰人心。',
  story: `小樱是一位拥有神奇魔法力量的少女，她的内心纯净如水晶般透明。从小就展现出对他人痛苦的敏感和同理心，总是能够察觉到身边人的情绪变化。

她相信每个人心中都有一片温暖的净土，只是有时候被生活的阴霾遮蔽了。通过她的魔法和温柔的话语，她帮助人们重新找回内心的光明。

在她的世界里，没有解决不了的烦恼，只有还没有找到合适方法的心灵。她愿意用自己的时间和耐心，陪伴每一个需要帮助的人走过人生的低谷。`,
  avatar: 'https://static.paraflowcontent.com/public/resource/image/05666209-068e-4e4e-af43-5107d4583d47.jpeg',
  rating: 4.9,
  likes: '8.9k',
  messages: '2.1k',
  tags: ['魔法少女', '治愈系', '温柔', '善良', '倾听者', '动漫角色'],
  isOnline: true,
  conversations: [
    { time: '今天 14:30', preview: '谢谢你的鼓励，我感觉好多了...' },
    { time: '昨天 20:15', preview: '你说得对，我应该更相信自己' },
    { time: '3天前', preview: '和你聊天总是让我很放松' }
  ],
  similarCharacters: [
    { name: '子期', image: 'https://static.paraflowcontent.com/public/resource/image/b8701244-20d0-4b2a-b619-909bb9984093.jpeg' },
    { name: '艾米医生', image: 'https://static.paraflowcontent.com/public/resource/image/4903b3ca-ca13-4857-8ee5-ab96d42decf6.jpeg' },
    { name: '小魔女', image: 'https://static.paraflowcontent.com/public/resource/image/9975f440-e846-48e9-8dc0-93b4b7d5a454.jpeg' }
  ]
}

export default function CharacterDetail({
  character = defaultCharacter,
  onBack,
  onShare,
  onStartChat,
  onCall,
  onLike
}: CharacterDetailProps) {
  return (
    <div className="min-h-screen bg-[#FAF6F0] font-sans">
      {/* Header */}
      <div className="fixed top-0 w-full z-10 bg-[#FAF6F0]">
        <div className="h-[env(safe-area-inset-top)]"></div>
        <header className="flex justify-between items-center h-14 px-6">
          <button 
            onClick={onBack}
            className="flex items-center justify-center w-6 h-6 hover:bg-black/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#3D2914E6]" />
          </button>
          <h1 className="text-xl font-semibold text-[#3D2914E6]">角色详情</h1>
          <button 
            onClick={onShare}
            className="flex items-center justify-center w-6 h-6 hover:bg-black/5 rounded-full transition-colors"
          >
            <Share2 className="w-5 h-5 text-[#E07B39]" />
          </button>
        </header>
      </div>

      {/* Spacer for fixed header */}
      <div>
        <div className="h-[env(safe-area-inset-top)]"></div>
        <div className="h-14"></div>
      </div>

      <main className="pt-4 pb-4">
        {/* Character Profile Card */}
        <section className="mb-6 px-4">
          <div className="bg-white/90 rounded-2xl p-6 shadow-sm backdrop-blur-sm">
            {/* Character Avatar and Basic Info */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative mb-4">
                <img 
                  src={character.avatar}
                  alt={`${character.name} - ${character.description.split('\n')[0]}`}
                  className="w-24 h-24 rounded-full object-cover"
                  style={{ filter: 'sepia(15%) saturate(1.1) brightness(1.05)' }}
                />
                {character.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#8FBF47] border-2 border-white rounded-full"></div>
                )}
              </div>
              
              <h2 className="text-2xl font-bold text-[#3D2914E6] mb-2">{character.name}</h2>
              <p className="text-[#5C4A39CC] text-center mb-4 leading-relaxed whitespace-pre-line">
                {character.description}
              </p>
              
              {/* Stats */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-[#E07B39] fill-current" />
                  <span className="text-[#E07B39] text-sm font-medium">{character.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-4 h-4 text-[#E07B39]" />
                  <span className="text-[#E07B39] text-sm">{character.likes}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4 text-[#E07B39]" />
                  <span className="text-[#E07B39] text-sm">{character.messages}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 w-full">
                <button 
                  onClick={onStartChat}
                  className="flex-1 bg-[#E07B39] text-white py-3 px-4 rounded-full font-medium hover:bg-[#D06B29] transition-colors"
                >
                  开始对话
                </button>
                <button 
                  onClick={onCall}
                  className="flex items-center justify-center w-12 h-12 bg-[#F7E7CE] rounded-full hover:bg-[#F0D9B8] transition-colors"
                >
                  <Phone className="w-5 h-5 text-[#E07B39]" />
                </button>
                <button 
                  onClick={onLike}
                  className="flex items-center justify-center w-12 h-12 bg-[#F7E7CE] rounded-full hover:bg-[#F0D9B8] transition-colors"
                >
                  <Heart className="w-5 h-5 text-[#E07B39]" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Character Tags */}
        <section className="mb-6 px-4">
          <div className="bg-white/90 rounded-2xl p-4 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-[#3D2914E6] mb-3">角色标签</h3>
            <div className="flex flex-wrap gap-2">
              {character.tags.map((tag) => (
                <span 
                  key={tag}
                  className="bg-[#F7E7CE] text-[#3D2914] px-3 py-1 rounded-full text-sm hover:bg-[#F0D9B8] transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Character Story */}
        <section className="mb-6 px-4">
          <div className="bg-white/90 rounded-2xl p-4 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-[#3D2914E6] mb-3">角色故事</h3>
            <div className="text-[#5C4A39CC] text-sm leading-relaxed space-y-3">
              {character.story.split('\n\n').map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </section>

        {/* Recent Conversations */}
        <section className="mb-6 px-4">
          <div className="bg-white/90 rounded-2xl p-4 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-[#3D2914E6] mb-3">最近对话</h3>
            <div className="space-y-3">
              {character.conversations.map((conversation, index) => (
                <div key={index} className="flex justify-between items-center py-2 hover:bg-black/5 rounded-lg px-2 -mx-2 transition-colors cursor-pointer">
                  <div className="flex-1">
                    <p className="text-[#3D2914E6] text-sm font-medium mb-1">
                      {conversation.preview}
                    </p>
                    <p className="text-[#5C4A39CC] text-xs">{conversation.time}</p>
                  </div>
                  <MessageCircle className="w-4 h-4 text-[#E07B39] ml-3" />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Similar Characters */}
        <section className="px-4">
          <div className="bg-white/90 rounded-2xl p-4 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-[#3D2914E6] mb-3">相似角色</h3>
            <div className="grid grid-cols-3 gap-3">
              {character.similarCharacters.map((similarCharacter) => (
                <div key={similarCharacter.name} className="text-center cursor-pointer hover:bg-black/5 rounded-lg p-2 -m-2 transition-colors">
                  <img 
                    src={similarCharacter.image}
                    alt={similarCharacter.name}
                    className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
                    style={{ filter: 'sepia(15%) saturate(1.1) brightness(1.05)' }}
                  />
                  <p className="text-[#3D2914E6] text-xs font-medium">{similarCharacter.name}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Spacer */}
      <div>
        <div className="h-18 mt-4"></div>
        <div className="h-[env(safe-area-inset-bottom)]"></div>
      </div>
    </div>
  )
}