"use client";

import React from "react";
import { PostcardCard } from "./postcard-card";
import { apiClient } from "@/lib/api";
import type { Postcard, PostcardListParams } from "@/types/api";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PostcardListProps {
  searchQuery: string;
}

export function PostcardList({ searchQuery }: PostcardListProps) {
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
        sort_order: 'desc'
      };

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
  }, []);

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

  const filteredPostcards = React.useMemo(() => {
    if (!searchQuery.trim()) return postcards;
    
    return postcards.filter(postcard =>
      postcard.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      postcard.character?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [postcards, searchQuery]);

  if (loading && postcards.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (error && postcards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full healing-gradient-purple flex items-center justify-center">
          <span className="text-2xl">😔</span>
        </div>
        <p className="text-muted-foreground mb-4">{error}</p>
        <Button onClick={handleRefresh} variant="outline" className="neumorphism">
          <RefreshCw className="w-4 h-4 mr-2" />
          重试
        </Button>
      </div>
    );
  }

  if (filteredPostcards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full healing-gradient-purple flex items-center justify-center">
          <span className="text-2xl">📮</span>
        </div>
        <p className="text-muted-foreground">
          {searchQuery ? "没有找到相关的明信片" : "还没有写过明信片呢"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {searchQuery ? "试试其他关键词吧" : "点击上方按钮开始记录你的心情吧"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground">
          我的明信片 ({filteredPostcards.length})
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
      
      <div className="space-y-3">
        {filteredPostcards.map((postcard) => (
          <PostcardCard key={postcard.id} postcard={postcard} />
        ))}
      </div>

      {/* 加载更多 */}
      {hasMore && !searchQuery && (
        <div className="text-center py-4">
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