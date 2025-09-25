"use client";

import React from "react";
import { Share2, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Postcard } from "@/types/api";

interface PostcardPreviewProps {
  postcard: Postcard;
  className?: string;
}

// 全局音频实例和播放状态管理
let globalAudio: HTMLAudioElement | null = null;
let currentPlayingPostcardId: number | null = null;

export function PostcardPreview({ postcard, className }: PostcardPreviewProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
  };

  // 获取明信片图片URL，优先使用AI生成图片，然后是上传的图片
  const getImageUrl = () => {
    return postcard.ai_generated_image_url || postcard.image_url || "https://ai-public.mastergo.com/ai/img_res/1889d19af96c73c30914b226e9d00999.jpg";
  };

  // 获取发送者名称
  const getSenderName = () => {
    if (postcard.type === 'ai') {
      // AI生成的明信片，显示角色名称
      return postcard.character?.name || "AI助手";
    } else {
      // 用户发送的明信片，显示用户名称
      return postcard.user?.nickname || postcard.user?.username || "用户";
    }
  };
   // 获取接受者名称
  const getReceiverName = () => {
    if (postcard.type === 'user') {
      // AI生成的明信片，显示角色名称
      return postcard.character?.name || "AI助手";
    } else {
      // 用户发送的明信片，显示用户名称
      return postcard.user?.nickname || postcard.user?.username || "用户";
    }
  };

  // 处理分享按钮点击
  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    // 这里可以添加分享逻辑
    console.log("分享明信片:", postcard.id);
  };

  // 处理播放按钮点击
  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!postcard.voice_url) {
      console.log("明信片没有声音文件");
      return;
    }

    // 如果当前正在播放的是这个明信片，则暂停
    if (currentPlayingPostcardId === postcard.id && isPlaying) {
      if (globalAudio) {
        globalAudio.pause();
        setIsPlaying(false);
        console.log("暂停播放");
      }
      return;
    }

    // 如果正在播放其他明信片，先停止
    if (globalAudio && currentPlayingPostcardId !== postcard.id) {
      globalAudio.pause();
      // 通知其他组件停止播放
      const event = new CustomEvent('audioStopped', { detail: { postcardId: currentPlayingPostcardId } });
      window.dispatchEvent(event);
    }

    // 创建新的音频实例
    globalAudio = new Audio(postcard.voice_url);
    currentPlayingPostcardId = postcard.id;
    setIsPlaying(true);

    // 设置音频事件监听
    globalAudio.onended = () => {
      setIsPlaying(false);
      currentPlayingPostcardId = null;
      globalAudio = null;
    };

    globalAudio.onpause = () => {
      setIsPlaying(false);
    };

    globalAudio.onerror = (error) => {
      console.error("播放失败:", error);
      setIsPlaying(false);
      currentPlayingPostcardId = null;
      globalAudio = null;
    };

    // 播放音频
    globalAudio.play().catch(error => {
      console.error("播放失败:", error);
      setIsPlaying(false);
      currentPlayingPostcardId = null;
      globalAudio = null;
    });

    console.log("播放明信片声音:", postcard.voice_url);
  };

  // 监听其他组件的停止事件
  React.useEffect(() => {
    const handleAudioStopped = (event: CustomEvent) => {
      if (event.detail.postcardId !== postcard.id) {
        setIsPlaying(false);
      }
    };

    window.addEventListener('audioStopped', handleAudioStopped as EventListener);
    
    return () => {
      window.removeEventListener('audioStopped', handleAudioStopped as EventListener);
    };
  }, [postcard.id]);

  const content = postcard.content || "在这片宁静的湖畔，夕阳为群山镀上金边，美得令人屏息。大自然的鬼斧神工总能让人感叹不已。愿这份静谧的美景能带给你片刻的宁静与感动。";

  // 明信片形式
  return (
    <div className={cn("min-w-[375px] max-w-full p-4", className)}>
      <div className="min-h-[281px] bg-white rounded-lg overflow-hidden transform transition-transform duration-300 flex flex-col self-center">
        {/* 明信片图片 */}
        <div className="flex-1 relative">
          <img 
            src={getImageUrl()}
            className="w-full h-[255px] rounded-xl object-cover" 
            alt="明信片预览"
            onError={(e) => {
              // 图片加载失败时使用默认图片
              e.currentTarget.src = "https://ai-public.mastergo.com/ai/img_res/1889d19af96c73c30914b226e9d00999.jpg";
            }}
          />
        </div>
        
        {/* 内容区域 */}
        <div className=" to-transparent text-black p-6">
          {/* 日期 */}
          <p className="text-sm font-medium mb-2">
            {formatDate(postcard.created_at)}
          </p>
          
          {/* 问候语 */}
          <p className="text-lg mb-3">To {getReceiverName()}</p>
          
          {/* 明信片内容 */}
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {content}
          </p>
          
          {/* 底部信息栏 */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm opacity-75">
              From: {getSenderName()}
            </div>
            <div className="flex space-x-2">
              {/* 只有AI发送的明信片才显示播放按钮 */}
              {postcard.type === 'ai' && (
                <button 
                  onClick={handlePlay}
                  className="text-black opacity-75 hover:opacity-100 transition-opacity rounded-md p-1 hover:bg-gray-100"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
              )}
              <button 
                onClick={handleShare}
                className="text-black opacity-75 hover:opacity-100 transition-opacity rounded-md p-1 hover:bg-gray-100"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
