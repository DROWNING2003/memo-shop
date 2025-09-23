"use client";

import { motion } from "motion/react";

interface CharacterAvatarProps {
  src?: string;
  alt: string;
  size?: "sm" | "md" | "lg";
  className?: string;
  isOnline?: boolean;
}

const sizeClasses = {
  sm: "w-12 h-12",
  md: "w-14 h-14", 
  lg: "w-16 h-16"
};

const gradients = [
  "from-pink-400 to-purple-500",
  "from-blue-400 to-indigo-500", 
  "from-green-400 to-teal-500",
  "from-yellow-400 to-orange-500",
  "from-red-400 to-pink-500",
  "from-indigo-400 to-purple-500",
  "from-teal-400 to-blue-500",
  "from-orange-400 to-red-500"
];

export default function CharacterAvatar({ 
  src, 
  alt, 
  size = "md", 
  className = "",
  isOnline 
}: CharacterAvatarProps) {
  // 根据名字生成一致的渐变色
  const gradientIndex = alt.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % gradients.length;
  const gradient = gradients[gradientIndex];
  
  // 获取名字的首字符
  const initial = alt.charAt(0);

  return (
    <div className={`relative ${className}`}>
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className={`${sizeClasses[size]} rounded-full overflow-hidden relative`}
      >
        {src ? (
          <img 
            src={src}
            alt={alt}
            className="w-full h-full object-cover"
            onError={(e) => {
              // 如果图片加载失败，显示渐变背景和首字符
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = `
                  <div class="w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center">
                    <span class="text-white font-semibold text-lg">${initial}</span>
                  </div>
                `;
              }
            }}
          />
        ) : (
          <div className={`w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center`}>
            <span className="text-white font-semibold text-lg">{initial}</span>
          </div>
        )}
      </motion.div>
      
      {isOnline !== undefined && (
        <div className={`absolute -right-1 -bottom-1 w-4 h-4 border-2 border-white rounded-full ${
          isOnline ? 'bg-green-500' : 'bg-gray-400'
        }`}></div>
      )}
    </div>
  );
}