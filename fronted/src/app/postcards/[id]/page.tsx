"use client";

import React from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthGuard } from "@/components/auth-guard";
import { apiClient } from "@/lib/api";
import type { Postcard } from "@/types/api";
import { Badge } from "@/components/ui/badge";

export default function PostcardDetailPage() {
  const params = useParams();
  const router = useRouter();
  const conversation_id = params.conversation_id as string;

  const [postcard, setPostcard] = React.useState<Postcard | null>(null);
  const [conversation, setConversation] = React.useState<Postcard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [isLiking, setIsLiking] = React.useState(false);

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
      
      // 不设置特定的当前明信片，显示整个对话
      if (conversationData.length > 0) {
        setPostcard(null); // 清空当前明信片，显示整个对话
      }
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

  const handleLike = async () => {
    if (!postcard) return;

    setIsLiking(true);
    try {
      // 这里需要实现点赞/取消点赞的逻辑
      // 暂时模拟点赞状态切换
      setPostcard({
        ...postcard,
        is_favorite: !postcard.is_favorite,
      });
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleShare = async () => {
    if (!postcard) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `${postcard.user?.nickname || postcard.user?.username} 的明信片`,
          text: postcard.content,
          url: window.location.href,
        });
      } else {
        // 备用方案：复制链接到剪贴板
        await navigator.clipboard.writeText(window.location.href);
        alert('链接已复制到剪贴板');
      }
    } catch (error) {
      console.error('Failed to share:', error);
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

            <div className="rounded-2xl p-6 animate-pulse">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-muted"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded mb-2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                  </div>
                </div>
                <div className="h-32 bg-muted rounded-lg"></div>
              </div>
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

  if (!postcard) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">
              明信片不存在
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              您访问的明信片可能已被删除或不存在
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
              {conversation.length > 1 ? '对话详情' : '明信片详情'}
            </h1>

            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShare}
              >
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <div className="p-4 space-y-4">
          {/* 对话列表 */}
          {conversation.length > 1 ? (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground px-2">
                完整对话 ({conversation.length} 条消息)
              </h3>
              {conversation.map((card, index) => (
                <div
                  key={card.id}
                  className="rounded-2xl p-4 bg-background/50 border border-border/30"
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="w-8 h-8 flex-shrink-0">
                      <AvatarImage src={card.user?.avatar_url} />
                      <AvatarFallback>
                        <User className="w-4 h-4" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-foreground">
                          {card.user?.nickname || card.user?.username}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(card.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-foreground whitespace-pre-wrap">
                        {card.content}
                      </p>
                      {card.image_url && (
                        <img
                          src={card.image_url}
                          alt="明信片图片"
                          className="w-full h-24 object-cover rounded-lg mt-2"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // 单个明信片视图
            <div className="rounded-2xl p-6 bg-background/50 border border-border/30">
              {/* 用户信息 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={postcard.user?.avatar_url} />
                    <AvatarFallback>
                      <User className="w-6 h-6" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium text-foreground">
                      {postcard.user?.nickname || postcard.user?.username}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      发送给 {postcard.character?.name}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(postcard.created_at).toLocaleDateString('zh-CN')}
                    </span>
                  </div>
                  <Badge
                    variant={postcard.type === 'ai' ? 'secondary' : 'default'}
                    className="mt-1"
                  >
                    {postcard.type === 'ai' ? 'AI生成' : '用户发送'}
                  </Badge>
                </div>
              </div>

              {/* 角色信息 */}
              {postcard.character && (
                <div className="flex items-center space-x-3 p-3 bg-background/30 rounded-lg mb-4">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={postcard.character.avatar_url} />
                    <AvatarFallback>
                      <Sparkles className="w-5 h-5" />
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="font-medium text-sm">
                      {postcard.character.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {postcard.character.user_role_name}
                    </p>
                  </div>
                </div>
              )}

              {/* 明信片内容 */}
              <div className="mb-4">
                <div className="prose prose-sm max-w-none">
                  <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                    {postcard.content}
                  </p>
                </div>
              </div>

              {/* 明信片图片 */}
              {postcard.image_url && (
                <div className="mb-4">
                  <img
                    src={postcard.image_url}
                    alt="明信片图片"
                    className="w-full h-48 object-cover rounded-lg shadow-sm"
                  />
                </div>
              )}

              {/* 操作栏 */}
              <div className="flex items-center justify-between pt-4 border-t border-border/30">
                <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>123</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageCircle className="w-4 h-4" />
                    <span>45</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleLike}
                    disabled={isLiking}
                    className={`p-2 ${
                      postcard.is_favorite
                        ? 'text-red-500'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <Heart
                      className={`w-4 h-4 ${
                        postcard.is_favorite ? 'fill-current' : ''
                      }`}
                    />
                  </Button>

                  <Button variant="ghost" size="sm" className="p-2">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 底部操作按钮 */}
          <div className="flex space-x-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                router.push(
                  `/postcards/create?character_id=${postcard.character_id}`
                )
              }
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              回复此角色
            </Button>
            <Button
              className="flex-1"
              onClick={() => router.push('/postcards/create')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              写新明信片
            </Button>
          </div>
        </div>
      </div>
    </AuthGuard>
  );
}
