"use client";

import React from "react";
import { Heart, MessageCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Postcard } from "@/types/api";

interface PostcardGridProps {
  postcards: Postcard[];
  searchQuery?: string;
  filterType?: "all" | "public" | "my";
  onPostcardClick?: (postcard: Postcard) => void;
  onLikeClick?: (postcard: Postcard) => void;
}

export function PostcardGrid({ 
  postcards, 
  searchQuery = "", 
  filterType = "all",
  onPostcardClick,
  onLikeClick 
}: PostcardGridProps) {
  
  // 过滤明信片
  const filteredPostcards = postcards.filter(postcard => {
    // 搜索过滤
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesContent = postcard.content.toLowerCase().includes(query);
      const matchesCharacter = postcard.character?.name.toLowerCase().includes(query);
      return matchesContent || matchesCharacter;
    }
    
    // 类型过滤
    if (filterType === "public") {
      return postcard.character?.visibility === "public";
    }
    
    return true;
  });

  if (filteredPostcards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-container-secondary flex items-center justify-center">
          <MessageCircle className="w-8 h-8 color-text-tertiary" />
        </div>
        <h3 className="text-lg font-medium color-text-primary mb-2">暂无明信片</h3>
        <p className="text-sm color-text-secondary">
          {searchQuery ? "没有找到匹配的明信片" : "还没有明信片，快去创建吧！"}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4">
      {filteredPostcards.map((postcard) => (
        <div
          key={postcard.id}
          className="glass-container-primary rounded-xl p-4 cursor-pointer card-hover"
          onClick={() => onPostcardClick?.(postcard)}
        >
          {/* 明信片头部 - 用户信息和角色 */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage src={postcard.user?.avatar_url} />
                <AvatarFallback>
                  {postcard.user?.nickname?.[0] || postcard.user?.username?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-sm font-medium color-text-primary">
                  {postcard.user?.nickname || postcard.user?.username}
                </div>
                <div className="text-xs color-text-secondary">
                  与 {postcard.character?.name} 的对话
                </div>
              </div>
            </div>
            <div className="text-xs color-text-tertiary">
              {new Date(postcard.created_at).toLocaleDateString('zh-CN')}
            </div>
          </div>

          {/* 明信片内容 */}
          <div className="mb-3">
            <p className="text-sm color-text-primary line-clamp-3">
              {postcard.content}
            </p>
          </div>

          {/* 明信片图片（如果有） */}
          {postcard.image_url && (
            <div className="mb-3">
              <img
                src={postcard.image_url}
                alt="明信片图片"
                className="w-full h-32 object-cover rounded-lg"
              />
            </div>
          )}

          {/* 明信片底部操作栏 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4 text-xs color-text-tertiary">
              <div className="flex items-center space-x-1">
                <Eye className="w-3 h-3" />
                <span>123</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-3 h-3" />
                <span>45</span>
              </div>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              className={`p-1 h-6 ${
                postcard.is_favorite ? "text-red-500" : "color-text-tertiary"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                onLikeClick?.(postcard);
              }}
            >
              <Heart 
                className={`w-3 h-3 ${postcard.is_favorite ? "fill-current" : ""}`} 
              />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
