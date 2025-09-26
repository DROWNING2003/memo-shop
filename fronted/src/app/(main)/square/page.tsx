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
      <div className="h-screen flex flex-col bg-gradient-to-br from-background to-muted/20">
        {/* 固定顶部区域 */}
        <div className="flex-none">
          {/* 顶部导航 */}
          <header className="backdrop-blur-md bg-background/80 border-b border-border/50">
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

          {/* 搜索和筛选 */}
          <div className="backdrop-blur-md bg-background/80 border-b border-border/50 p-4">
            <div className="w-full max-w-md mx-auto">
              <div className="space-y-4">
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
            </div>
          </div>
        </div>

        {/* 可滚动明信片区域 */}
        <div className="flex-1 min-h-0">
          <div className="h-full overflow-y-auto">
            <div className="flex items-center justify-center p-4 min-h-full">
              <div className="w-full max-w-md">
                {/* 明信片轮播 */}
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                      <p className="text-sm text-muted-foreground">加载中...</p>
                    </div>
                  </div>
                ) : postcards.length === 0 ? (
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
                  <Carousel className="w-full">
                    <CarouselContent>
                      {postcards.map((postcard, index) => (
                        <CarouselItem key={postcard.id}>
                          <div className="p-1 flex justify-center" data-postcard-id={postcard.id}>
                            <div 
                              className="cursor-pointer"
                              onClick={() => handlePostcardClick(postcard)}
                            >
                              <PostcardPreview postcard={postcard} />
                            </div>
                          </div>
                        </CarouselItem>
                      ))}
                    </CarouselContent>
                    <CarouselPrevious />
                    <CarouselNext />
                  </Carousel>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
