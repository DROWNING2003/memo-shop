"use client";

import React from "react";
import { Search, Plus, Users, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { CharacterGrid } from "@/components/character/character-grid";
import BottomNavigation from "@/components/BottomNavigation";
import { AuthGuard } from "@/components/auth-guard";
import { useRouter } from "next/navigation";

export default function CharactersPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [filterType, setFilterType] = React.useState<"all" | "public" | "my">("all");
  const [loading, setLoading] = React.useState(false);

  const handleCreateCharacter = () => {
    router.push("/characters/create");
  };

  const todayDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pb-20 flex items-center justify-center">
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
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pb-20">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-foreground">角色广场</h1>
                <p className="text-sm text-muted-foreground">发现有趣的角色，开始对话 ✨</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button
                onClick={handleCreateCharacter}
                size="icon"
                className="h-9 w-9 rounded-full"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4">
          {/* 欢迎卡片 */}
          <div className="mb-6 rounded-xl bg-background/50 border border-border/30 p-6">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-muted-foreground font-medium">{todayDate}</span>
            </div>
            <h1 className="mb-2 text-xl font-semibold text-foreground">探索精彩角色世界</h1>
            <p className="text-sm text-muted-foreground">与各种有趣的角色对话，发现不一样的视角和故事</p>
          </div>

          {/* 搜索和筛选 */}
          <div className="space-y-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索角色名称或描述..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-background/50 border-border/30 rounded-lg"
              />
            </div>

            {/* 筛选标签 */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
                className={`whitespace-nowrap rounded-full ${
                  filterType === "all" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-background/50 border-border/30"
                }`}
              >
                全部角色
              </Button>
              <Button
                variant={filterType === "public" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("public")}
                className={`whitespace-nowrap rounded-full ${
                  filterType === "public" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-background/50 border-border/30"
                }`}
              >
                公开角色
              </Button>
              <Button
                variant={filterType === "my" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("my")}
                className={`whitespace-nowrap rounded-full ${
                  filterType === "my" 
                    ? "bg-primary text-primary-foreground" 
                    : "bg-background/50 border-border/30"
                }`}
              >
                我的角色
              </Button>
            </div>
          </div>

          {/* 角色网格 */}
          <CharacterGrid 
            searchQuery={searchQuery} 
            filterType={filterType}
          />
        </div>
      </div>
    </AuthGuard>
  );
}