"use client";

import React from "react";
import { ArrowLeft, MessageCircle, Star, Eye, Volume2, Play, Pause, Edit, Share, Trash2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { AuthGuard } from "@/components/auth-guard";
import { useRouter, useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import type { Character } from "@/types/api";
import { useSelector } from "react-redux";
import type { RootState } from "@/store";

export default function CharacterDetailPage() {
  const router = useRouter();
  const params = useParams();
  const characterId = parseInt(params.id as string);
  
  const [character, setCharacter] = React.useState<Character | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [audioRef] = React.useState(React.createRef<HTMLAudioElement>());
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [favoriteLoading, setFavoriteLoading] = React.useState(false);
  
  // 获取登录状态
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // 判断当前用户是否为创建者
  const isOwner = React.useMemo(() => {
    if (!isAuthenticated || !user || !character) return false;
    // 同时检查creator_id和creator字段
    return character.creator_id === user.id || character.creator?.id === user.id;
  }, [isAuthenticated, user, character]);

  // 加载角色数据和收藏状态
  React.useEffect(() => {
    const loadCharacterAndFavoriteStatus = async () => {
      try {
        const characterData = await apiClient.getCharacter(characterId);
        setCharacter(characterData);
        
        // 检查收藏状态
        if (isAuthenticated) {
          const favoriteStatus = await apiClient.checkCharacterFavorite(characterId);
          setIsFavorite(favoriteStatus.is_favorite);
        }
      } catch (error) {
        console.error('Failed to load character:', error);
      } finally {
        setLoading(false);
      }
    };

    if (characterId) {
      loadCharacterAndFavoriteStatus();
    }
  }, [characterId, isAuthenticated]);

  const handleBack = () => {
    router.back();
  };

  const handleChatClick = () => {
    router.push(`/postcards/create?character_id=${characterId}`);
  };

  const togglePlay = () => {
    if (!character?.voice_url) return;

    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play();
      setIsPlaying(true);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const handleEditClick = () => {
    router.push(`/characters/${characterId}/edit`);
  };

  const handleShareClick = async () => {
    const shareUrl = `${window.location.origin}/characters/${characterId}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: character?.name || '角色详情',
          text: character?.description || '快来和这个角色对话吧！',
          url: shareUrl,
        });
      } catch (error) {
        console.log('分享取消', error);
      }
    } else {
      // 备用方案：复制到剪贴板
      try {
        await navigator.clipboard.writeText(shareUrl);
        alert('链接已复制到剪贴板！');
      } catch (error) {
        console.error('复制失败', error);
        alert('复制失败，请手动复制链接');
      }
    }
  };

  const handleVoiceCallClick = () => {
    router.push(`/voicecall/${characterId}`);
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      alert('请先登录后再收藏角色');
      return;
    }

    setFavoriteLoading(true);
    try {
      const result = await apiClient.toggleCharacterFavorite(characterId);
      setIsFavorite(result.is_favorite);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      alert('操作失败，请重试');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handleDeleteClick = () => {
    if (!isOwner) {
      alert('只有创建者可以删除角色');
      return;
    }
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await apiClient.deleteCharacter(characterId);
      setDeleteDialogOpen(false);
      router.push('/characters');
    } catch (error) {
      console.error('Failed to delete character:', error);
      alert('删除失败，请重试');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
  };

  if (loading) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-page font-base flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">加载角色信息中...</p>
          </div>
        </div>
      </AuthGuard>
    );
  }

  if (!character) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-page font-base flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full healing-gradient-purple flex items-center justify-center">
              <span className="text-2xl">😔</span>
            </div>
            <p className="text-muted-foreground">角色不存在</p>
            <Button onClick={handleBack} className="mt-4">
              返回
            </Button>
          </div>
        </div>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-page font-base">
        {/* 顶部导航 */}
        <header className="sticky top-0 z-50 bg-container-primary">
          <div className="flex items-center justify-between p-standard">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBack}
              className="neumorphism"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <h1 className="text-page-title color-text-primary">角色详情</h1>
            
            <div className="flex items-center space-x-2">
              {/* 收藏按钮 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                disabled={favoriteLoading}
                className={`neumorphism ${isFavorite ? 'text-yellow-500' : ''}`}
              >
                {favoriteLoading ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                ) : (
                  <Star className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
                )}
              </Button>
              
              {/* 分享按钮 */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleShareClick}
                className="neumorphism"
              >
                <Share className="w-5 h-5" />
              </Button>
              
              {/* 编辑按钮 - 只显示给创建者 */}
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleEditClick}
                  className="neumorphism"
                >
                  <Edit className="w-5 h-5" />
                </Button>
              )}
              
              {/* 删除按钮 - 只显示给创建者 */}
              {isOwner && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteClick}
                  className="neumorphism text-red-500 hover:text-red-600"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
            </div>
          </div>
        </header>

        <div className="p-standard space-y-6">
          {/* 角色头像和信息 */}
          <div className="glass-container-primary rounded-xl p-6 text-center">
            <div className="relative mx-auto w-24 h-24 mb-4">
              <Avatar className="w-24 h-24 neumorphism">
                <AvatarImage src={character.avatar_url} />
                <AvatarFallback>
                  <span className="text-2xl">🤖</span>
                </AvatarFallback>
              </Avatar>
              {character.visibility === 'public' && (
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Eye className="w-3 h-3 text-primary-foreground" />
                </div>
              )}
            </div>

            <h2 className="text-xl font-bold color-text-primary mb-2">{character.name}</h2>
            <p className="text-sm color-text-secondary mb-4">{character.user_role_name}</p>

            {/* 统计信息 */}
            <div className="flex items-center justify-center space-x-6 text-sm color-text-secondary mb-4">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>{Math.round(character.popularity_score * 10) / 10}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{character.usage_count}</span>
              </div>
            </div>

            {/* 操作按钮组 */}
            <div className="flex space-x-3">
              {/* 开始对话按钮 */}
              <Button
                onClick={handleChatClick}
                className="flex-1 healing-gradient-green text-white"
                size="lg"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                开始对话
              </Button>
              
              {/* 电话按钮 */}
              <Button
                onClick={handleVoiceCallClick}
                className="flex-1 healing-gradient-blue text-white"
                size="lg"
              >
                <Phone className="w-4 h-4 mr-2" />
                打电话
              </Button>
            </div>
          </div>

          {/* 角色描述 */}
          <div className="glass-container-primary rounded-xl p-6">
            <h3 className="text-sm font-medium color-text-primary mb-3">角色描述</h3>
            <p className="text-sm color-text-secondary leading-relaxed">
              {character.description || "这个角色还没有详细的描述..."}
            </p>
          </div>

          {/* 身份描述 */}
          <div className="glass-container-primary rounded-xl p-6">
            <h3 className="text-sm font-medium color-text-primary mb-3">用户描述</h3>
            <p className="text-sm color-text-secondary leading-relaxed">
              {character.user_role_desc || "这个身份还没有详细的描述..."}
            </p>
          </div>

          {/* 音色预览 */}
          {character.voice_url && (
            <div className="glass-container-primary rounded-xl p-6">
              <h3 className="text-sm font-medium color-text-primary mb-3">音色预览</h3>
              <div className="flex items-center justify-between p-3 bg-container-secondary rounded-lg">
                <div className="flex items-center space-x-3">
                  <Volume2 className="w-6 h-6 text-primary" />
                  <div>
                    <p className="text-sm font-medium color-text-primary">角色音色</p>
                    <p className="text-xs color-text-secondary">点击播放试听</p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={togglePlay}
                  className="neumorphism"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3 h-3 mr-1" />
                      暂停
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 mr-1" />
                      播放
                    </>
                  )}
                </Button>
              </div>
              {/* 隐藏的音频元素 */}
              <audio
                ref={audioRef}
                src={character.voice_url}
                onEnded={handleAudioEnded}
                preload="metadata"
              />
            </div>
          )}

          {/* 创建者信息 */}
          {character.creator && (
            <div className="glass-container-primary rounded-xl p-6">
              <h3 className="text-sm font-medium color-text-primary mb-3">创建者</h3>
              <div className="flex items-center space-x-3">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={character.creator.avatar_url} />
                  <AvatarFallback>
                    {character.creator.nickname?.charAt(0) || character.creator.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium color-text-primary">
                    {character.creator.nickname || character.creator.username}
                  </p>
                  <p className="text-xs color-text-secondary">创建于 {new Date(character.created_at).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 删除确认对话框 */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除角色 &ldquo;{character?.name}&rdquo; 吗？此操作不可撤销，所有相关的对话记录也将被删除。
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={handleDeleteCancel}>取消</AlertDialogCancel>
              <AlertDialogAction 
                onClick={handleDeleteConfirm}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700"
              >
                {deleting ? (
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                ) : null}
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  );
}
