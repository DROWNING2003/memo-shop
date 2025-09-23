"use client";

import { motion } from "motion/react";
import { Search, Sliders, Flame, Mail } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import CharacterAvatar from "@/components/CharacterAvatar";
import { getAllCharacters, searchCharacters } from "@/lib/characters";

// 获取角色数据
const allCharacters = getAllCharacters();
const recommendedCharacters = allCharacters.slice(0, 4);
const popularCharacters = allCharacters.slice(0, 5);
const recentChats = allCharacters.slice(0, 3);

const categories = [
  { name: "动漫角色", active: true },
  { name: "文学角色", active: false },
  { name: "经典IP", active: false },
  { name: "治愈系", active: false },
  { name: "历史人物", active: false },
];

export default function CharacterSquare() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(0);

  // 处理角色点击事件
  const handleCharacterClick = (characterId: string) => {
    router.push(`/character-detail/${characterId}`);
  };

  // 根据搜索和分类过滤角色
  const getFilteredCharacters = () => {
    let filtered = allCharacters;
    
    // 搜索过滤
    if (searchQuery.trim()) {
      filtered = searchCharacters(searchQuery);
    }
    
    // 分类过滤
    if (selectedCategory > 0) {
      const categoryName = categories[selectedCategory].name;
      filtered = filtered.filter(char => char.category === categoryName);
    }
    
    return filtered;
  };

  const filteredCharacters = getFilteredCharacters();

  return (
    <div className="min-h-screen warm-gradient character-square">
      {/* 固定头部 */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 w-full bg-[#FAF6F0] z-10"
      >
        <div className="h-[env(safe-area-inset-top)]"></div>
        <header className="flex justify-between items-center h-14 px-6">
          <h1 className="text-[#3D2914E6] text-xl font-semibold">角色广场</h1>
          <div className="w-6 h-6 flex items-center justify-center">
            <Sliders className="w-5 h-5 text-[#E07B39]" />
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
              placeholder="搜索你感兴趣的角色"
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
          className="mb-4 px-4"
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

        {/* 为你推荐 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4 px-4"
        >
          <h2 className="mb-4 text-[#3D2914E6] text-xl font-semibold">
            为你推荐
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {(searchQuery.trim() || selectedCategory > 0 ? filteredCharacters.slice(0, 4) : recommendedCharacters).map((character, index) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleCharacterClick(character.id)}
                className="card-gradient character-card p-4 rounded-2xl backdrop-blur-sm cursor-pointer"
              >
                <div className="flex justify-center mb-3">
                  <CharacterAvatar
                    src={character.avatar}
                    alt={character.name}
                    size="lg"
                  />
                </div>
                <h3 className="text-center mb-2 text-[#3D2914E6] text-sm font-semibold">
                  {character.name}
                </h3>
                <p className="text-center mb-3 text-[#5C4A39CC] text-xs leading-relaxed">
                  {character.description.split('\n')[0]}
                </p>
                <div className="flex justify-center items-center gap-1">
                  <Flame className="w-4 h-4 text-[#E07B39]" />
                  <span className="text-[#E07B39] text-xs">
                    {character.likes}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 最受欢迎 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-4 px-4"
        >
          <h2 className="mb-4 text-[#3D2914E6] text-xl font-semibold">
            最受欢迎
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {popularCharacters.map((character, index) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleCharacterClick(character.id)}
                className="flex flex-col items-center gap-2 min-w-[80px] cursor-pointer"
              >
                <CharacterAvatar
                  src={character.avatar}
                  alt={character.name}
                  size="md"
                  isOnline={character.isOnline}
                />
                <span className="text-center text-[#3D2914E6] text-xs">
                  {character.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 最近通信 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="px-4"
        >
          <h2 className="mb-4 text-[#3D2914E6] text-xl font-semibold">
            最近通信
          </h2>
          <div>
            {recentChats.map((character, index) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleCharacterClick(character.id)}
                className={`card-gradient character-card flex items-center gap-3 p-4 rounded-2xl backdrop-blur-sm cursor-pointer ${
                  index < recentChats.length - 1 ? "mb-3" : ""
                }`}
              >
                <CharacterAvatar
                  src={character.avatar}
                  alt={character.name}
                  size="sm"
                />
                <div className="flex-1">
                  <h3 className="text-[#3D2914E6] text-sm font-semibold">
                    {character.name}
                  </h3>
                  <p className="text-[#5C4A39CC] text-xs">
                    {character.conversations[0]?.time || '暂无消息'}
                  </p>
                </div>
                <div className="w-6 h-6 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-[#E07B39]" />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      </main>


    </div>
  );
}
