"use client";

import React from "react";
import { Settings, Heart, User, Edit, LogOut, ChevronRight, Shield, Bell, Moon, Trash2, Loader2, RefreshCw, Mail, Users, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import BottomNavigation from "@/components/BottomNavigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthGuard } from "@/components/auth-guard";
import { apiClient } from "@/lib/api";
import type { User as UserType } from "@/types/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface UserStats {
  charactersCount: number;
  postcardsCount: number;
  favoritesCount: number;
}

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = React.useState<UserType | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [stats, setStats] = React.useState<UserStats>({
    charactersCount: 0,
    postcardsCount: 0,
    favoritesCount: 0
  });
  const [statsLoading, setStatsLoading] = React.useState(true);

  React.useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        loadUserProfile(),
        loadUserStats()
      ]);
    } catch (error) {
      console.error('Failed to load user data:', error);
      toast.error("加载用户数据失败");
    } finally {
      setLoading(false);
    }
  };

  const loadUserProfile = async () => {
    try {
      const userData = await apiClient.getUserProfile();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user profile:', error);
      throw error;
    }
  };

  const loadUserStats = async () => {
    try {
      setStatsLoading(true);
      const [charactersResponse, postcardsResponse, favoritesResponse] = await Promise.all([
        apiClient.getMyCharacters({ page: 1, page_size: 1 }),
        apiClient.getPostcards({ page: 1, page_size: 1 }),
        apiClient.getFavoriteCharacters({ page: 1, page_size: 1 })
      ]);

      setStats({
        charactersCount: charactersResponse.total,
        postcardsCount: postcardsResponse.total,
        favoritesCount: favoritesResponse.total
      });
    } catch (error) {
      console.error('Failed to load user stats:', error);
      // 如果获取统计数据失败，使用默认值
      setStats({
        charactersCount: 0,
        postcardsCount: 0,
        favoritesCount: 0
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadUserData();
      toast.success("数据已刷新");
    } catch (error) {
      toast.error("刷新失败");
    } finally {
      setRefreshing(false);
    }
  };

  const handleLogout = () => {
    apiClient.removeAuthToken();
    router.push('/login');
  };

  const menuItems = [
    { 
      icon: Edit, 
      label: "编辑资料", 
      href: "/profile/edit",
      description: "修改个人信息和头像"
    },
    { 
      icon: User, 
      label: "我的角色", 
      href: "/profile/characters", 
      count: stats.charactersCount,
      description: "管理你的AI角色"
    },
    { 
      icon: Heart, 
      label: "我的收藏", 
      href: "/profile/favorites", 
      count: stats.favoritesCount,
      description: "收藏的角色"
    },
    { 
      icon: Mail, 
      label: "我的明信片", 
      href: "/profile/postcards", 
      count: stats.postcardsCount,
      description: "管理你的明信片"
    },
    { 
      icon: Shield, 
      label: "账号安全", 
      href: "/profile/security",
      description: "密码和隐私设置"
    },
    { 
      icon: Bell, 
      label: "通知设置", 
      href: "/profile/notifications",
      description: "消息和提醒"
    }
  ];

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
      <div className="w-full max-w-sm mx-auto min-h-screen bg-page relative flex flex-col px-6">
        {/* 顶部导航栏 */}
        <nav className="w-full glass-container-primary rounded-xl p-4 mt-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="w-8"></div>
            <h1 className="text-lg font-semibold color-text-primary">个人中心</h1>
            <Button
              onClick={handleRefresh}
              variant="ghost"
              size="icon"
              disabled={refreshing}
              className="w-8 h-8 rounded-lg"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </nav>

        <main className="flex-1 space-y-4 overflow-y-auto pb-4">
          {/* 用户信息卡片 */}
          <div className="glass-container-primary rounded-xl p-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={user?.avatar_url} />
                  <AvatarFallback>
                    <User className="w-8 h-8" />
                  </AvatarFallback>
                </Avatar>
                <Badge className="absolute -bottom-1 -right-1 bg-green-500 text-xs rounded-full">
                  在线
                </Badge>
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-lg font-semibold color-text-primary truncate">
                  {user?.nickname || user?.username || "用户"}
                </h2>
                <p className="text-sm color-text-secondary mt-1 line-clamp-2">
                  {user?.signature || "热爱生活，享受当下的每一刻✨"}
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                    {user?.email}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                    {new Date(user?.created_at || '').toLocaleDateString('zh-CN')} 加入
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* 统计数据 */}
          <div className="glass-container-primary rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold color-text-primary">数据统计</h3>
              {statsLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {statsLoading ? "..." : stats.charactersCount}
                </div>
                <div className="text-sm color-text-secondary">我的角色</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {statsLoading ? "..." : stats.postcardsCount}
                </div>
                <div className="text-sm color-text-secondary">明信片</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {statsLoading ? "..." : stats.favoritesCount}
                </div>
                <div className="text-sm color-text-secondary">收藏</div>
              </div>
            </div>
          </div>

          {/* 功能菜单 */}
          <div className="glass-container-primary rounded-xl p-4">
            <div className="mb-4">
              <h3 className="text-lg font-semibold color-text-primary">功能菜单</h3>
              <p className="text-sm color-text-secondary">管理你的账户和内容</p>
            </div>
            <div className="space-y-2">
              {menuItems.map((item, index) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => router.push(item.href)}
                    className="w-full p-3 rounded-lg flex items-center space-x-3 hover:bg-background/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium color-text-primary">{item.label}</span>
                        {item.count !== undefined && (
                          <Badge variant="secondary" className="text-xs bg-background/50 backdrop-blur-sm">
                            {item.count}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm color-text-secondary">{item.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 color-text-tertiary" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* 设置选项 */}
          <div className="glass-container-primary rounded-xl p-4">
            <h3 className="text-lg font-semibold color-text-primary mb-4">设置</h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Moon className="w-5 h-5 color-text-primary" />
                <div>
                  <div className="font-medium color-text-primary">深色模式</div>
                  <div className="text-sm color-text-secondary">切换主题外观</div>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </div>

          {/* 退出登录 */}
          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-11 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
          >
            <LogOut className="w-4 h-4 mr-2" />
            退出登录
          </Button>
        </main>

        {/* 底部导航 */}
        <div className="mt-4">
          <BottomNavigation />
        </div>
      </div>
    </AuthGuard>
  );
}
