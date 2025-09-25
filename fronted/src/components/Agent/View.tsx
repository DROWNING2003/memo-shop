"use client"

import { useMultibandTrackVolume } from "@/common"
import { cn } from "@/lib/utils"
import { IMicrophoneAudioTrack } from "agora-rtc-sdk-ng"
import AudioVisualizer from "@/components/Agent/AudioVisualizer"
import { useSelector } from "react-redux"
import { RootState } from "@/store"
import { Avatar as ShadcnAvatar, AvatarFallback, AvatarImage, Avatar } from "@/components/ui/avatar"
import { Volume2 } from "lucide-react"

export interface AgentViewProps {
  audioTrack?: IMicrophoneAudioTrack
}

export default function AgentView(props: AgentViewProps) {
  const { audioTrack } = props

  // 从全局 store 中获取角色信息和加载状态
  const { currentCharacter, characterLoading } = useSelector((state: RootState) => state.global)

  const subscribedVolumes = useMultibandTrackVolume(audioTrack, 12)

  return (
    <div
      className={cn(
        "flex h-auto w-full flex-col items-center justify-center px-4 py-5",
      )}
    >
       {/* 角色信息区域 */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        {characterLoading ? (
          <div className="text-center space-y-4">
            <div className="animate-pulse">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto"></div>
              <div className="h-6 bg-gray-300 rounded w-32 mx-auto mt-4"></div>
              <div className="h-4 bg-gray-300 rounded w-24 mx-auto mt-2"></div>
            </div>
          </div>
        ) : currentCharacter ? (
          <div className="text-center space-y-4">
            {/* 角色头像 */}
            <div className="relative">
              <Avatar className="size-24">
                <AvatarImage  src={currentCharacter.avatar_url} />
                <AvatarFallback className="bg-primary/20 text-primary">
                  {currentCharacter.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* 角色信息 */}
            <div>
              <h2 className="text-xl font-bold text-primary-custom">{currentCharacter.name}</h2>
              <p className="text-sm text-secondary-custom">{currentCharacter.user_role_name}</p>
            </div>

            {/* 通话状态 */}
            <div className="rounded-full px-4 py-2 bg-success-light">
              <span className="text-sm font-medium text-success">
                通话中...
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center text-secondary-custom">
            <p>角色信息加载失败</p>
          </div>
        )}
      </div>
      <div className="mt-8 h-14 w-full">
        <AudioVisualizer
          type="agent"
          frequencies={subscribedVolumes}
          barWidth={6}
          minBarHeight={6}
          maxBarHeight={56}
          borderRadius={2}
          gap={6}
        />
      </div>
    </div>
  )
}
