"use client";

import React from "react";
import { ArrowLeft, Save, Upload, Sparkles, Volume2, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { AuthGuard } from "@/components/auth-guard";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import type { CharacterCreateRequest } from "@/types/api";

export default function CreateCharacterPage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const [audioUploading, setAudioUploading] = React.useState(false);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [dialogTitle, setDialogTitle] = React.useState("");
  const [dialogDescription, setDialogDescription] = React.useState("");
  const [voiceUrl, setVoiceUrl] = React.useState("");
  const [voiceId, setVoiceId] = React.useState("");
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [audioRef] = React.useState(React.createRef<HTMLAudioElement>());
  
  const [formData, setFormData] = React.useState<CharacterCreateRequest>({
    name: "",
    description: "",
    user_role_name: "",
    user_role_desc: "",
    avatar_url: "",
    visibility: "public"
  });

  const handleInputChange = (field: keyof CharacterCreateRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const showDialog = (title: string, description: string) => {
    setDialogTitle(title);
    setDialogDescription(description);
    setDialogOpen(true);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('开始上传头像文件:', file.name, file.size);
    setUploading(true);
    try {
      const response = await apiClient.uploadCharacterAvatar(file);
      console.log('头像上传成功:', response);
      setFormData(prev => ({
        ...prev,
        avatar_url: response.url
      }));
    } catch (error) {
      console.error('头像上传失败:', error);
      showDialog('上传失败', '头像上传失败，请重试');
    } finally {
      setUploading(false);
    }
  };

  const handleVoiceUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('开始上传音色文件:', file.name, file.size);
    setAudioUploading(true);
    try {
      const response = await apiClient.uploadAudio(file);
      console.log('音色上传成功:', response);
      setVoiceUrl(response.url);
      showDialog('上传成功', '音色上传成功！');
    } catch (error) {
      console.error('音色上传失败:', error);
      showDialog('上传失败', '音色上传失败，请重试');
    } finally {
      setAudioUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.user_role_name) {
      showDialog('信息不完整', '请填写角色名称和角色身份');
      return;
    }

    setLoading(true);
    try {
      // 将音色URL和音色ID添加到表单数据中
      const submitData = {
        ...formData,
        voice_url: voiceUrl || undefined,
        voice_id: voiceId || undefined
      };
      
      await apiClient.createCharacter(submitData);
      showDialog('创建成功', '角色创建成功！');
      setTimeout(() => {
        router.push('/characters');
      }, 1500);
    } catch (error) {
      console.error('Failed to create character:', error);
      showDialog('创建失败', '创建角色失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止默认行为
    e.stopPropagation(); // 阻止事件冒泡
    
    if (!voiceUrl) return;

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

  const handleRemoveVoice = (e: React.MouseEvent) => {
    e.preventDefault(); // 阻止默认行为
    e.stopPropagation(); // 阻止事件冒泡
    setVoiceUrl("");
    setIsPlaying(false);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-page font-base pb-20">
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
            
            <h1 className="text-page-title color-text-primary">创建角色</h1>
            
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="healing-gradient-green"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent mr-2"></div>
                  创建中...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  创建角色
                </>
              )}
            </Button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="p-standard space-y-6">
          {/* 头像上传 */}
          <div className="glass-container-primary rounded-xl p-6">
            <Label className="text-sm font-medium color-text-primary mb-4 block">角色头像</Label>
            <div className="flex items-center space-x-4">
              <Avatar className="w-20 h-20">
                <AvatarImage 
                  src={formData.avatar_url} 
                  onError={(e) => {
                    console.error('头像加载失败:', formData.avatar_url);
                    console.error('错误详情:', e);
                  }}
                  onLoad={() => console.log('头像加载成功:', formData.avatar_url)}
                />
                <AvatarFallback>
                  <Sparkles className="w-10 h-10" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center space-x-2 px-4 py-2 border border-dashed border-primary rounded-md hover:bg-primary/5 transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm color-text-primary">
                      {uploading ? '上传中...' : '上传头像'}
                    </span>
                  </div>
                </Label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <p className="text-xs color-text-secondary mt-2">支持 JPG、PNG 格式，建议尺寸 200x200px</p>
              </div>
            </div>
          </div>

          {/* 基本信息 */}
          <div className="glass-container-primary rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-medium color-text-primary">基本信息</h3>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="text-sm color-text-primary">
                角色名称 *
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="请输入角色名称"
                className="bg-container-secondary border-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="text-sm color-text-primary">
                角色描述
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="描述这个角色的性格、背景故事等"
                className="bg-container-secondary border-0 min-h-[100px]"
                rows={3}
              />
            </div>
          </div>

          {/* 角色身份 */}
          <div className="glass-container-primary rounded-xl p-6 space-y-4">
            <h3 className="text-sm font-medium color-text-primary">角色身份</h3>
            
            <div className="space-y-2">
              <Label htmlFor="user_role_name" className="text-sm color-text-primary">
                角色身份名称 *
              </Label>
              <Input
                id="user_role_name"
                value={formData.user_role_name}
                onChange={(e) => handleInputChange('user_role_name', e.target.value)}
                placeholder="例如：知心姐姐、阳光少年"
                className="bg-container-secondary border-0"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="user_role_desc" className="text-sm color-text-primary">
                身份描述
              </Label>
              <Textarea
                id="user_role_desc"
                value={formData.user_role_desc}
                onChange={(e) => handleInputChange('user_role_desc', e.target.value)}
                placeholder="描述这个身份的特点和能力"
                className="bg-container-secondary border-0 min-h-[80px]"
                rows={2}
              />
            </div>
          </div>

          {/* 音色上传 */}
          <div className="glass-container-primary rounded-xl p-6">
            <Label className="text-sm font-medium color-text-primary mb-4 block">角色音色</Label>
            <div className="space-y-4">
              {/* 音色ID输入 */}
              <div className="space-y-2">
                <Label htmlFor="voice-id" className="text-sm color-text-primary">
                  音色ID（可选）
                </Label>
                <Input
                  id="voice-id"
                  value={voiceId}
                  onChange={(e) => setVoiceId(e.target.value)}
                  placeholder="输入AI音色ID，用于生成声音"
                  className="bg-container-secondary border-0"
                />
                <p className="text-xs color-text-secondary">用于AI生成声音的音色标识符</p>
              </div>

              {voiceUrl ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-container-secondary rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Volume2 className="w-6 h-6 text-primary" />
                      <div>
                        <p className="text-sm font-medium color-text-primary">音色已上传</p>
                        <p className="text-xs color-text-secondary truncate max-w-[100px]">{voiceUrl}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => togglePlay(e)}
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => handleRemoveVoice(e)}
                        className="neumorphism"
                      >
                        移除
                      </Button>
                    </div>
                  </div>
                  {/* 隐藏的音频元素 */}
                  <audio
                    ref={audioRef}
                    src={voiceUrl}
                    onEnded={handleAudioEnded}
                    preload="metadata"
                  />
                </div>
              ) : (
                <div>
                  <Label htmlFor="voice-upload" className="cursor-pointer">
                    <div className="flex items-center space-x-2 px-4 py-3 border border-dashed border-primary rounded-md hover:bg-primary/5 transition-colors">
                      <Volume2 className="w-4 h-4" />
                      <span className="text-sm color-text-primary">
                        {audioUploading ? '上传中...' : '上传音色文件'}
                      </span>
                    </div>
                  </Label>
                  <input
                    id="voice-upload"
                    type="file"
                    accept="audio/*"
                    onChange={handleVoiceUpload}
                    className="hidden"
                    disabled={audioUploading}
                  />
                  <p className="text-xs color-text-secondary mt-2">支持 MP3、WAV 等音频格式，用于角色的语音交互</p>
                </div>
              )}
            </div>
          </div>

          {/* 可见性设置 */}
          <div className="glass-container-primary rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium color-text-primary block mb-1">
                  公开角色
                </Label>
                <p className="text-xs color-text-secondary">
                  {formData.visibility === 'public' 
                    ? '其他用户可以看到并使用这个角色' 
                    : '只有你自己可以使用这个角色'}
                </p>
              </div>
              <Select
                value={formData.visibility}
                onValueChange={(value: 'public' | 'private') => handleInputChange('visibility', value)}
              >
                <SelectTrigger className="w-[120px] bg-container-secondary border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="public">公开</SelectItem>
                  <SelectItem value="private">私有</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* 提示信息 */}
          <div className="text-center">
            <p className="text-xs color-text-tertiary">
              创建角色后，你可以使用这个角色来创建明信片和进行对话 ✨
            </p>
          </div>
        </form>

        {/* 底部导航 */}
        <div className="fixed bottom-0 w-full bg-white border-t border-gray-100">
          <div style={{ height: 'env(safe-area-inset-bottom)' }}></div>
        </div>

        {/* Alert Dialog */}
        <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <AlertDialogContent className="max-w-[90vw] mx-auto">
            <AlertDialogHeader>
              <AlertDialogTitle>{dialogTitle}</AlertDialogTitle>
              <AlertDialogDescription>
                {dialogDescription}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex justify-end">
              <AlertDialogAction onClick={() => setDialogOpen(false)}>
                确定
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AuthGuard>
  );
}
