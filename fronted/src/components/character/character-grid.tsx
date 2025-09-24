"use client";

import React from "react";
import { CharacterCard } from "./character-card";
import { apiClient } from "@/lib/api";
import type { Character, CharacterListParams } from "@/types/api";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CharacterGridProps {
  searchQuery: string;
  filterType: "all" | "public" | "my";
}

export function CharacterGrid({ searchQuery, filterType }: CharacterGridProps) {
  const [characters, setCharacters] = React.useState<Character[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [page, setPage] = React.useState(1);
  const [hasMore, setHasMore] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const loadCharacters = React.useCallback(async (pageNum: number = 1, isRefresh: boolean = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else if (pageNum === 1) {
        setLoading(true);
      }
      
      const params: CharacterListParams = {
        page: pageNum,
        page_size: 20,
        sort_by: 'popularity_score',
        sort_order: 'desc'
      };

      // 根据筛选类型设置参数
      if (filterType === "public") {
        params.visibility = "public";
      }

      let response;
      if (filterType === "my") {
        response = await apiClient.getMyCharacters({ 
          page: pageNum, 
          page_size: 20 
        });
      } else {
        response = await apiClient.getCharacters(params);
      }
      
      if (pageNum === 1 || isRefresh) {
        setCharacters(response.items);
      } else {
        setCharacters(prev => [...prev, ...response.items]);
      }
      
      setHasMore(pageNum < response.total_pages);
      setPage(pageNum);
      setError(null);
    } catch (err) {
      console.error('Failed to load characters:', err);
      setError('加载角色失败，请稍后重试');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filterType]);

  React.useEffect(() => {
    loadCharacters(1);
  }, [loadCharacters]);

  const handleRefresh = () => {
    loadCharacters(1, true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loading) {
      loadCharacters(page + 1);
    }
  };

  const filteredCharacters = React.useMemo(() => {
    if (!searchQuery.trim()) return characters;
    
    return characters.filter(character =>
      character.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      character.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      character.user_role_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [characters, searchQuery]);

  if (loading && characters.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  if (error && characters.length === 0) {
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

  if (filteredCharacters.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full healing-gradient-purple flex items-center justify-center">
          <span className="text-2xl">🤖</span>
        </div>
        <p className="text-muted-foreground">
          {searchQuery ? "没有找到相关的角色" : "还没有角色呢"}
        </p>
        <p className="text-sm text-muted-foreground mt-1">
          {searchQuery ? "试试其他关键词吧" : "创建第一个角色开始对话吧"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-foreground">
          {filterType === "my" ? "我的角色" : "角色列表"} ({filteredCharacters.length})
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
      
      {/* 角色网格 */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
        {filteredCharacters.map((character) => (
          <CharacterCard 
            key={character.id} 
            character={character} 
            showEditButton={filterType === "my"}
          />
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
