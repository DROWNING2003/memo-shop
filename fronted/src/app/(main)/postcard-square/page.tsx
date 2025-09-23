'use client'

import React, { useState } from 'react'
import { motion } from 'motion/react'
import { Search, Filter, Heart, MessageCircle, Share2, Clock, Sparkles } from 'lucide-react'

// 明信片数据类型
interface Postcard {
  id: string
  title: string
  content: string
  author: string
  authorAvatar: string
  characterName: string
  characterAvatar: string
  timestamp: string
  likes: number
  comments: number
  isLiked: boolean
  tags: string[]
  mood: 'happy' | 'sad' | 'thoughtful' | 'excited' | 'peaceful'
}

// 模拟明信片数据
const mockPostcards: Postcard[] = [
  {
    id: '1',
    title: '与小樱的温暖对话',
    content: '今天和小樱聊了很久，她的话语就像春风一样温暖。她告诉我，每个人心中都有一片净土，只要用心去寻找，就能找到属于自己的光明。',
    author: '温暖的旅人',
    authorAvatar: '/api/placeholder/32/32',
    characterName: '小樱',
    characterAvatar: 'https://static.paraflowcontent.com/public/resource/image/05666209-068e-4e4e-af43-5107d4583d47.jpeg',
    timestamp: '2小时前',
    likes: 24,
    comments: 8,
    isLiked: false,
    tags: ['治愈', '温暖', '成长'],
    mood: 'peaceful'
  },
  {
    id: '2',
    title: '子期的诗意人生',
    content: '与子期探讨古诗词的意境，他说："山重水复疑无路，柳暗花明又一村。"人生就是这样，看似绝境，却总有转机。',
    author: '诗词爱好者',
    authorAvatar: '/api/placeholder/32/32',
    characterName: '子期',
    characterAvatar: 'https://static.paraflowcontent.com/public/resource/image/b8701244-20d0-4b2a-b619-909bb9984093.jpeg',
    timestamp: '4小时前',
    likes: 18,
    comments: 12,
    isLiked: true,
    tags: ['诗词', '哲理', '古风'],
    mood: 'thoughtful'
  },
  {
    id: '3',
    title: '艾米医生的专业建议',
    content: '今天向艾米医生咨询了一些心理问题，她耐心地为我分析，让我明白了很多道理。专业的建议真的很有帮助！',
    author: '寻求帮助的人',
    authorAvatar: '/api/placeholder/32/32',
    characterName: '心理医生艾米',
    characterAvatar: 'https://static.paraflowcontent.com/public/resource/image/4903b3ca-ca13-4857-8ee5-ab96d42decf6.jpeg',
    timestamp: '6小时前',
    likes: 31,
    comments: 15,
    isLiked: false,
    tags: ['心理健康', '专业', '帮助'],
    mood: 'happy'
  },
  {
    id: '4',
    title: '橘猫小布的慵懒时光',
    content: '和小布一起度过了一个慵懒的下午，它蜷缩在我身边，轻柔的呼噜声让我感到无比安心。有时候，陪伴就是最好的治愈。',
    author: '猫咪控',
    authorAvatar: '/api/placeholder/32/32',
    characterName: '橘猫小布',
    characterAvatar: 'https://static.paraflowcontent.com/public/resource/image/936bf923-52ba-4b2a-a9f0-e5942fd186e7.jpeg',
    timestamp: '1天前',
    likes: 42,
    comments: 6,
    isLiked: true,
    tags: ['可爱', '陪伴', '治愈'],
    mood: 'peaceful'
  }
]

const categories = [
  { name: '全部', active: true },
  { name: '治愈系', active: false },
  { name: '成长感悟', active: false },
  { name: '日常分享', active: false },
  { name: '深度对话', active: false }
]

const moodColors = {
  happy: 'bg-yellow-100 text-yellow-800',
  sad: 'bg-blue-100 text-blue-800',
  thoughtful: 'bg-purple-100 text-purple-800',
  excited: 'bg-red-100 text-red-800',
  peaceful: 'bg-green-100 text-green-800'
}

export default function PostcardSquare() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState(0)
  const [postcards, setPostcards] = useState(mockPostcards)

  // 处理点赞
  const handleLike = (id: string) => {
    setPostcards(prev => prev.map(postcard => 
      postcard.id === id 
        ? { 
            ...postcard, 
            isLiked: !postcard.isLiked,
            likes: postcard.isLiked ? postcard.likes - 1 : postcard.likes + 1
          }
        : postcard
    ))
  }

  return (
    <div className="min-h-screen warm-gradient">
      {/* 固定头部 */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 w-full bg-[#FAF6F0] z-10"
      >
        <div className="h-[env(safe-area-inset-top)]"></div>
        <header className="flex justify-between items-center h-14 px-6">
          <h1 className="text-[#3D2914E6] text-xl font-semibold">明信片广场</h1>
          <div className="w-6 h-6 flex items-center justify-center">
            <Filter className="w-5 h-5 text-[#E07B39]" />
          </div>
        </header>
      </motion.div>

      {/* 占位空间 */}
      <div>
        <div className="h-[env(safe-area-inset-top)]"></div>
        <div className="h-14"></div>
      </div>

      <main className="pt-4 pb-4">
        {/* 搜索栏 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 px-4"
        >
          <div className="bg-[#F4E4D699] flex items-center gap-3 px-4 py-3 rounded-xl">
            <Search className="w-5 h-5 text-[#8B7355B3]" />
            <input
              type="text"
              placeholder="搜索明信片内容或作者"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent flex-1 outline-none text-[#3D2914] placeholder:text-[#8B7355B3]"
            />
          </div>
        </motion.section>

        {/* 分类标签 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6 px-4"
        >
          <div className="flex gap-2 overflow-x-auto">
            {categories.map((category, index) => (
              <motion.div
                key={category.name}
                whileTap={{ scale: 0.95 }}
                whileHover={{ scale: 1.05 }}
                onClick={() => setSelectedCategory(index)}
                className={`whitespace-nowrap flex items-center px-3 py-2 rounded-full cursor-pointer transition-all duration-200 ${
                  selectedCategory === index
                    ? "bg-[#E07B39] text-white shadow-lg"
                    : "bg-[#F7E7CE] text-[#3D2914] hover:bg-[#F0D9B8]"
                }`}
              >
                <span className="text-sm">{category.name}</span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 明信片列表 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="px-4 space-y-4"
        >
          {postcards.map((postcard, index) => (
            <motion.div
              key={postcard.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="card-gradient character-card p-4 rounded-2xl backdrop-blur-sm"
            >
              {/* 明信片头部 */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <img 
                    src={postcard.authorAvatar}
                    alt={postcard.author}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-[#3D2914E6] text-sm font-semibold">
                      {postcard.author}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[#5C4A39CC] text-xs">与</span>
                      <img 
                        src={postcard.characterAvatar}
                        alt={postcard.characterName}
                        className="w-4 h-4 rounded-full object-cover"
                        style={{ filter: 'sepia(15%) saturate(1.1) brightness(1.05)' }}
                      />
                      <span className="text-[#E07B39] text-xs font-medium">
                        {postcard.characterName}
                      </span>
                      <span className="text-[#5C4A39CC] text-xs">的对话</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[#5C4A39CC]">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">{postcard.timestamp}</span>
                </div>
              </div>

              {/* 明信片标题 */}
              <h2 className="text-[#3D2914E6] text-base font-semibold mb-2">
                {postcard.title}
              </h2>

              {/* 明信片内容 */}
              <p className="text-[#5C4A39CC] text-sm leading-relaxed mb-3">
                {postcard.content}
              </p>

              {/* 标签 */}
              <div className="flex flex-wrap gap-2 mb-3">
                {postcard.tags.map((tag) => (
                  <span 
                    key={tag}
                    className="bg-[#F7E7CE] text-[#3D2914] px-2 py-1 rounded-full text-xs"
                  >
                    #{tag}
                  </span>
                ))}
                <span className={`px-2 py-1 rounded-full text-xs ${moodColors[postcard.mood]}`}>
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  {postcard.mood}
                </span>
              </div>

              {/* 互动按钮 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleLike(postcard.id)}
                    className="flex items-center gap-1"
                  >
                    <Heart 
                      className={`w-4 h-4 transition-colors ${
                        postcard.isLiked 
                          ? 'text-red-500 fill-current' 
                          : 'text-[#5C4A39CC]'
                      }`} 
                    />
                    <span className={`text-xs ${
                      postcard.isLiked ? 'text-red-500' : 'text-[#5C4A39CC]'
                    }`}>
                      {postcard.likes}
                    </span>
                  </motion.button>
                  
                  <button className="flex items-center gap-1">
                    <MessageCircle className="w-4 h-4 text-[#5C4A39CC]" />
                    <span className="text-[#5C4A39CC] text-xs">{postcard.comments}</span>
                  </button>
                </div>
                
                <button>
                  <Share2 className="w-4 h-4 text-[#5C4A39CC]" />
                </button>
              </div>
            </motion.div>
          ))}
        </motion.section>

        {/* 加载更多提示 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center py-8"
        >
          <p className="text-[#5C4A39CC] text-sm">已显示全部明信片</p>
        </motion.div>
      </main>
    </div>
  )
}