"use client";

import React from "react";
import { User, Star, MessageCircle, Eye, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Character } from "@/types/api";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface CharacterCardProps {
  character: Character;
  showEditButton?: boolean;
}

export function CharacterCard({ character, showEditButton = false }: CharacterCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    router.push(`/characters/${character.id}`);
  };

  // 获取角色名称的首字母作为头像回退
  const getAvatarFallback = () => {
    return character.name.charAt(0).toUpperCase();
  };

  return (
    <div 
      className={cn(
        "group rounded-2xl p-5 cursor-pointer transition-all duration-300",
        "hover:shadow-lg border border-border/40 bg-card/50 backdrop-blur-sm",
        "hover:border-primary/20"
      )}
      onClick={handleCardClick}
    >
      <div className="space-y-4">
        {/* 顶部：头像和基本信息 */}
        <div className="flex items-start space-x-3">
          <div className="relative flex-shrink-0">
            <Avatar className="w-12 h-12 border-2 border-background shadow-sm">
              <AvatarImage 
                src={character.avatar_url} 
                className="object-cover"
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {getAvatarFallback()}
              </AvatarFallback>
            </Avatar>
          </div>

          <div className="flex-1 min-w-0">
            {/* AI角色名称 */}
            <h3 className="font-semibold text-card-foreground text-base line-clamp-1 group-hover:text-primary transition-colors">
              {character.name}
            </h3>
            
            {/* 用户扮演的角色名称 */}
            <div className="flex items-center space-x-1 mt-1">
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span className="text-xs text-muted-foreground line-clamp-1">
                扮演：{character.user_role_name}
              </span>
            </div>
          </div>
        </div>

        {/* 角色描述 */}
        <div className="bg-background/30 rounded-lg p-3 border border-border/20">
          <p className="text-sm text-card-foreground/80 leading-relaxed line-clamp-3">
            {character.description}
          </p>
        </div>

        {/* 底部统计信息 */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1.5 bg-background/50 rounded-full px-2 py-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className="text-xs font-medium text-card-foreground/80">
                {Math.round(character.popularity_score * 10) / 10}
              </span>
            </div>
            
            <div className="flex items-center space-x-1.5 bg-background/50 rounded-full px-2 py-1">
              <MessageCircle className="w-3 h-3 text-blue-500" />
              <span className="text-xs font-medium text-card-foreground/80">
                {character.usage_count}
              </span>
            </div>
          </div>

          {/* 悬停提示 */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-primary/10 text-primary text-xs rounded-full px-2 py-1">
              查看详情
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}