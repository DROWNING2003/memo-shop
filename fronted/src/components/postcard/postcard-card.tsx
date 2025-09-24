"use client";

import React from "react";
import { Heart, MessageCircle, Calendar, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Postcard } from "@/types/api";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

interface PostcardCardProps {
  postcard: Postcard;
}

// 根据状态确定卡片样式
const statusStyles = {
  draft: "healing-gradient-yellow",
  sent: "healing-gradient-blue", 
  delivered: "healing-gradient-green",
  read: "healing-gradient-pink"
};

const statusEmojis = {
  draft: "✏️",
  sent: "📮",
  delivered: "📬",
  read: "💌"
};

const statusLabels = {
  draft: "草稿",
  sent: "已发送",
  delivered: "已送达", 
  read: "已阅读"
};

export function PostcardCard({ postcard }: PostcardCardProps) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = React.useState(postcard.is_favorite);
  const [favoriteLoading, setFavoriteLoading] = React.useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "刚刚";
    if (diffInHours < 24) return `${diffInHours}小时前`;
    if (diffInHours < 48) return "昨天";
    
    return date.toLocaleDateString("zh-CN", {
      month: "short",
      day: "numeric"
    });
  };

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (favoriteLoading) return;

    setFavoriteLoading(true);
    try {
      await apiClient.updatePostcard(postcard.id, {
        is_favorite: !isFavorite
      });
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleContinueChat = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (postcard.conversation_id) {
      router.push(`/conversations/${postcard.conversation_id}`);
    } else {
      router.push(`/characters/${postcard.character_id}`);
    }
  };

  const handleCardClick = () => {
    router.push(`/postcards/${postcard.id}`);
  };

  // 生成明信片标题（从内容中提取前几个字）
  const getTitle = () => {
    const maxLength = 20;
    if (postcard.content.length <= maxLength) {
      return postcard.content;
    }
    return postcard.content.substring(0, maxLength) + "...";
  };

  return (
    <div 
      className={cn(
        "postcard rounded-2xl p-4 card-hover cursor-pointer",
        statusStyles[postcard.status]
      )}
      onClick={handleCardClick}
    >
      {/* 头部信息 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <Avatar className="w-10 h-10 neumorphism">
            <AvatarImage src={postcard.character?.avatar_url} />
            <AvatarFallback>
              <User className="w-5 h-5" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium text-foreground text-sm">
              {getTitle()}
            </h3>
            <p className="text-xs text-muted-foreground">
              与 {postcard.character?.name || '未知角色'} 的对话
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            {statusEmojis[postcard.status]} {statusLabels[postcard.status]}
          </Badge>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(postcard.created_at)}</span>
          </div>
        </div>
      </div>

      {/* 内容 */}
      <div className="mb-3">
        <p className="text-sm text-foreground/80 leading-relaxed line-clamp-3">
          {postcard.content}
        </p>
      </div>

      {/* 底部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {postcard.postcard_template && (
            <Badge variant="outline" className="text-xs">
              {postcard.postcard_template}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center space-x-3 text-muted-foreground">
          <button 
            onClick={handleFavoriteToggle}
            disabled={favoriteLoading}
            className={cn(
              "flex items-center space-x-1 hover:text-primary transition-colors",
              isFavorite && "text-red-500"
            )}
          >
            {isFavorite ? (
              <Heart className="w-4 h-4 fill-current" />
            ) : (
              <Heart className="w-4 h-4" />
            )}
          </button>
          
          <button 
            onClick={handleContinueChat}
            className="flex items-center space-x-1 hover:text-primary transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-xs">继续聊</span>
          </button>
        </div>
      </div>
    </div>
  );
}