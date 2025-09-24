"use client";

import React from "react";
import { Search, Plus, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { PostcardGrid } from "@/components/postcard/postcard-grid";
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

  React.useEffect(() => {
    loadPostcards();
  }, []);

  const loadPostcards = async () => {
    try {
      const response = await apiClient.getPostcards({
        page: 1,
        page_size: 20,
        status: 'sent' // 只显示已发送的明信片
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
    // 跳转到明信片详情页面
    router.push(`/postcards/${postcard.id}`);
  };

  const handleLikeClick = async (postcard: Postcard) => {
    try {
      await apiClient.updatePostcard(postcard.id, {
        is_favorite: !postcard.is_favorite
      });
      // 更新本地状态
      setPostcards(prev => prev.map(p => 
        p.id === postcard.id ? { ...p, is_favorite: !p.is_favorite } : p
      ));
    } catch (error) {
      console.error('Failed to update favorite status:', error);
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-page font-base pb-20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-page font-base pb-20">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-50 bg-container-primary">
          <div className="flex items-center justify-between p-standard">
            <div className="flex items-center space-x-compact">
              <div className="w-8 h-8 rounded-full bg-accent-mint-blue flex items-center justify-center">
                <Mail className="w-4 h-4 color-text-accent" />
              </div>
              <div>
                <h1 className="text-page-title color-text-primary">明信片广场</h1>
                <p className="text-body-small color-text-secondary">分享温暖，传递心意 ✨</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button
                onClick={handleCreatePostcard}
                size="icon"
                className="neumorphism card-hover"
                variant="ghost"
              >
                <Plus className="w-5 h-5 text-primary" />
              </Button>
            </div>
          </div>
        </header>
        <div className="px-standard mt-6">
            <div className="glass-container-primary rounded-xl p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-accent-mint-blue flex items-center justify-center">
                <Mail className="w-8 h-8 color-text-accent" />
              </div>
              <h3 className="text-lg font-medium color-text-primary mb-2">没有想要的角色？快来创建吧！</h3>
              <Button
                onClick={() => router.push("/characters/create")}
                className="bg-primary-base text-white"
              >
                来新建更多新角色
              </Button>
            </div>
          </div>
        {/* 搜索和筛选 */}
        <div className="p-standard space-y-standard">
          <div className="relative">
            <Search className="absolute left-compact top-1/2 transform -translate-y-1/2 w-4 h-4 color-text-tertiary" />
            <Input
              placeholder="搜索明信片内容或角色名称..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-container-secondary rounded-medium border-0 bg-transparent"
            />
          </div>

          {/* 筛选标签 */}
          <div className="flex space-x-compact">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("all")}
              className={filterType === "all" ? "bg-success text-white" : "bg-container-secondary"}
            >
              全部
            </Button>
            <Button
              variant={filterType === "public" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("public")}
              className={filterType === "public" ? "bg-info text-white" : "bg-container-secondary"}
            >
              公开明信片
            </Button>
            <Button
              variant={filterType === "my" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterType("my")}
              className={filterType === "my" ? "bg-accent-soft-coral text-white" : "bg-container-secondary"}
            >
              我的明信片
            </Button>
          </div>
        </div>

        {/* 明信片网格 */}
        <div className="px-standard">
          <PostcardGrid 
            postcards={postcards}
            searchQuery={searchQuery} 
            filterType={filterType}
            onPostcardClick={handlePostcardClick}
            onLikeClick={handleLikeClick}
          />
        </div>


          
 

        {/* 底部导航 */}
        <BottomNavigation />
      </div>
    </AuthGuard>
  );
}
