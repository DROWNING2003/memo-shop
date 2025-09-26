"use client";

import React from "react";
import { ArrowLeft, Plus, Trash2, Edit, Loader2, RefreshCw, User } from "lucide-react";
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
import type { Character } from "@/types/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function MyCharactersPage() {
  const router = useRouter();
  const [characters, setCharacters] = React.useState<Character[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [deleting, setDeleting] = React.useState<number | null>(null);

  React.useEffect(() => {
    loadCharacters();
  }, []);

  const loadCharacters = async () => {
    try {
      setLoading(true);
      const response = await apiClient.getMyCharacters({ 
        page: 1, 
        page_size: 100 // 获取所有角色
      });
      setCharacters(response.items);
    } catch (error) {
      console.error('Failed to load characters:', error);
      toast.error("加载角色失败");
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadCharacters();
      toast.success("数据已刷新");
    } catch (error) {
      toast.error("刷新失败");
    } finally {
      setRefreshing(false);
    }
  };

  const handleDelete = async (characterId: number) => {
    try {
      setDeleting(characterId);
      await apiClient.deleteCharacter(characterId);
      setCharacters(prev => prev.filter(char => char.id !== characterId));
      toast.success("角色删除成功");
    } catch (error) {
      console.error('Failed to delete character:', error);
      toast.error("删除失败");
    } finally {
      setDeleting(null);
    }
  };

  const handleEdit = (characterId: number) => {
    router.push(`/characters/${characterId}/edit`);
  };

  const handleCreate = () => {
    router.push("/characters/create");
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
      <div className="w-full max-w-sm mx-auto min-h-screen bg-page relative flex flex-col px-6">
        {/* 顶部导航栏 */}
        <nav className="w-full glass-container-primary rounded-xl p-4 mt-4 mb-6">
          <div className="flex items-center justify-between">
            <Button
              onClick={() => router.back()}
              variant="ghost"
              size="icon"
              className="w-8 h-8 rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold color-text-primary">我的角色</h1>
            <div className="flex items-center space-x-2">
              <Button
                onClick={handleRefresh}
                variant="ghost"
                size="icon"
                disabled={refreshing}
                className="w-8 h-8 rounded-lg"
              >
                <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button
                onClick={handleCreate}
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-lg"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </nav>

        <main className="flex-1 space-y-4 overflow-y-auto pb-4">
          {/* 统计信息 */}
          <div className="glass-container-primary rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold color-text-primary">角色管理</h3>
              <Badge variant="secondary" className="bg-background/50 backdrop-blur-sm">
                {characters.length} 个角色
              </Badge>
            </div>
            <p className="text-sm color-text-secondary">管理你创建的所有AI角色</p>
          </div>

          {/* 角色列表 */}
          {characters.length === 0 ? (
            <div className="glass-container-primary rounded-xl p-8 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-background/50 backdrop-blur-sm flex items-center justify-center">
                <User className="w-8 h-8 color-text-tertiary" />
              </div>
              <h3 className="text-lg font-medium color-text-primary mb-2">还没有角色</h3>
              <p className="text-sm color-text-secondary mb-4">
                创建你的第一个AI角色开始对话吧
              </p>
              <Button onClick={handleCreate} className="h-11 rounded-lg">
                <Plus className="w-4 h-4 mr-2" />
                创建角色
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {characters.map((character) => (
                <div key={character.id} className="glass-container-primary rounded-xl p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={character.avatar_url} />
                        <AvatarFallback>
                          <User className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium color-text-primary truncate">
                          {character.name}
                        </h3>
                        <p className="text-sm color-text-secondary line-clamp-2 mt-1">
                          {character.description}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                            {character.visibility === 'public' ? '公开' : '私有'}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                            {character.usage_count} 次使用
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-background/50 backdrop-blur-sm">
                            {new Date(character.created_at).toLocaleDateString('zh-CN')}
                          </Badge>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          onClick={() => handleEdit(character.id)}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                              disabled={deleting === character.id}
                            >
                              {deleting === character.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>删除角色</AlertDialogTitle>
                              <AlertDialogDescription>
                                确定要删除角色 "{character.name}" 吗？此操作不可撤销，将永久删除该角色及其所有相关数据。
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>取消</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(character.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                删除
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </main>

        {/* 底部导航 */}
        <div className="mt-4">
          <BottomNavigation />
        </div>
      </div>
    </AuthGuard>
  );
}
