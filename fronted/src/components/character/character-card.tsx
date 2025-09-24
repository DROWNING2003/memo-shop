"use client";

import React from "react";
import { MessageCircle, User, Star, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Character } from "@/types/api";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";

interface CharacterCardProps {
  character: Character;
}

export function CharacterCard({ character }: CharacterCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/characters/${character.id}`);
  };

  const handleChatClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/postcards/create?character_id=${character.id}`);
  };

  // 根据角色类型选择渐变样式
  const getGradientStyle = () => {
    const gradients = [
      "healing-gradient-pink",
      "healing-gradient-blue", 
      "healing-gradient-green",
      "healing-gradient-yellow",
      "healing-gradient-purple"
    ];
    return gradients[character.id % gradients.length];
  };

  return (
    <div 
      className={cn(
        "postcard rounded-2xl p-4 card-hover cursor-pointer",
        getGradientStyle()
      )}
      onClick={handleCardClick}
    >
      {/* 角色头像和基本信息 */}
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="relative">
          <Avatar className="w-16 h-16 neumorphism">
            <AvatarImage src={character.avatar_url} />
            <AvatarFallback>
              <User className="w-8 h-8" />
            </AvatarFallback>
          </Avatar>
          {character.visibility === 'public' && (
            <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Eye className="w-3 h-3 text-primary-foreground" />
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="font-semibold text-foreground text-sm line-clamp-1">
            {character.name}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-1">
            {character.user_role_name}
          </p>
        </div>

        {/* 角色描述 */}
        <p className="text-xs text-foreground/70 leading-relaxed line-clamp-2 min-h-[2.5rem]">
          {character.description}
        </p>

        {/* 统计信息 */}
        <div className="flex items-center justify-center space-x-4 text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3" />
            <span>{Math.round(character.popularity_score * 10) / 10}</span>
          </div>
          <div className="flex items-center space-x-1">
            <MessageCircle className="w-3 h-3" />
            <span>{character.usage_count}</span>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="w-full pt-2">
          <button
            onClick={handleChatClick}
            className="w-full py-2 px-3 rounded-xl bg-background/50 hover:bg-background/70 transition-colors text-xs font-medium text-foreground flex items-center justify-center space-x-1"
          >
            <MessageCircle className="w-3 h-3" />
            <span>开始对话</span>
          </button>
        </div>
      </div>
    </div>
  );
}