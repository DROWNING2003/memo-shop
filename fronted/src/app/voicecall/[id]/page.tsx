"use client";
import { useAppSelector,apiStartService,apiPing, useAppDispatch } from '@/common'
import AuthInitializer from '@/components/authInitializer';
import dynamic from 'next/dynamic';
import { setAgentConnected } from "@/store/reducers/global";
import React, { useEffect, useMemo, useRef, useState } from 'react'
import Header from "@/components/Layout/Header";
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { setCurrentCharacter, setCharacterLoading, setRecentPostcards, setPostcardsLoading } from '@/store/reducers/global';
// import Action from '@/components/Layout/Action';

let intervalId: ReturnType<typeof setInterval> | null = null;

// 动态组件放到组件外，避免每次渲染重新创建导致闪烁
const DynamicRTCCard = dynamic(() => import("@/components/Dynamic/RTCCardC"), {
  ssr: false,
  loading: () => null,
});

function TestComponent() {
  const dispatch = useAppDispatch();
  const params = useParams();
  const characterId = useMemo(() => (params?.id ? parseInt(params.id as string) : null), [params]);
  
  // 从store中获取状态
  const options = useAppSelector((state) => state.global.options);
  const agentConnected = useAppSelector((state) => state.global.agentConnected);
  const currentCharacter = useAppSelector((state) => state.global.currentCharacter);
  const recentPostcards = useAppSelector((state) => state.global.recentPostcards);
  const { userId, channel } = options;
  
  // // 从store中获取状态
  // const currentCharacter = useAppSelector((state) => state.global.currentCharacter);
  // const characterLoading = useAppSelector((state) => state.global.characterLoading);
  // const recentPostcards = useAppSelector((state) => state.global.recentPostcards);
  // const postcardsLoading = useAppSelector((state) => state.global.postcardsLoading);

  const [serviceStarted, setServiceStarted] = useState(false);
  // 保持最新channel用于定时器闭包
  const latestChannelRef = useRef(channel);
  useEffect(() => {
    latestChannelRef.current = channel;
  }, [channel]);

  // 获取角色信息
  useEffect(() => {
    let cancelled = false;
    const fetchCharacter = async () => {
      if (!characterId) return;
      
      try {
        dispatch(setCharacterLoading(true));
        const characterData = await apiClient.getCharacter(characterId);
        if (!cancelled) {
          dispatch(setCurrentCharacter(characterData));
        }
      } catch (error) {
        console.error('获取角色信息失败:', error);
        if (!cancelled) {
          dispatch(setCurrentCharacter(null));
        }
      } finally {
        if (!cancelled) {
          dispatch(setCharacterLoading(false));
        }
      }
    };

    fetchCharacter();
    return () => {
      cancelled = true;
    };
  }, [characterId, dispatch]);

  // 获取最近明信片
  useEffect(() => {
    let cancelled = false;
    const fetchRecentPostcards = async () => {
      try {
        dispatch(setPostcardsLoading(true));
        const postcardsData = await apiClient.getPostcards({
          page: 1,
          page_size: 5,
          sort_by: 'created_at',
          sort_order: 'desc'
        });
        if (!cancelled) {
          dispatch(setRecentPostcards(postcardsData.items));
        }
      } catch (error) {
        console.error('获取明信片失败:', error);
        if (!cancelled) {
          dispatch(setRecentPostcards([]));
        }
      } finally {
        if (!cancelled) {
          dispatch(setPostcardsLoading(false));
        }
      }
    };

    fetchRecentPostcards();
    return () => {
      cancelled = true;
    };
  }, [dispatch]);

  // 在角色信息和明信片加载完成后启动服务（仅自动启动一次）
  useEffect(() => {
    const startService = async () => {
      // 确保角色数据已加载完成
      if (!serviceStarted && userId && channel && !agentConnected && currentCharacter) {
        try {
          console.log('开始自动启动语音服务...');
          console.log('当前角色:', currentCharacter);
          
          const res = await apiStartService({
            channel,
            userId,
            graphName: "voice_assistant",
          }, currentCharacter,recentPostcards);
          console.log('语音服务启动成功:', res);
          dispatch(setAgentConnected(true));
          setServiceStarted(true);
        } catch (error) {
          console.error('启动语音服务失败:', error);
        }
      }
    };

    startService();
  }, [serviceStarted, userId, channel, agentConnected, currentCharacter]);

  // 监听agentConnected状态变化（由Action组件控制）
  useEffect(() => {
    if (!agentConnected) {
      console.log('agentConnected变为false，停止ping服务');
      stopPing();
    } else if (agentConnected && !intervalId) {
      console.log('agentConnected变为true，开始ping服务');
      startPing();
    }
  }, [agentConnected]);

  const startPing = () => {
    if (intervalId) {
      stopPing();
    }
    intervalId = setInterval(() => {
      apiPing(latestChannelRef.current);
    }, 3000);
  };

  const stopPing = () => {
    if (intervalId) {
      clearInterval(intervalId);
      intervalId = null;
    }
  };
  // 清理函数
  useEffect(() => {
    return () => {
      // 组件卸载时清理状态
      dispatch(setCurrentCharacter(null));
      dispatch(setRecentPostcards([]));
      stopPing();
    };
  }, [dispatch]);

  const isReady = useMemo(() => Boolean(currentCharacter && agentConnected), [currentCharacter, agentConnected]);

  return (
    <AuthInitializer>
      <Header />
      {/* <Action /> */}
      {isReady ? (
        <DynamicRTCCard/>
      ) : (
        <div className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center">
            <div className="h-10 w-10 rounded-full border-2 border-gray-300 border-t-transparent animate-spin" />
            <div className="mt-4 text-sm text-gray-500">正在连接语音服务…</div>
          </div>
        </div>
      )}
      
    </AuthInitializer>
  )
}

export default TestComponent
