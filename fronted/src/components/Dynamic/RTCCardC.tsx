"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ICameraVideoTrack, ILocalVideoTrack, IMicrophoneAudioTrack } from "agora-rtc-sdk-ng"
import { useAppSelector, useAppDispatch, VOICE_OPTIONS, VideoSourceType, useIsCompactLayout, apiStopService } from "@/common"
import { ITextItem, EMessageType, IChatItem } from "@/types"
import { rtcManager, IUserTracks, IRtcUser } from "@/manager"
import {
  setRoomConnected,
  addChatItem,
  setVoiceType,
  setOptions,
  setAgentConnected,
} from "@/store/reducers/global"
import AgentVoicePresetSelect from "@/components/Agent/VoicePresetSelect"
import AgentView from "@/components/Agent/View"
import Avatar from "@/components/Agent/AvatarTrulience"
import MicrophoneBlock from "@/components/Agent/Microphone"
import VideoBlock from "@/components/Agent/Camera"
import { AudioOutputToggle } from "@/components/Agent/AudioOutputToggle"
import dynamic from "next/dynamic"
import ChatCard from "@/components/Chat/ChatCard"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Mic, MicOff, PhoneOff, Volume2, Wifi, WifiOff, MessageCircle, User, Settings } from "lucide-react"
import { useState, useEffect } from "react"
import AgoraRTC from "agora-rtc-sdk-ng"
import { useRouter } from "next/navigation"

let hasInit: boolean = false

export default function RTCCardC(props: { className?: string }) {
  const { className } = props
  const router = useRouter();
  const dispatch = useAppDispatch()
  const options = useAppSelector((state) => state.global.options)
  const trulienceSettings = useAppSelector((state) => state.global.trulienceSettings)
  const { userId, channel } = options
  const [videoTrack, setVideoTrack] = React.useState<ICameraVideoTrack>()
  const [audioTrack, setAudioTrack] = React.useState<IMicrophoneAudioTrack>()
  const [screenTrack, setScreenTrack] = React.useState<ILocalVideoTrack>()
  const [remoteuser, setRemoteUser] = React.useState<IRtcUser>()
  const [videoSourceType, setVideoSourceType] = React.useState<VideoSourceType>(VideoSourceType.CAMERA)
  const useTrulienceAvatar = trulienceSettings.enabled
  const avatarInLargeWindow = trulienceSettings.avatarDesktopLargeWindow;

  const isCompactLayout = useIsCompactLayout();

  const DynamicChatCard = dynamic(() => import("@/components/Chat/ChatCard"), {
    ssr: false,
  });
  
  React.useEffect(() => {
    if (!options.channel) {
      return
    }
    if (hasInit) {
      return
    }

    init()

    return () => {
      if (hasInit) {
        destory()
      }
    }
  }, [options.channel])

  const init = async () => {
    console.log("[rtc] init")
    rtcManager.on("localTracksChanged", onLocalTracksChanged)
    rtcManager.on("textChanged", onTextChanged)
    rtcManager.on("remoteUserChanged", onRemoteUserChanged)
    //await rtcManager.createCameraTracks()
    await rtcManager.createMicrophoneAudioTrack()
    await rtcManager.join({
      channel,
      userId,
    })
    dispatch(
      setOptions({
        ...options,
        appId: rtcManager.appId ?? "",
        token: rtcManager.token ?? "",
      }),
    )
    await rtcManager.publish()
    dispatch(setRoomConnected(true))
    hasInit = true
  }

  const destory = async () => {
    console.log("[rtc] destory")
    rtcManager.off("textChanged", onTextChanged)
    rtcManager.off("localTracksChanged", onLocalTracksChanged)
    rtcManager.off("remoteUserChanged", onRemoteUserChanged)
    await rtcManager.destroy()
    dispatch(setRoomConnected(false))
    hasInit = false
  }

  const onRemoteUserChanged = (user: IRtcUser) => {
    console.log("[rtc] onRemoteUserChanged", user)
    if (useTrulienceAvatar) {
      // trulience SDK will play audio in synch with mouth
      user.audioTrack?.stop();
    }
    if (user.audioTrack) {
      setRemoteUser(user)
    } 
  }

  const onLocalTracksChanged = (tracks: IUserTracks) => {
    console.log("[rtc] onLocalTracksChanged", tracks)
    const { videoTrack, audioTrack, screenTrack } = tracks
    setVideoTrack(videoTrack)
    setScreenTrack(screenTrack)
    if (audioTrack) {
      setAudioTrack(audioTrack)
    }
  }

  const onTextChanged = (text: IChatItem) => {
    console.log("[rtc] onTextChanged", text)
    dispatch(
      addChatItem(text),
    )
  }

  // 通话控制状态
  const [isMuted, setIsMuted] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [signalStrength, setSignalStrength] = useState(4) // 1-5 信号强度
  const [microphoneDevices, setMicrophoneDevices] = useState<{label: string, value: string, deviceId: string}[]>([])
  const [selectedMicrophone, setSelectedMicrophone] = useState("default")

  // 获取听筒设备列表
  useEffect(() => {
    const getSpeakerDevices = async () => {
      try {
        const devices = await AgoraRTC.getPlaybackDevices()
        const deviceList = devices.map(device => ({
          label: device.label || `听筒 ${device.deviceId.slice(0, 8)}`,
          value: device.deviceId,
          deviceId: device.deviceId
        }))
        setMicrophoneDevices(deviceList)
        
        if (deviceList.length > 0 && selectedMicrophone === "default") {
          setSelectedMicrophone(deviceList[0].value)
        }
      } catch (error) {
        console.error('获取听筒设备失败:', error)
      }
    }

    getSpeakerDevices()
  }, [])

  // 切换听筒设备
  const handleSpeakerChange = async (deviceId: string) => {
    try {
      setSelectedMicrophone(deviceId)
      // 使用 setDevice 方法来设置音频输出设备
      // 注意：在Web端，音频输出设备切换通常需要浏览器权限
      if (remoteuser?.audioTrack) {
        await remoteuser.audioTrack.setDevice(deviceId)
      }
    } catch (error) {
      console.error('切换听筒设备失败:', error)
    }
  }

  // 静音切换
  const handleMuteToggle = async () => {
    try {
      if (isMuted) {
        await audioTrack?.setEnabled(true)
      } else {
        await audioTrack?.setEnabled(false)
      }
      setIsMuted(!isMuted)
    } catch (error) {
      console.error('切换静音失败:', error)
    }
  }

  // 结束通话（优先更新UI与状态，清理并行后台进行）
  const handleEndCall = async () => {
    try {
      // 立即更新本地UI状态，提升响应速度
      setIsConnected(false)
      dispatch(setAgentConnected(false))
      // 迅速返回上一页，避免等待网络/RTC清理
      router.back()

      // 后台并行清理：RTC销毁 + 服务停止
      void Promise.allSettled([
        destory(),
        apiStopService(channel),
      ])
    } catch (error) {
      console.error('结束通话失败:', error)
    }
  }

  // 监听连接状态
  useEffect(() => {
    setIsConnected(hasInit)
  }, [hasInit])

  // 监听音频输出设备变化

  return (
    <div className={cn("flex h-full flex-col min-h-0", className)}>

      {/* 主内容区域 */}
      <div className="min-h-0 overflow-y-auto z-10 flex-1">
        <AgentView audioTrack={remoteuser?.audioTrack} />
      </div>

      {/* 通话控制区域 */}
      <div className="glass-container-elevated p-6 rounded-t-2xl mt-4">
        <div className="flex justify-center space-x-6">
          {/* 静音按钮 */}
          <Button 
            variant={isMuted ? "secondary" : "outline"}
            size="icon" 
            className={`rounded-full w-14 h-14 transition-all ${
              isMuted ? 'bg-red-500 border-red-500 hover:bg-red-600' : ''
            }`}
            onClick={handleMuteToggle}
          >
            {isMuted ? (
              <MicOff className="h-6 w-6 text-white" />
            ) : (
              <Mic className="h-6 w-6" />
            )}
          </Button>

          {/* 挂断按钮 */}
          <Button 
            variant="destructive" 
            size="icon" 
            className="rounded-full w-16 h-16 bg-red-600 border-red-600 hover:bg-red-700 transition-all"
            onClick={handleEndCall}
          >
            <PhoneOff className="h-6 w-6 text-white" />
          </Button>

          {/* 音频输出切换 */}
          <div className="flex items-center space-x-2">
              <AudioOutputToggle audioTrack={remoteuser?.audioTrack} />
          </div>
        </div>

        {/* 通话信息 */}
        <div className="mt-4 text-center">
          <div className="text-sm text-gray-500">
            {isConnected ? '通话进行中' : '通话已结束'}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            通话时长: 00:00
          </div>
        </div>
      </div>
    </div>
  );
}
