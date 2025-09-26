"use client";

import React from "react";
import { Heart, MessageCircle, Eye, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { apiClient } from "@/lib/api";
import { useInfiniteScroll } from "@/common/hooks/useInfiniteScroll";
import type { Postcard, PostcardListParams } from "@/types/api";

interface PostcardGridProps {
  searchQuery?: string;
  filterType?: "all" | "public" | "my";
  onPostcardClick?: (postcard: Postcard) => void;
  onLikeClick?: (postcard: Postcard) => void;
}

export function PostcardGrid({ 
  searchQuery = "", 
  filterType = "all",
  onPostcardClick,
  onLikeClick 
}: PostcardGridProps) {
  const [postcards, setPostcards] = React.useState<Postcard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadPostcards = React.useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }
      
      const params: PostcardListParams = {
        page: pageNum,
        page_size: 20,
        sort_by: 'created_at',
        sort_order: 'desc',
        status: 'sent' // 只显示已发送的明信片
      };

      // 根据筛选类型设置参数
      if (filterType === "public") {
        // 这里可以添加公开明信片的筛选逻辑
      }

      const response = await apiClient.getPostcards(params);
      
      if (pageNum === 1 || isRefresh) {
        setPostcards(response.items);
      } else {
        setPostcards(prev => [...prev, ...response.items]);
      }
      
      setHasMore(pageNum < response.total_pages);
      setPage(pageNum);
      setError(null);
    } catch (err) {
      console.error('Failed to load postcards:', err);
      setError('加载明信片失败，请稍后重试');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterType]);

  React.useEffect(() => {
    loadPostcards(1);
  }, [loadPostcards]);

  const handleRefresh = () => {
    loadPostcards(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadPostcards(page + 1);
    }
  };

  // 无限滚动
  const { loadMoreRef } = useInfiniteScroll({
    hasMore,
    loading,
    onLoadMore: handleLoadMore,
    threshold: 200
  });

  // 过滤明信片
  const filteredPostcards = React.useMemo(() => {
    if (!searchQuery.trim()) return postcards;
    
    return postcards.filter(postcard => {
      const query = searchQuery.toLowerCase();
      const matchesContent = postcard.content.toLowerCase().includes(query);
      const matchesCharacter = postcard.character?.name.toLowerCase().includes(query);
      return matchesContent || matchesCharacter;
    });
  }, [postcards, searchQuery]);

  if (loading && postcards.length === 0) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
        <p className="text-muted-foreground">加载明信片中...</p>
      </div>
    );
  }

  if (error && postcards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-container-secondary flex items-center justify-center">
          <MessageCircle className="w-8 h-8 color-text-tertiary" />
        </div>
        <h3 className="text-lg font-medium color-text-primary mb-2">加载失败</h3>
        <p className="text-sm color-text-secondary mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline" size="sm">
          重试
        </Button>
      </div>
    );
  }

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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium color-text-primary">
          {filterType === "my" ? "我的明信片" : "明信片列表"} ({filteredPostcards.length})
        </h2>
        <Button
          onClick={handleRefresh}
          variant="ghost"
          size="sm"
          disabled={refreshing}
          className="neumorphism"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {/* 明信片网格 */}
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

      {/* 加载更多 - 支持无限滚动和手动加载 */}
      {hasMore && !searchQuery && (
        <div className="text-center py-4">
          {/* 无限滚动触发器 */}
          <div ref={loadMoreRef} className="h-4" />
          
          {/* 手动加载按钮 */}
          <Button
            onClick={handleLoadMore}
            variant="outline"
            disabled={loading}
            className="neumorphism"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                加载中...
              </>
            ) : (
              '加载更多'
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
