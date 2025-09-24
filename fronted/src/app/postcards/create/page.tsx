"use client";

import React from "react";
import { ArrowLeft, Send, Image, Sparkles, Search, Heart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AuthGuard } from "@/components/auth-guard";
import { useRouter, useSearchParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import type { Character } from "@/types/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CreatePostcardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const characterId = searchParams.get('character_id');
  
  const [content, setContent] = React.useState("");
  const [character, setCharacter] = React.useState<Character | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [characterLoading, setCharacterLoading] = React.useState(!!characterId);
  const [showCharacterDialog, setShowCharacterDialog] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [favoriteCharacters, setFavoriteCharacters] = React.useState<Character[]>([]);
  const [allCharacters, setAllCharacters] = React.useState<Character[]>([]);
  const [charactersLoading, setCharactersLoading] = React.useState(false);

  React.useEffect(() => {
    if (characterId) {
      loadCharacter(parseInt(characterId));
    }
  }, [characterId]);

  const loadCharacter = async (id: number) => {
    try {
      const characterData = await apiClient.getCharacter(id);
      setCharacter(characterData);
    } catch (error) {
      console.error('Failed to load character:', error);
    } finally {
      setCharacterLoading(false);
    }
  };

  const handleSend = async () => {
    if (!content.trim()) {
      return;
    }

    if (!character) {
      // 如果没有选择角色，跳转到角色选择页面
      router.push('/characters');
      return;
    }

    setLoading(true);
    try {
      await apiClient.createPostcard({
        character_id: character.id,
        content: content.trim(),
        type: 'user' // 用户发送的明信片类型为 'user'
      });
      
      // 发送成功，跳转回首页
      router.push('/home');
    } catch (error) {
      console.error('Failed to create postcard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSelectCharacter = () => {
    setShowCharacterDialog(true);
    loadCharacters();
  };

  const loadCharacters = async () => {
    setCharactersLoading(true);
    try {
      // 获取收藏的角色
      const favoriteResponse = await apiClient.getFavoriteCharacters({ page_size: 10 });
      setFavoriteCharacters(favoriteResponse.items);
      
      // 获取所有角色
      const allResponse = await apiClient.getCharacters({ page_size: 20 });
      setAllCharacters(allResponse.items);
    } catch (error) {
      console.error('Failed to load characters:', error);
    } finally {
      setCharactersLoading(false);
    }
  };

  const handleCharacterSelect = (selectedCharacter: Character) => {
    setCharacter(selectedCharacter);
    setShowCharacterDialog(false);
  };

  const filteredCharacters = allCharacters.filter(char => 
    char.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    char.user_role_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCloseDialog = () => {
    setShowCharacterDialog(false);
    setSearchQuery("");
  };

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
              className="neumorphism"
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            
            <h1 className="text-lg font-semibold text-foreground">写明信片</h1>
            
            <Button
              onClick={handleSend}
              disabled={loading || !content.trim() || !character}
              className="healing-gradient-green"
            >
              {loading ? "发送中..." : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  发送
                </>
              )}
            </Button>
          </div>
        </header>

        <div className="p-4 space-y-6">
          {/* 角色选择卡片 */}
          <div className="postcard rounded-2xl p-4">
            <h3 className="text-sm font-medium text-muted-foreground mb-3">选择聊天对象</h3>
            
            {characterLoading ? (
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-muted animate-pulse"></div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            ) : character ? (
              <div className="flex items-center space-x-3">
                <Avatar className="w-12 h-12 neumorphism">
                  <AvatarImage src={character.avatar_url} />
                  <AvatarFallback>
                    <Sparkles className="w-6 h-6" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{character.name}</h4>
                  <p className="text-sm text-muted-foreground">{character.user_role_name}</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectCharacter}
                  className="neumorphism"
                >
                  更换
                </Button>
              </div>
            ) : (
              <Button
                onClick={handleSelectCharacter}
                variant="outline"
                className="w-full neumorphism-inset"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                选择角色开始对话
              </Button>
            )}
          </div>

          {/* 明信片内容 */}
          <div className="postcard rounded-2xl p-6 healing-gradient-yellow">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">今天想说什么？</h3>
                <span className="text-xs text-muted-foreground">
                  {content.length}/500
                </span>
              </div>
              
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value.slice(0, 500))}
                placeholder="分享你的心情、想法或者今天发生的事情..."
                className="w-full h-40 p-4 rounded-xl bg-background/50 border-0 resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 text-foreground placeholder:text-muted-foreground"
              />
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="neumorphism"
                >
                  <Image className="w-4 h-4 mr-2" />
                  添加图片
                </Button>
              </div>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground">
              {character ? `${character.name} 正在等待你的消息 💌` : "选择一个角色开始你的治愈之旅 ✨"}
            </p>
          </div>
        </div>

        {/* 角色选择对话框 */}
        <Dialog open={showCharacterDialog} onOpenChange={handleCloseDialog}>
          <DialogContent className="max-w-[95vw] max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>选择角色</DialogTitle>
            </DialogHeader>
            
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="搜索角色名称或身份..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* 收藏角色区域 */}
            {favoriteCharacters.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Heart className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-medium text-foreground">收藏角色</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {favoriteCharacters.map((char) => (
                    <Button
                      key={char.id}
                      variant="outline"
                      className="h-auto p-3 flex flex-col items-center space-y-2 neumorphism"
                      onClick={() => handleCharacterSelect(char)}
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={char.avatar_url} />
                        <AvatarFallback>
                          <Sparkles className="w-6 h-6" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-center">
                        <div className="font-medium text-sm">{char.name}</div>
                        <div className="text-xs text-muted-foreground">{char.user_role_name}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* 所有角色区域 */}
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-foreground">所有角色</span>
                </div>
                {charactersLoading ? (
                  <div className="grid grid-cols-2 gap-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-20 bg-muted rounded-lg animate-pulse"></div>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredCharacters.map((char) => (
                      <Button
                        key={char.id}
                        variant="outline"
                        className="h-auto p-3 flex flex-col items-center space-y-2 neumorphism"
                        onClick={() => handleCharacterSelect(char)}
                      >
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={char.avatar_url} />
                          <AvatarFallback>
                            <Sparkles className="w-6 h-6" />
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-center">
                          <div className="font-medium text-sm">{char.name}</div>
                          <div className="text-xs text-muted-foreground">{char.user_role_name}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="flex space-x-3 pt-4 border-t">
              <Button
                variant="outline"
                onClick={handleCloseDialog}
                className="flex-1"
              >
                取消
              </Button>
              <Button
                onClick={() => router.push('/characters')}
                className="flex-1 healing-gradient-green"
              >
                查看更多角色
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AuthGuard>
  );
}
