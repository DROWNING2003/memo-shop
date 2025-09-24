"use client";

import React from "react";
import { Settings, Heart, User, Edit, LogOut, ChevronRight, Shield, Bell, Moon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import BottomNavigation from "@/components/BottomNavigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthGuard } from "@/components/auth-guard";
import { apiClient } from "@/lib/api";
import type { User as UserType } from "@/types/api";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = React.useState<UserType | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userData = await apiClient.getUserProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_info');
    router.push('/login');
  };

  // 统计数据（模拟数据）
  const stats = [
    { label: "我的角色", value: "12" },
    { label: "明信片", value: "45" },
    { label: "收藏", value: "89" }
  ];

  const menuItems = [
    { icon: User, label: "我的角色", href: "/profile/characters" },
    { icon: Heart, label: "我的收藏", href: "/profile/favorites" },
    { icon: Shield, label: "账号安全", href: "/profile/security" },
    { icon: Bell, label: "通知设置", href: "/profile/notifications" },
    { icon: Trash2, label: "清除缓存", href: "/profile/clear-cache" }
  ];

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen flex items-center justify-center bg-page">
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
        <nav className="fixed top-0 w-full z-50 glass-container-primary px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="w-8"></div>
            <h1 className="text-lg font-semibold color-text-primary">个人中心</h1>
            <button className="w-8 h-8 flex items-center justify-center">
              <Settings className="w-5 h-5 color-text-primary" />
            </button>
          </div>
        </nav>

        <main className="pt-[60px] pb-[80px] px-6">
          {/* 用户信息卡片 */}
          <div className="glass-container-primary rounded-xl p-4 mt-4 mb-4">
            <div className="flex items-center">
              <div className="relative w-[72px] h-[72px] rounded-full overflow-hidden">
                <Avatar className="w-full h-full">
                  <AvatarImage src={user?.avatar_url || "https://ai-public.mastergo.com/ai/img_res/1051cdfdd43bc5d96a0f5ad137f4ff0b.jpg"} />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="ml-4 flex-1">
                <h2 className="text-base font-medium color-text-primary">
                  {user?.nickname || user?.username || "陈梦琪"}
                </h2>
                <p className="text-sm color-text-secondary mt-1">
                  {user?.signature || "热爱生活，享受当下的每一刻✨"}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2 px-4 py-1 border border-primary text-primary rounded-md text-sm"
                  onClick={() => router.push('/profile/edit')}
                >
                  编辑资料
                </Button>
              </div>
            </div>
            {JSON.stringify(user)}
          </div>

          
          {/* 统计数据 */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {stats.map((stat, index) => (
              <div key={index} className="glass-container-primary rounded-lg p-4 text-center">
                <div className="text-xl font-medium text-primary">{stat.value}</div>
                <div className="text-sm color-text-secondary mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* 功能菜单 */}
          <div className="glass-container-primary rounded-xl mb-6">
            {menuItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <React.Fragment key={item.href}>
                  <button
                    onClick={() => router.push(item.href)}
                    className="w-full p-4 flex items-center space-x-4"
                  >
                    <Icon className="w-5 h-5 color-text-primary" />
                    <span className="color-text-primary flex-1 text-left">{item.label}</span>
                    <ChevronRight className="w-4 h-4 color-text-tertiary ml-auto" />
                  </button>
                  {index < menuItems.length - 1 && (
                    <div className="h-[1px] bg-border/50"></div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* 深色模式切换 */}
          <div className="glass-container-primary rounded-xl mb-6">
            <div className="p-4 flex items-center space-x-4">
              <Moon className="w-5 h-5 color-text-primary" />
              <span className="color-text-primary flex-1">深色模式</span>
              <ThemeToggle />
            </div>
          </div>

          {/* 退出登录 */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full glass-container-primary text-destructive hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            退出登录
          </Button>
        </main>

        {/* 底部导航 */}
        <BottomNavigation />
      </div>
    </AuthGuard>
  );
}
