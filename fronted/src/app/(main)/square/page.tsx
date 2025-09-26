"use client";

import React from "react";
import { Search, Plus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { PostcardPreview } from "@/components/postcard/postcard-preview";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import BottomNavigation from "@/components/BottomNavigation";
import { AuthGuard } from "@/components/auth-guard";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import type { Postcard } from "@/types/api";

export default function PostcardsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterType, setFilterType] = React.useState<"all" | "public" | "my">("all");
  const [postcards, setPostcards] = React.useState<Postcard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [api, setApi] = React.useState<any>();

  // 加载明信片数据
  React.useEffect(() => {
    loadPostcards();
  }, [filterType, searchQuery]);

  const loadPostcards = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPostcards({
        page: 1,
        page_size: 20,
        sort_by: 'created_at',
        sort_order: 'desc',
        type: filterType === 'my' ? 'user' : 'all'
      });
      setPostcards(response.items);
    } catch (error) {
      console.error('Failed to load postcards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePostcard = () => {
    router.push("/postcards/create");
  };

  const handlePostcardClick = (postcard: Postcard) => {
    router.push(`/postcards/conversation/${postcard.conversation_id}`);
  };


  // 按日期分组明信片
  const groupPostcardsByDate = (postcards: Postcard[]) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const groups: { [key: string]: Postcard[] } = {};
    
    postcards.forEach(postcard => {
      const postcardDate = new Date(postcard.created_at);
      let dateKey = '';
      
      if (postcardDate.toDateString() === today.toDateString()) {
        dateKey = '今天';
      } else if (postcardDate.toDateString() === yesterday.toDateString()) {
        dateKey = '昨天';
      } else {
        dateKey = postcardDate.toLocaleDateString('zh-CN', {
          month: 'long',
          day: 'numeric'
        });
      }
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(postcard);
    });
    
    return Object.entries(groups).map(([date, postcards]) => ({
      date,
      postcards
    }));
  };

  const groupedPostcards = groupPostcardsByDate(postcards);

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        {/* 顶部导航 */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">明信片广场</h1>
                <p className="text-sm text-muted-foreground">分享温暖，传递心意</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button
                onClick={handleCreatePostcard}
                size="icon"
                className="h-9 w-9 rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4">
          {/* 搜索和筛选 */}
          <div className="mb-6 space-y-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="搜索明信片内容或角色名称..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10"
              />
            </div>

            {/* 筛选标签 */}
            <div className="flex space-x-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
                className="h-8 px-3 text-xs"
              >
                全部
              </Button>
              <Button
                variant={filterType === "public" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("public")}
                className="h-8 px-3 text-xs"
              >
                公开明信片
              </Button>
              <Button
                variant={filterType === "my" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("my")}
                className="h-8 px-3 text-xs"
              >
                我的明信片
              </Button>
            </div>
          </div>

          {/* 明信片内容 */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="rounded-2xl p-4 bg-background/50 border border-border/30 animate-pulse">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 rounded-full bg-muted"></div>
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between">
                        <div className="h-4 bg-muted rounded w-1/4"></div>
                        <div className="h-3 bg-muted rounded w-1/6"></div>
                      </div>
                      <div className="h-12 bg-muted rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : groupedPostcards.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <Mail className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium text-foreground mb-2">暂无明信片</h3>
                <p className="text-sm text-muted-foreground mb-4">还没有明信片，快去创建吧！</p>
                <Button 
                  onClick={handleCreatePostcard}
                  className="h-9 px-4"
                >
                  创建明信片
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {groupedPostcards.map((group, groupIndex) => (
                <div key={groupIndex} className="space-y-4">
                  {/* 明信片轮播 */}
                  <Carousel className="w-full">
                    <CarouselContent>
                      {group.postcards.map((postcard, index) => (
                        <CarouselItem key={postcard.id}>
                          <div className="p-1 flex justify-center">
                            <div 
                              className="cursor-pointer transform hover:scale-105 transition-transform duration-300"
                              onClick={() => handlePostcardClick(postcard)}
                            >
                              <PostcardPreview 
                                postcard={postcard} 
                                className="w-full"
                              />
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 底部导航 */}
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <BottomNavigation />
        </div>
      </div>
    </AuthGuard>
  );
}
