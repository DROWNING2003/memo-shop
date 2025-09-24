"use client";

import React from "react";
import { ArrowLeft, MessageCircle, Star, Eye, Volume2, Play, Pause, Edit, Share } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  
  // 获取登录状态
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  // 判断当前用户是否为创建者
  const isOwner = React.useMemo(() => {
    if (!isAuthenticated || !user || !character) return false;
    // 同时检查creator_id和creator字段
    return character.creator_id === user.id || character.creator?.id === user.id;
  }, [isAuthenticated, user, character]);

  // 加载角色数据
  React.useEffect(() => {
    const loadCharacter = async () => {
      try {
        const characterData = await apiClient.getCharacter(characterId);
        setCharacter(characterData);
      } catch (error) {
        console.error('Failed to load character:', error);
      } finally {
        setLoading(false);
      }
    };

    if (characterId) {
      loadCharacter();
    }
  }, [characterId]);

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

            {/* 开始对话按钮 */}
            <Button
              onClick={handleChatClick}
              className="w-full healing-gradient-green text-white"
              size="lg"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              开始对话
            </Button>
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
            <h3 className="text-sm font-medium color-text-primary mb-3">身份描述</h3>
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
      </div>
    </AuthGuard>
  );
}
