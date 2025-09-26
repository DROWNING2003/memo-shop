"use client";

import React from "react";
import { ArrowLeft, Heart, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CharacterGrid } from "@/components/character/character-grid";
import BottomNavigation from "@/components/BottomNavigation";
import { AuthGuard } from "@/components/auth-guard";
import { useRouter } from "next/navigation";

export default function FavoritesPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const handleBack = () => {
    router.back();
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-page">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
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
        <nav className="fixed top-0 w-full z-50 glass-container-primary px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="icon"
              className="w-8 h-8"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold color-text-primary">我的收藏</h1>
            <div className="w-8"></div>
          </div>
        </nav>

        <main className="pt-[60px] pb-[80px] px-6">
          <Card className="glass-container-primary mb-6">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span>收藏的角色</span>
              </CardTitle>
              <CardDescription>
                你收藏的所有角色都在这里
              </CardDescription>
            </CardHeader>
          </Card>

          {/* 收藏的角色网格 */}
          <div className="px-0">
            <CharacterGrid 
              searchQuery="" 
              filterType="favorites"
            />
          </div>
        </main>

        {/* 底部导航 */}
        <BottomNavigation />
      </div>
    </AuthGuard>
  );
}
