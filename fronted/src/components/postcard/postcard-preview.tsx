"use client";

import React from "react";
import { Share2, Play, Pause, Download, X, Palette, ZoomIn } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Postcard } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface PostcardPreviewProps {
  postcard: Postcard;
  className?: string;
}

// 全局音频实例和播放状态管理
let globalAudio: HTMLAudioElement | null = null;
let currentPlayingPostcardId: number | null = null;

// 渐变背景选项
const gradientOptions = [
  {
    name: "无背景",
    value: "none",
    gradient: "transparent"
  },
  {
    name: "蓝色渐变",
    value: "blue",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
  },
  {
    name: "粉色渐变",
    value: "pink", 
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)"
  },
  {
    name: "绿色渐变",
    value: "green",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)"
  },
  {
    name: "橙色渐变",
    value: "orange",
    gradient: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)"
  },
  {
    name: "紫色渐变",
    value: "purple",
    gradient: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)"
  }
];

export function PostcardPreview({ postcard, className }: PostcardPreviewProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [showSharePreview, setShowSharePreview] = React.useState(false);
  const [shareImageUrl, setShareImageUrl] = React.useState<string | null>(null);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [selectedGradient, setSelectedGradient] = React.useState("none");
  const [showGradientPicker, setShowGradientPicker] = React.useState(false);
  const [showImageZoom, setShowImageZoom] = React.useState(false);
  
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

  // 获取选中的渐变背景
  const getSelectedGradient = () => {
    return gradientOptions.find(opt => opt.value === selectedGradient) || gradientOptions[0];
  };

  // 处理分享按钮点击
  const handleShare = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsGenerating(true);
    setShowSharePreview(true);
    
    try {
      // 等待一小段时间确保DOM更新
      await new Promise(resolve => setTimeout(resolve, 100));
      
      await generateScreenshot();
    } catch (error) {
      console.error('生成分享图片失败:', error);
      setIsGenerating(false);
    }
  };

  // 生成截图
  const generateScreenshot = async () => {
    // 获取当前明信片元素 - 使用更精确的选择器
    // 首先尝试找到包含当前明信片ID的容器
    const postcardContainer = document.querySelector(`[data-postcard-id="${postcard.id}"]`) as HTMLElement;
    let postcardElement: HTMLElement | null = null;
    
    if (postcardContainer) {
      // 如果找到了包含data-postcard-id的容器，从中查找明信片元素
      postcardElement = postcardContainer.querySelector('.postcard-preview') as HTMLElement;
    }
    
    // 如果没找到，尝试直接查找当前明信片
    if (!postcardElement) {
      postcardElement = document.querySelector('.postcard-preview') as HTMLElement;
    }
    
    if (!postcardElement) {
      console.error('明信片元素未找到');
      return;
    }

    // 创建截图容器
    const screenshotContainer = document.createElement('div');
    screenshotContainer.className = 'relative';
    
    // 复制明信片内容
    const postcardClone = postcardElement.cloneNode(true) as HTMLElement;
    
    // 移除交互元素（按钮等）
    const buttons = postcardClone.querySelectorAll('button');
    buttons.forEach(button => button.remove());
    
    // 在底部信息栏的分享按钮位置添加logo（只在截图时显示）
    const bottomInfo = postcardClone.querySelector('.postcard-bottom-info') as HTMLElement;
    if (bottomInfo) {
      // 创建logo元素替代分享按钮
      const logoElement = document.createElement('div');
      logoElement.className = 'flex items-center';
      logoElement.innerHTML = `
          <span class="text-xs font-bold text-gray-800">回忆小卖部</span>
      `;
      
      // 找到分享按钮的位置并替换
      const shareButtonArea = bottomInfo.querySelector('.share-button-area');
      if (shareButtonArea) {
        shareButtonArea.innerHTML = '';
        shareButtonArea.appendChild(logoElement);
      }
    }
    
    // 设置容器样式
    const gradient = getSelectedGradient();
    if (gradient.value !== 'none') {
      screenshotContainer.style.padding = '20px';
      screenshotContainer.style.background = gradient.gradient;
      screenshotContainer.style.borderRadius = '12px';
    } else {
      screenshotContainer.style.padding = '0';
      screenshotContainer.style.background = 'transparent';
    }
    
    // 确保明信片保持正确的宽高比
    postcardClone.style.width = '375px'; // 固定宽度
    postcardClone.style.height = 'auto'; // 高度自适应
    postcardClone.style.minWidth = '375px'; // 最小宽度
    postcardClone.style.maxWidth = '375px'; // 最大宽度
    
    screenshotContainer.appendChild(postcardClone);
    
    // 添加到DOM进行截图（隐藏状态）
    screenshotContainer.style.position = 'fixed';
    screenshotContainer.style.left = '-9999px';
    screenshotContainer.style.top = '-9999px';
    screenshotContainer.style.width = 'fit-content'; // 自适应宽度
    screenshotContainer.style.height = 'auto'; // 自适应高度
    document.body.appendChild(screenshotContainer);

    // 使用html2canvas截图，保持正确的宽高比
    const html2canvas = await import('html2canvas');
    const canvas = html2canvas.default;
    const canvasElement = await canvas(screenshotContainer, {
      backgroundColor: gradient.value !== 'none' ? gradient.gradient.split(',')[0].split(' ')[1] : '#ffffff',
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: screenshotContainer.scrollWidth, // 使用实际宽度
      height: screenshotContainer.scrollHeight, // 使用实际高度
      windowWidth: screenshotContainer.scrollWidth, // 窗口宽度
      windowHeight: screenshotContainer.scrollHeight // 窗口高度
    });

    // 清理DOM
    document.body.removeChild(screenshotContainer);

    // 转换为blob URL
    canvasElement.toBlob((blob: Blob | null) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        // 释放之前的URL
        if (shareImageUrl) {
          URL.revokeObjectURL(shareImageUrl);
        }
        setShareImageUrl(url);
      }
      setIsGenerating(false);
    }, 'image/png');
  };

  // 处理下载确认
  const handleDownload = () => {
    if (shareImageUrl) {
      const gradient = getSelectedGradient();
      const backgroundText = gradient.value === 'none' ? '无背景' : gradient.name;
      const a = document.createElement('a');
      a.href = shareImageUrl;
      a.download = `回忆小卖部-明信片-${backgroundText}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  // 关闭预览
  const handleClosePreview = () => {
    setShowSharePreview(false);
    if (shareImageUrl) {
      URL.revokeObjectURL(shareImageUrl);
      setShareImageUrl(null);
    }
    setSelectedGradient("none"); // 重置为无背景
    setShowGradientPicker(false);
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

  // 渐变选项变化时重新生成截图
  React.useEffect(() => {
    if (showSharePreview) {
      // 如果已经有图片，重新生成；如果是第一次打开，等待初始生成完成
      if (shareImageUrl) {
        handleRegenerateScreenshot();
      }
    }
  }, [selectedGradient]);

  // 重新生成截图
  const handleRegenerateScreenshot = async () => {
    if (!showSharePreview) return;
    
    setIsGenerating(true);
    try {
      await generateScreenshot();
    } catch (error) {
      console.error('重新生成分享图片失败:', error);
      setIsGenerating(false);
    }
  };

  const content = postcard.content || "在这片宁静的湖畔，夕阳为群山镀上金边，美得令人屏息。大自然的鬼斧神工总能让人感叹不已。愿这份静谧的美景能带给你片刻的宁静与感动。";

  return (
    <>
      <div className={cn("postcard-preview", className)}>
        <div className="min-h-[281px] bg-white rounded-lg overflow-hidden transform transition-transform duration-300 flex flex-col self-center">
          {/* 明信片图片 */}
          <div className="flex-1 relative">
            <img 
              src={getImageUrl()}
              className="w-full h-[255px] object-cover cursor-pointer hover:opacity-90 transition-opacity" 
              alt="明信片预览"
              onClick={() => setShowImageZoom(true)}
              onError={(e) => {
                // 图片加载失败时使用默认图片
                e.currentTarget.src = "https://ai-public.mastergo.com/ai/img_res/1889d19af96c73c30914b226e9d00999.jpg";
              }}
            />
          </div>
          
          {/* 内容区域 */}
          <div className="text-black p-6">
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
            <div className="mt-4 flex justify-between items-center postcard-bottom-info">
              <div className="text-sm opacity-75">
                From: {getSenderName()}
              </div>
              <div className="flex space-x-2 share-button-area">
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

      {/* 分享预览弹窗 */}
      <Dialog open={showSharePreview} onOpenChange={handleClosePreview}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>分享预览</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowGradientPicker(!showGradientPicker)}
                className="flex items-center space-x-2"
              >
                <Palette className="w-4 h-4" />
                <span>背景颜色</span>
              </Button>
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* 渐变颜色选择器 */}
            {showGradientPicker && (
              <div className="grid grid-cols-3 gap-2 p-4 border rounded-lg">
                {gradientOptions.map((gradient) => (
                  <button
                    key={gradient.value}
                    onClick={() => setSelectedGradient(gradient.value)}
                    className={`relative h-16 rounded-lg border-2 transition-all ${
                      selectedGradient === gradient.value 
                        ? 'border-blue-500 ring-2 ring-blue-200' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    style={{ 
                      background: gradient.gradient === 'transparent' ? 
                        'repeating-conic-gradient(#f0f0f0 0% 25%, #ffffff 0% 50%) 50% / 20px 20px' : 
                        gradient.gradient
                    }}
                    title={gradient.name}
                  >
                    {gradient.value === 'none' && (
                      <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-lg">
                        <span className="text-xs font-medium text-gray-600">无背景</span>
                      </div>
                    )}
                    {selectedGradient === gradient.value && (
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {isGenerating ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
                  <p className="text-sm text-muted-foreground">正在生成分享图片...</p>
                </div>
              </div>
            ) : shareImageUrl ? (
              <div className="space-y-4">
                <div className="border rounded-lg overflow-hidden">
                  <img 
                    src={shareImageUrl} 
                    alt="分享预览" 
                    className="w-full h-auto"
                  />
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={handleDownload}
                    className="flex-1"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    保存图片
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleClosePreview}
                    className="flex-1"
                  >
                    关闭
                  </Button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">生成失败，请重试</p>
                <Button 
                  variant="outline" 
                  onClick={handleClosePreview}
                  className="mt-4"
                >
                  关闭
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* 图片放大弹窗 */}
      <Dialog open={showImageZoom} onOpenChange={setShowImageZoom}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 border-0 bg-transparent shadow-none">
          <div className="relative">
            <img 
              src={getImageUrl()}
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              alt="明信片大图"
              onError={(e) => {
                e.currentTarget.src = "https://ai-public.mastergo.com/ai/img_res/1889d19af96c73c30914b226e9d00999.jpg";
              }}
            />
            {/* 关闭按钮 */}
            <button 
              onClick={() => setShowImageZoom(false)}
              className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
