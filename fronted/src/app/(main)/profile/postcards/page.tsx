"use client";

import React from "react";
import { ArrowLeft, Plus, Trash2, Eye, Loader2, RefreshCw, Mail, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import BottomNavigation from "@/components/BottomNavigation";
import { AuthGuard } from "@/components/auth-guard";
import { apiClient } from "@/lib/api";
import type { Postcard } from "@/types/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function MyPostcardsPage() {
  const router = useRouter();
  const [postcards, setPostcards] = React.useState<Postcard[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [deleting, setDeleting] = React.useState<number | null>(null);

  React.useEffect(() => {
    loadPostcards();
  }, []);

  const loadPostcards = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getPostcards({ 
        page: 1, 
        page_size: 100, // 获取所有明信片
        sort_by: 'created_at',
        sort_order: 'desc'
      });
      setPostcards(response.items);
    } catch (error) {
      console.error('Failed to load postcards:', error);
      toast.error("加载明信片失败");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadPostcards();
      toast.success("数据已刷新");
    } catch (error) {
      toast.error("刷新失败");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async (postcardId: number) => {
    try {
      setDeleting(postcardId);
      await apiClient.deletePostcard(postcardId);
      setPostcards(prev => prev.filter(postcard => postcard.id !== postcardId));
      toast.success("明信片删除成功");
    } catch (error) {
      console.error('Failed to delete postcard:', error);
      toast.error("删除失败");
    } finally {
      setDeleting(null);
    }
  };

  const handleView = (postcard: Postcard) => {
    if (postcard.conversation_id) {
      router.push(`/postcards/conversation/${postcard.conversation_id}`);
    }
  };

  const handleCreate = () => {
    router.push("/postcards/create");
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
              onClick={() => router.back()}
              variant="ghost"
              size="icon"
              className="w-8 h-8"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold color-text-primary">我的明信片</h1>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="icon"
                disabled={refreshing}
                className="w-8 h-8"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={handleCreate}
                variant="ghost"
                size="icon"
                className="w-8 h-8"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </nav>

        <main className="pt-[60px] pb-[80px] px-6 space-y-4">
          {/* 统计信息 */}
          <Card className="glass-container-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>明信片管理</span>
                <Badge variant="secondary">{postcards.length} 张明信片</Badge>
              </CardTitle>
              <CardDescription>
                管理你创建的所有明信片
              </CardDescription>
            </CardHeader>
          </Card>

          {/* 明信片列表 */}
          {postcards.length === 0 ? (
            <Card className="glass-container-primary">
              <CardContent className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-container-secondary flex items-center justify-center">
                  <Mail className="w-8 h-8 color-text-tertiary" />
                </div>
                <h3 className="text-lg font-medium color-text-primary mb-2">还没有明信片</h3>
                <p className="text-sm color-text-secondary mb-4">
                  创建你的第一张明信片开始分享吧
                </p>
                <Button onClick={handleCreate} className="mt-2">
                  <Plus className="w-4 h-4 mr-2" />
                  创建明信片
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {postcards.map((postcard) => (
                <Card key={postcard.id} className="glass-container-primary">
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-4">
                      {/* 明信片图片 */}
                      {postcard.image_url && (
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-container-secondary flex-shrink-0">
                          <img
                            src={postcard.image_url}
                            alt="明信片"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-medium color-text-primary truncate">
                            与 {postcard.character?.name} 的对话
                          </h3>
                          {postcard.is_favorite && (
                            <Heart className="w-4 h-4 text-red-500 fill-current" />
                          )}
                        </div>
                        
                        <p className="text-sm color-text-secondary line-clamp-2 mb-2">
                          {postcard.content}
                        </p>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="text-xs">
                            {postcard.status === 'sent' ? '已发送' : 
                             postcard.status === 'draft' ? '草稿' : 
                             postcard.status === 'delivered' ? '已送达' : '已读'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {postcard.type === 'user' ? '用户' : 'AI'} 生成
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {new Date(postcard.created_at).toLocaleDateString('zh-CN')}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleView(postcard)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                              disabled={deleting === postcard.id}
                            >
                              {deleting === postcard.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>删除明信片</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除这张明信片吗？此操作不可撤销，将永久删除该明信片及其所有相关数据。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(postcard.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>

        {/* 底部导航 */}
        <BottomNavigation />
      </div>
    </AuthGuard>
  );
}
