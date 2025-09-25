"use client";

import dynamic from "next/dynamic";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import AuthInitializer from "@/components/authInitializer";
import { useAppSelector, EMobileActiveTab, useIsCompactLayout } from "@/common";
import Header from "@/components/Layout/Header";
import Action from "@/components/Layout/Action";
import { cn } from "@/lib/utils";
import Avatar from "@/components/Agent/AvatarTrulience";
import { IRtcUser, IUserTracks } from "@/manager";
import { IMicrophoneAudioTrack } from "agora-rtc-sdk-ng";
import { apiClient } from "@/lib/api";
import type { Character, Postcard } from "@/types/api";
import { Avatar as ShadcnAvatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageCircle, Mic, PhoneOff, Volume2, Wifi, WifiOff } from "lucide-react";
import { Button } from "@/components/ui/button";

const DynamicRTCCard = dynamic(() => import("@/components/Dynamic/RTCCard"), {
  ssr: false,
});
const DynamicChatCard = dynamic(() => import("@/components/Chat/ChatCard"), {
  ssr: false,
});

export default function VoiceCallPage() {
  const params = useParams();
  const characterId = params?.id ? parseInt(params.id as string) : null;
  
  const mobileActiveTab = useAppSelector(
    (state) => state.global.mobileActiveTab
  );
  const trulienceSettings = useAppSelector((state) => state.global.trulienceSettings);

  const isCompactLayout = useIsCompactLayout();
  const useTrulienceAvatar = trulienceSettings.enabled;
  const avatarInLargeWindow = trulienceSettings.avatarDesktopLargeWindow;
  const [remoteuser, setRemoteUser] = useState<IRtcUser>();
  const [character, setCharacter] = useState<Character | null>(null);
  const [recentPostcards, setRecentPostcards] = useState<Postcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [signalStrength, setSignalStrength] = useState(4);

  // 获取角色信息
  useEffect(() => {
    const fetchCharacter = async () => {
      if (!characterId) return;
      
      try {
        setLoading(true);
        const characterData = await apiClient.getCharacter(characterId);
        setCharacter(characterData);
      } catch (error) {
        console.error('获取角色信息失败:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCharacter();
  }, [characterId]);

  // 获取用户近10条明信片
  useEffect(() => {
    const fetchRecentPostcards = async () => {
      try {
        const postcardsData = await apiClient.getPostcards({
          page: 1,
          page_size: 10,
          sort_by: 'created_at',
          sort_order: 'desc'
        });
        setRecentPostcards(postcardsData.items);
      } catch (error) {
        console.error('获取明信片失败:', error);
      }
    };

    fetchRecentPostcards();
  }, []);

  // RTC连接管理
  useEffect(() => {
    const { rtcManager } = require("@/manager/rtc/rtc");
    
    // 监听连接状态
    const handleConnectionStateChange = (state: string) => {
      setIsConnected(state === 'CONNECTED');
    };

    // 监听信号强度
    const handleSignalStrengthChange = (quality: any) => {
      // 根据上行和下行链路质量的较差值来设置信号强度
      const uplink = quality.uplinkNetworkQuality; // 0-6，0表示未知，1表示优秀，6表示网络断开
      const downlink = quality.downlinkNetworkQuality;
      const quality_level = Math.max(uplink, downlink);
      
      // 将 Agora 的 1-6 级别转换为我们的 4-0 级别
      let strength = 4;
      if (quality_level === 0) strength = 4; // 未知状态默认为最好
      else if (quality_level === 1) strength = 4; // 优秀
      else if (quality_level === 2) strength = 3; // 良好
      else if (quality_level === 3) strength = 2; // 一般
      else if (quality_level === 4) strength = 1; // 较差
      else strength = 0; // 很差或断开

      setSignalStrength(strength);
    };

    rtcManager.on("connectionStateChange", handleConnectionStateChange);
    rtcManager.on("networkQuality", handleSignalStrengthChange);
    rtcManager.on("remoteUserChanged", onRemoteUserChanged);
    
    return () => {
      rtcManager.off("connectionStateChange", handleConnectionStateChange);
      rtcManager.off("networkQuality", handleSignalStrengthChange);
      rtcManager.off("remoteUserChanged", onRemoteUserChanged);
    };
  }, []);

  const onRemoteUserChanged = (user: IRtcUser) => {
    console.log('[rtc] Remote user changed:', user);
    if (user.audioTrack) {
      if (!useTrulienceAvatar) {
        user.audioTrack.play();
      }
      setRemoteUser(user);
    } else {
      setRemoteUser(undefined);
    }
  };

  // 通话控制逻辑
  const handleMuteToggle = () => {
    setIsMuted(!isMuted);
    const { rtcManager } = require("@/manager/rtc/rtc");
    rtcManager.toggleMute(!isMuted);
  };

  const handleEndCall = () => {
    const { rtcManager } = require("@/manager/rtc/rtc");
    rtcManager.leaveChannel();
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  // RTC初始化和连接管理
  useEffect(() => {
    if (!characterId) return;

    const initRTC = async () => {
      const { rtcManager } = require("@/manager/rtc/rtc");
      const { rtmManager } = require("@/manager/rtm");
      
      try {
        // 初始化音频轨道
        await rtcManager.createMicrophoneAudioTrack();
        
        // 加入RTC频道
        const userId = Date.now().toString();
        let retryCount = 0;
        const maxRetries = 3;
        
        while (retryCount < maxRetries) {
          try {
            await rtcManager.join({
              channel: `character_${characterId}`,
              userId: parseInt(userId),
            });
            break;
          } catch (error) {
            if (error.message === 'Failed to get Agora token') {
              console.error(`获取Agora Token失败(尝试 ${retryCount + 1}/${maxRetries}):`, error);
              retryCount++;
              if (retryCount === maxRetries) {
                throw new Error('获取Agora Token失败，请稍后再试');
              }
            } else {
              console.error('RTC加入频道失败:', error);
              throw error;
            }
            // 等待一段时间后重试
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }

        // 发布本地音频轨道
        await rtcManager.publish();

        // 初始化RTM
        await rtmManager.init({
          channel: `character_${characterId}`,
          userId: parseInt(userId),
        });

        // 加入RTM频道
        await rtmManager.joinChannel();

        setIsConnected(true);
      } catch (error) {
        console.error('初始化通话失败:', error);
        setIsConnected(false);
      }
    };

    initRTC();

    return () => {
      const { rtcManager } = require("@/manager/rtc/rtc");
      const { rtmManager } = require("@/manager/rtm");
      
      // 清理RTC
      rtcManager.destroy();
      
      // 清理RTM
      if (rtmManager._joined) {
        rtmManager.leaveChannel();
        rtmManager.logout();
      }
    };
  }, [characterId]);

  // 处理消息发送和接收
  useEffect(() => {
    if (!characterId) return;

    const { rtmManager } = require("@/manager/rtm");
    
    const handleMessageReceived = (message: any) => {
      // 处理接收到的消息
      console.log('收到消息:', message);
    };

    rtmManager.on("rtmMessage", handleMessageReceived);
    
    return () => {
      rtmManager.off("rtmMessage", handleMessageReceived);
    };
  }, [characterId]);

  // 更新handleMessage函数
  const handleMessage = async () => {
    if (!characterId) return;
    
    const { rtmManager } = require("@/manager/rtm");
    await rtmManager.sendChannelMessage({
      message: {
        type: 'text',
        content: '打开消息界面'
      }
    });
  };

  // 信号强度显示组件
  const SignalIndicator = () => (
    <div className="flex items-center space-x-1">
      {isConnected ? (
        <>
          <Wifi className={`h-4 w-4 ${
            signalStrength >= 1 ? 'text-success' : 'text-gray-400'
          }`} />
          <span className="text-xs text-secondary-custom">
            {signalStrength === 4 ? '极佳' : 
             signalStrength === 3 ? '良好' : 
             signalStrength === 2 ? '一般' : 
             signalStrength === 1 ? '较差' : '无信号'}
          </span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4 text-error" />
          <span className="text-xs text-error">连接中...</span>
        </>
      )}
    </div>
  );

  // 手机语音聊天界面组件
  const MobileVoiceCallInterface = () => (
    <div className="md:hidden flex flex-col h-full bg-gradient-to-b from-primary/10 to-background">
      {/* 顶部状态栏 */}
      <div className="glass-container-primary p-4 rounded-b-2xl">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h1 className="text-lg font-semibold text-primary-custom">语音聊天</h1>
            <div className="flex items-center justify-center space-x-2">
              <SignalIndicator />
            </div>
          </div>
        </div>
      </div>

      {/* 角色信息区域 */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {loading ? (
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto"></div>
              <div className="h-6 bg-gray-300 rounded w-32 mx-auto mt-4"></div>
              <div className="h-4 bg-gray-300 rounded w-24 mx-auto mt-2"></div>
            </div>
          </div>
        ) : character ? (
          <div className="text-center space-y-4">
            {/* 角色头像 */}
            <div className="relative">
              <ShadcnAvatar className="w-24 h-24 border-4 border-white/20 shadow-lg">
                <AvatarImage src={character.avatar_url} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {character.name.charAt(0)}
                </AvatarFallback>
              </ShadcnAvatar>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <Volume2 className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* 角色信息 */}
            <div>
              <h2 className="text-xl font-bold text-primary-custom">{character.name}</h2>
              <p className="text-sm text-secondary-custom">{character.user_role_name}</p>
            </div>

            {/* 通话状态 */}
            <div className={`rounded-full px-4 py-2 ${
              isConnected ? 'bg-success-light' : 'bg-warning-light'
            }`}>
              <span className={`text-sm font-medium ${
                isConnected ? 'text-success' : 'text-warning'
              }`}>
                {isConnected ? '通话中...' : '连接中...'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center text-secondary-custom">
            <p>角色信息加载失败</p>
          </div>
        )}
      </div>

      {/* 通话控制区域 */}
      <div className="glass-container-elevated p-6 rounded-t-2xl">
        <div className="flex justify-center space-x-8">
          {/* 静音按钮 */}
          <Button 
            variant={isMuted ? "secondary" : "outline"}
            size="icon" 
            className={`rounded-full w-14 h-14 ${
              isMuted ? 'bg-warning border-warning' : 'bg-white/20 border-white/30'
            }`}
            onClick={handleMuteToggle}
          >
            <Mic className={`h-6 w-6 ${isMuted ? 'text-warning' : ''}`} />
          </Button>

          {/* 挂断按钮 */}
          <Button 
            variant="destructive" 
            size="icon" 
            className="rounded-full w-16 h-16 bg-error border-error"
            onClick={handleEndCall}
          >
            <PhoneOff className="h-6 w-6" />
          </Button>

          {/* 消息按钮 */}
          <Button 
            variant="outline" 
            size="icon" 
            className="rounded-full w-14 h-14 bg-white/20 border-white/30"
            onClick={handleMessage}
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* 最近明信片预览 */}
      {recentPostcards.length > 0 && (
        <div className="glass-container-secondary p-4 mx-4 mb-4 rounded-xl">
          <h3 className="text-sm font-medium text-primary-custom mb-2">最近明信片</h3>
          <div className="flex space-x-2 overflow-x-auto">
            {recentPostcards.slice(0, 3).map((postcard) => (
              <div key={postcard.id} className="flex-shrink-0">
                <div className="w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center">
                  <MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <p className="text-xs text-secondary-custom mt-1 truncate w-16">
                  {postcard.content.substring(0, 10)}...
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <AuthInitializer>
      <div className="relative mx-auto flex flex-1 min-h-screen flex-col md:h-screen">
        {/* 手机端界面 */}
        <MobileVoiceCallInterface />
      </div>
    </AuthInitializer>
  );
}
