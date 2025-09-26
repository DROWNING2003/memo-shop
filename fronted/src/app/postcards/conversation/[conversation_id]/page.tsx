"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Heart,
  MessageCircle,
  Eye,
  Share,
  Bookmark,
  Calendar,
  User,
  Sparkles,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthGuard } from "@/components/auth-guard";
import { apiClient } from "@/lib/api";
import type { Postcard } from "@/types/api";
import { Badge } from "@/components/ui/badge";
import { PostcardPreview } from "@/components/postcard/postcard-preview";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

export default function ConversationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conversation_id = params.conversation_id as string;

  const [conversation, setConversation] = React.useState<Postcard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isLiking, setIsLiking] = React.useState(false);
  const [currentPostcardIndex, setCurrentPostcardIndex] = React.useState(0);
  const [isSharing, setIsSharing] = React.useState(false);

  React.useEffect(() => {
    if (conversation_id) {
      loadConversation();
    }
  }, [conversation_id]);

  const loadConversation = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const conversationData = await apiClient.getConversation(conversation_id);
      setConversation(conversationData);
    } catch (error) {
      console.error('Failed to load conversation:', error);
      setError('加载对话失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleLike = async (postcard: Postcard) => {
    setIsLiking(true);
    try {
      // 这里需要实现点赞/取消点赞的逻辑
      // 暂时模拟点赞状态切换
      const updatedConversation = conversation.map(card => 
        card.id === postcard.id 
          ? { ...card, is_favorite: !card.is_favorite }
          : card
      );
      setConversation(updatedConversation);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async (postcard: Postcard) => {
    if (isSharing) {
      console.log('分享正在进行中，请稍候...');
      return;
    }

    setIsSharing(true);
    try {
      // 获取明信片预览元素
      const postcardElement = document.querySelector('.postcard-preview') as HTMLElement;
      if (!postcardElement) {
        console.error('明信片元素未找到');
        // 使用文本分享作为备用
        await shareText(postcard);
        return;
      }

      // 使用html2canvas截图
      const html2canvas = await import('html2canvas');
      const canvas = html2canvas.default;
      const canvasElement = await canvas(postcardElement, {
        backgroundColor: '#ffffff',
        scale: 2, // 提高清晰度
        useCORS: true,
        allowTaint: true
      });

      // 转换为blob
      canvasElement.toBlob(async (blob: Blob | null) => {
        if (!blob) {
          console.error('截图失败');
          await shareText(postcard);
          return;
        }

        // 创建分享数据
        const file = new File([blob], '明信片.png', { type: 'image/png' });
        
        try {
          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `${postcard.user?.nickname || postcard.user?.username || '用户'} 的明信片`,
              text: postcard.content,
              files: [file]
            });
          } else {
            // 备用方案：下载图片
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = '明信片.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }
        } catch (shareError) {
          console.error('分享失败:', shareError);
          // 在异步回调中不能直接调用分享，改为下载图片
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = '明信片.png';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
      }, 'image/png');
    } catch (error) {
      console.error('Failed to share:', error);
      await shareText(postcard);
    } finally {
      setIsSharing(false);
    }
  };

  const shareText = async (postcard: Postcard) => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${postcard.user?.nickname || postcard.user?.username || '用户'} 的明信片`,
          text: postcard.content,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert('链接已复制到剪贴板');
      }
    } catch (error) {
      console.error('文本分享失败:', error);
      // 如果分享被取消，不显示错误提示
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('用户取消了分享');
        return;
      }
      // 如果是权限问题，尝试复制到剪贴板
      if (error instanceof Error && error.name === 'NotAllowedError') {
        try {
          await navigator.clipboard.writeText(window.location.href);
          alert('链接已复制到剪贴板');
        } catch (clipboardError) {
          alert('分享失败，请稍后重试');
        }
      } else {
        alert('分享失败，请稍后重试');
      }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-page">
          <div className="p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

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
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (error) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              加载失败
            </h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <Button onClick={loadConversation}>重试</Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (conversation.length === 0) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              对话不存在
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              您访问的对话可能已被删除或不存在
            </p>
            <Button onClick={() => router.push('/home')}>返回首页</Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        {/* 顶部导航 */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
          <div className="flex items-center justify-between p-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>

            <h1 className="text-lg font-semibold text-foreground">
              明信片
            </h1>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => {
                const filteredPostcards = conversation.filter(card => card.type === 'user' || card.status === 'delivered');
                if (filteredPostcards.length > 0) {
                  const currentPostcard = filteredPostcards[currentPostcardIndex] || filteredPostcards[0];
                  handleShare(currentPostcard);
                }
              }}
              disabled={isSharing}
            >
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* 明信片内容 - 上下居中 */}
        <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-4">
          <div className="w-full max-w-md">
            {/* 明信片轮播 - 只显示状态为delivered的AI明信片 */}
            <Carousel 
              className="w-full"
            >
              <CarouselContent>
                {conversation
                  .filter(card => card.type === 'user' || card.status === 'delivered')
                  .map((card, index) => (
                    <CarouselItem key={card.id}>
                      <div className="p-1 flex justify-center">
                        <div className="postcard-preview">
                          <PostcardPreview postcard={card} />
                        </div>
                      </div>
                    </CarouselItem>
                  ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
