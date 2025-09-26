"use client";

import React from "react";
import { Plus, Sun, Mail, Users, User } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import type { Postcard } from "@/types/api";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import BottomNavigation from "@/components/BottomNavigation";

export default function HomePage() {
  const router = useRouter();
  const [recentPostcards, setRecentPostcards] = React.useState<Postcard[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadRecentPostcards();
  }, []);

  const loadRecentPostcards = async () => {
    try {
      const response = await apiClient.getPostcards({
        page: 1,
        page_size: 10,
        sort_by: 'created_at',
        sort_order: 'desc',
        type: 'user' // 获取所有类型的明信片
      });
      setRecentPostcards(response.items);
    } catch (error) {
      console.error('Failed to load recent postcards:', error);
    } finally {
      setLoading(false);
    }
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

  const todayDate = new Date().toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long'
  });

  const groupedPostcards = groupPostcardsByDate(recentPostcards);

  const getMoodIcon = (content: string) => {
    if (content.includes('开心') || content.includes('高兴') || content.includes('快乐')) {
      return { icon: '☀️', label: '开心', color: 'text-warning' };
    }
    if (content.includes('困惑') || content.includes('迷茫') || content.includes('疑问')) {
      return { icon: '☁️', label: '困惑', color: 'text-info' };
    }
    if (content.includes('温暖') || content.includes('感动') || content.includes('感谢')) {
      return { icon: '❤️', label: '温暖', color: 'text-error' };
    }
    if (content.includes('悲伤') || content.includes('难过') || content.includes('失落')) {
      return { icon: '🌧️', label: '悲伤', color: 'text-info' };
    }
    return { icon: '✨', label: '日常', color: 'text-primary' };
  };

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
                <h1 className="text-lg font-semibold text-foreground">我的明信片</h1>
                <p className="text-sm text-muted-foreground">记录美好时光</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <ThemeToggle />
              <Button
                onClick={() => router.push("/postcards/create")}
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
            <h1 className="mb-2 text-xl font-semibold text-foreground">今天想对谁说说心事？</h1>
            <p className="text-sm text-muted-foreground">如果记忆有声音，你会和谁说说今天发生了什么</p>
          </div>

          {/* 明信片列表 */}
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
                  onClick={() => router.push("/postcards/create")}
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
                  {/* 日期标题 */}
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <span className="text-sm font-medium text-muted-foreground">{group.date}</span>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>
                  
                  {/* 明信片列表 */}
                  <div className="space-y-3">
                    {group.postcards.map((postcard, index) => {
                      const mood = getMoodIcon(postcard.content);
                      const time = new Date(postcard.created_at).toLocaleTimeString('zh-CN', {
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                      
                      return (
                        <div 
                          key={postcard.id} 
                          className="rounded-xl p-4 bg-background/50 border border-border/30 cursor-pointer hover:shadow-lg transition-all"
                          onClick={() => router.push(`/postcards/conversation/${postcard.conversation_id}`)}
                        >
                          <div className="flex items-start gap-3">
                            {postcard.type === 'user' ? (
                              postcard.user?.avatar_url ? (
                                <img 
                                  className="w-8 h-8 object-cover rounded-full" 
                                  alt={`${postcard.user?.nickname || postcard.user?.username || '用户'}的头像`}
                                  src={postcard.user.avatar_url}
                                />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-sm font-medium">
                                  {(postcard.user?.nickname || postcard.user?.username || '用户').charAt(0)}
                                </div>
                              )
                            ) : (
                              <img 
                                className="w-8 h-8 object-cover rounded-full" 
                                alt={`${postcard.character?.name || 'AI'}的头像`}
                                src={postcard.character?.avatar_url || "https://static.paraflowcontent.com/public/resource/image/ad9d61cd-f350-4b2d-8d89-2f2e6916ea8e.jpeg"}
                              />
                            )}
                            <div className="flex-1">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-foreground">
                                  {postcard.type === 'user' 
                                    ? postcard.user?.nickname || postcard.user?.username || '用户'
                                    : postcard.character?.name || 'AI角色'
                                  }
                                </span>
                                <span className="text-xs text-muted-foreground">{time}</span>
                              </div>
                              <p className="mb-2 text-sm text-muted-foreground line-clamp-2">
                                {postcard.content}
                              </p>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{mood.icon}</span>
                                <span className="text-xs text-muted-foreground">{mood.label}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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
