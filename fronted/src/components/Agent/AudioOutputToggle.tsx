"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Speaker, Headphones } from "lucide-react"
import AgoraRTC, { IMicrophoneAudioTrack, IRemoteAudioTrack } from "agora-rtc-sdk-ng"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function AudioOutputToggle(props: { audioTrack?:IMicrophoneAudioTrack }) {
  const { audioTrack } = props
  const [devices, setDevices] = React.useState<MediaDeviceInfo[]>([])
  const [currentDevice, setCurrentDevice] = React.useState<string>("")
  const [isLoading, setIsLoading] = React.useState(false)

  // 获取音频输出设备列表
  const fetchPlaybackDevices = async () => {
    try {
      setIsLoading(true)
      const devices = await AgoraRTC.getPlaybackDevices()
      setDevices(devices)
      if (devices.length > 0) {
        setCurrentDevice(devices[0].deviceId)
      }
    } catch (error) {
      console.error("Failed to get playback devices:", error)
    } finally {
      setIsLoading(false)
    }
  }

  React.useEffect(() => {
    fetchPlaybackDevices()
  }, [])

  // 切换音频输出设备
  const switchDevice = async (deviceId: string) => {
    if (!audioTrack) {
      console.log("Audio track not available");
      return;
    }
    
    try {
      setIsLoading(true)
      await audioTrack.setPlaybackDevice(deviceId)
      setCurrentDevice(deviceId)
    } catch (error) {
      console.error("Failed to switch audio output:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // 快速切换听筒/扬声器
  const toggleEarpiece = async () => {
    if (devices.length < 2) return
    
    const earpiece = devices.find(d => d.label.toLowerCase().includes('earpiece'))
    const speaker = devices.find(d => d.label.toLowerCase().includes('speaker'))
    
    if (currentDevice === earpiece?.deviceId && speaker) {
      await switchDevice(speaker.deviceId)
    } else if (earpiece) {
      await switchDevice(earpiece.deviceId)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={toggleEarpiece}
          disabled={isLoading || devices.length < 2}
          title="切换听筒/扬声器"
          className="rounded-full w-14 h-14 "
        >
          {devices.some(d => d.deviceId === currentDevice && d.label.toLowerCase().includes('earpiece')) ? (
            <Headphones className="h-5 w-5" />
          ) : (
            <Speaker className="h-5 w-5" />
          )}
        </Button>
        
        {/* <Select 
          value={currentDevice}
          onValueChange={switchDevice}
          disabled={isLoading}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="选择输出设备" />
          </SelectTrigger>
          <SelectContent>
            {devices.map((device) => (
              <SelectItem key={device.deviceId} value={device.deviceId}>
                {device.label || `设备 ${device.deviceId.slice(0, 4)}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select> */}
      </div>
      
      {/* <div className="text-xs text-muted-foreground">
        当前模式: {
          devices.some(d => d.deviceId === currentDevice && d.label.toLowerCase().includes('earpiece')) 
            ? "听筒" 
            : "扬声器"
        }
      </div> */}
    </div>
  )
}
