"use client";
import { useAppSelector,apiStartService,apiPing, useAppDispatch } from '@/common'
import AuthInitializer from '@/components/authInitializer';
import dynamic from 'next/dynamic';
import { setAgentConnected } from "@/store/reducers/global";
import React, { useEffect, useState } from 'react'
import Header from "@/components/Layout/Header";
import { useParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import { setCurrentCharacter, setCharacterLoading, setRecentPostcards, setPostcardsLoading } from '@/store/reducers/global';
import { log } from 'console';
// import Action from '@/components/Layout/Action';

let intervalId: NodeJS.Timeout | null = null;

function TestComponent() {
  const DynamicRTCCard = dynamic(() => import("@/components/Dynamic/RTCCardC"), {
    ssr: false,
  });
  
  const dispatch = useAppDispatch();
  const params = useParams();
  const characterId = params?.id ? parseInt(params.id as string) : null;
  
  // 从store中获取状态
  const options = useAppSelector((state) => state.global.options);
  const agentConnected = useAppSelector((state) => state.global.agentConnected);
  const currentCharacter = useAppSelector((state) => state.global.currentCharacter);
  const { userId, channel } = options;
  
  // // 从store中获取状态
  // const currentCharacter = useAppSelector((state) => state.global.currentCharacter);
  // const characterLoading = useAppSelector((state) => state.global.characterLoading);
  // const recentPostcards = useAppSelector((state) => state.global.recentPostcards);
  // const postcardsLoading = useAppSelector((state) => state.global.postcardsLoading);

  const [serviceStarted, setServiceStarted] = useState(false);
  // 获取角色信息
  useEffect(() => {
    const fetchCharacter = async () => {
      if (!characterId) return;
      
      try {
        dispatch(setCharacterLoading(true));
        const characterData = await apiClient.getCharacter(characterId);
        dispatch(setCurrentCharacter(characterData));
      } catch (error) {
        console.error('获取角色信息失败:', error);
        dispatch(setCurrentCharacter(null));
      } finally {
        dispatch(setCharacterLoading(false));
      }
    };

    fetchCharacter();
  }, [characterId, dispatch]);

  // 获取最近明信片
  useEffect(() => {
    const fetchRecentPostcards = async () => {
      try {
        dispatch(setPostcardsLoading(true));
        const postcardsData = await apiClient.getPostcards({
          page: 1,
          page_size: 10,
          sort_by: 'created_at',
          sort_order: 'desc'
        });
        dispatch(setRecentPostcards(postcardsData.items));
      } catch (error) {
        console.error('获取明信片失败:', error);
        dispatch(setRecentPostcards([]));
      } finally {
        dispatch(setPostcardsLoading(false));
      }
    };

    fetchRecentPostcards();
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
          }, currentCharacter);
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
      apiPing(channel);
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
    };
  }, [dispatch]);

  return (
    <AuthInitializer>
      <Header />
      {/* <Action /> */}
      <DynamicRTCCard/>
      
    </AuthInitializer>
  )
}

export default TestComponent
