"use client";

import React from "react";
import { Plus, Sun, Mail, Users, User } from "lucide-react";
import { AuthGuard } from "@/components/auth-guard";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import type { Postcard } from "@/types/api";

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
      <div className="min-h-screen bg-page font-base" style={{ width: '390px', minHeight: '844px' }}>
        {/* 固定顶部导航 */}
        <div className="fixed top-0 w-full z-10 bg-white">
          <div style={{ height: 'env(safe-area-inset-top)' }}></div>
          <header className="flex justify-between items-center h-14 px-6">
            <div className="flex items-center">
              <span className="text-page-title color-text-primary">我的明信片</span>
            </div>
            <div className="flex items-center gap-3">
              <button className="bg-gray-100 flex justify-center items-center w-8 h-8 rounded-full">
                <Sun className="w-4 h-4 text-warning" />
              </button>
              <button 
                onClick={() => router.push("/postcards/create")}
                className="bg-primary-base flex justify-center items-center w-8 h-8 rounded-full"
              >
                <Plus className="w-4 h-4 text-white" />
              </button>
            </div>
          </header>
        </div>

        {/* 占位空间 */}
        <div>
          <div style={{ height: 'env(safe-area-inset-top)' }}></div>
          <div className="h-14"></div>
        </div>

        {/* 主要内容 */}
        <main className="pt-4 pb-4">
          {/* 欢迎卡片 */}
          <section className="mb-6 px-4">
            <div className="bg-container-primary rounded-large p-comfortable">
              <div className="flex justify-between items-center mb-3">
                <span className="text-body-small color-text-secondary font-medium">{todayDate}</span>
              </div>
              <h1 className="mb-2 text-page-title color-text-primary">今天想对谁说说心事？</h1>
              <p className="text-body color-text-secondary">如果记忆有声音，你会和谁说说今天发生了什么</p>
            </div>
          </section>

          {/* 近期记忆 */}
          <section className="mb-6 px-4">
            <h2 className="mb-4 text-card-title color-text-primary">近期记忆</h2>
            {loading ? (
              <div className="text-center py-8">
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                <p className="text-sm color-text-secondary">加载中...</p>
              </div>
            ) : groupedPostcards.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-container-secondary flex items-center justify-center">
                  <Mail className="w-8 h-8 color-text-tertiary" />
                </div>
                <h3 className="text-lg font-medium color-text-primary mb-2">暂无明信片</h3>
                <p className="text-sm color-text-secondary">还没有明信片，快去创建吧！</p>
                <button 
                  onClick={() => router.push("/postcards/create")}
                  className="mt-4 px-4 py-2 bg-primary-base text-white rounded-md text-sm"
                >
                  创建明信片
                </button>
              </div>
            ) : (
              <div>
                {groupedPostcards.map((group, groupIndex) => (
                  <div key={groupIndex} className="mb-6">
                    {/* 日期分隔线 */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-2 h-2 bg-primary-base rounded-full"></div>
                      <span className="text-body-small color-text-secondary font-medium">{group.date}</span>
                      <div className="flex-1 h-px bg-gray-200"></div>
                    </div>
                    
                    {/* 明信片卡片 */}
                    <div className="ml-5">
                      {group.postcards.map((postcard, index) => {
                        const mood = getMoodIcon(postcard.content);
                        const time = new Date(postcard.created_at).toLocaleTimeString('zh-CN', {
                          hour: '2-digit',
                          minute: '2-digit'
                        });
                        
                        return (
                          <div 
                            key={postcard.id} 
                            className={`bg-card-glass rounded-medium p-compact cursor-pointer hover:shadow-lg transition-all ${
                              index < group.postcards.length - 1 ? 'mb-3' : ''
                            }`}
                            onClick={() => router.push(`/postcards/conversation/${postcard.conversation_id}`)}
                          >
                            <div className="flex items-start gap-3">
                              {postcard.type === 'user' ? (
                                // 用户头像：如果用户头像为空则使用名字的第一个字当头像
                                postcard.user?.avatar_url ? (
                                  <img 
                                    className="w-8 h-8 object-cover rounded-full" 
                                    alt={`${postcard.user?.nickname || postcard.user?.username || '用户'}的头像`}
                                    src={postcard.user.avatar_url}
                                  />
                                ) : (
                                  <div className="w-8 h-8 rounded-full bg-primary-base flex items-center justify-center text-white text-sm font-medium">
                                    {(postcard.user?.nickname || postcard.user?.username || '用户').charAt(0)}
                                  </div>
                                )
                              ) : (
                                // AI头像：使用角色的头像
                                <img 
                                  className="w-8 h-8 object-cover rounded-full" 
                                  alt={`${postcard.character?.name || 'AI'}的头像`}
                                  src={postcard.character?.avatar_url || "https://static.paraflowcontent.com/public/resource/image/ad9d61cd-f350-4b2d-8d89-2f2e6916ea8e.jpeg"}
                                />
                              )}
                              <div className="flex-1">
                                <div className="flex justify-between items-center mb-1">
                                  <span className="text-body-small color-text-primary font-medium">
                                    {postcard.type === 'user' 
                                      ? postcard.user?.nickname || postcard.user?.username || '用户'
                                      : postcard.character?.name || 'AI角色'
                                    }
                                  </span>
                                  <span className="text-caption color-text-quaternary">{time}</span>
                                </div>
                                <p className="mb-2 text-body-small color-text-secondary line-clamp-2">
                                  {postcard.content}
                                </p>
                                <div className="flex items-center gap-2">
                                  <span className="text-body-small">{mood.icon}</span>
                                  <span className="text-caption color-text-quaternary">{mood.label}</span>
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
          </section>
        </main>

        {/* 占位空间 */}
        <div>
          <div className="h-18 mt-4"></div>
          <div style={{ height: 'env(safe-area-inset-bottom)' }}></div>
        </div>

        {/* 固定底部导航 */}
        <div className="fixed bottom-0 w-full z-10 flex flex-col">
          <div className="bg-white border-t border-gray-100">
            <nav className="flex justify-around pt-4 px-1 pb-4">
              <div className="flex flex-col flex-1 items-center gap-1">
                <div className="flex justify-center items-center w-6 h-6">
                  <Mail className="w-5 h-5 text-primary-base" />
                </div>
                <span className="text-caption text-primary-base">我的明信片</span>
              </div>
              <div 
                className="flex flex-col flex-1 items-center gap-1 cursor-pointer"
                onClick={() => router.push("/characters")}
              >
                <div className="flex justify-center items-center w-6 h-6">
                  <Users className="w-5 h-5 color-text-quaternary" />
                </div>
                <span className="text-caption color-text-quaternary">明信片广场</span>
              </div>
              <div 
                className="flex flex-col flex-1 items-center gap-1 cursor-pointer"
                onClick={() => router.push("/profile")}
              >
                <div className="flex justify-center items-center w-6 h-6">
                  <User className="w-5 h-5 color-text-quaternary" />
                </div>
                <span className="text-caption color-text-quaternary">个人中心</span>
              </div>
            </nav>
            <div style={{ height: 'env(safe-area-inset-bottom)' }}></div>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
