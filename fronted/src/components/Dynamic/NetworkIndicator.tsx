"use client"

import * as React from "react"
import { NetworkQuality } from "agora-rtc-sdk-ng"
import { rtcManager } from "@/manager"
import { Wifi, WifiOff } from "lucide-react"

export default function NetworkIndicator() {
  const [networkQuality, setNetworkQuality] = React.useState<NetworkQuality>()
  const [isConnected, setIsConnected] = React.useState(true) // 默认假设已连接

  React.useEffect(() => {
    rtcManager.on("networkQuality", onNetworkQuality)

    return () => {
      rtcManager.off("networkQuality", onNetworkQuality)
    }
  }, [])

  const onNetworkQuality = (quality: NetworkQuality) => {
    setNetworkQuality(quality)
    // 根据网络质量判断连接状态
    const qualityLevel = Math.max(quality.uplinkNetworkQuality, quality.downlinkNetworkQuality)
    setIsConnected(qualityLevel < 6) // 6表示网络断开
  }

  // 根据 Agora 的 0-6 级别转换为我们的 4-0 级别
  const getSignalStrength = (qualityLevel?: number) => {
    if (qualityLevel === undefined) return 4;
    
    let strength = 4;
    if (qualityLevel === 0) strength = 4; // 未知状态默认为最好
    else if (qualityLevel === 1) strength = 4; // 优秀
    else if (qualityLevel === 2) strength = 3; // 良好
    else if (qualityLevel === 3) strength = 2; // 一般
    else if (qualityLevel === 4) strength = 1; // 较差
    else strength = 0; // 很差或断开

    return strength;
  }

  const signalStrength = getSignalStrength(networkQuality?.uplinkNetworkQuality)

  return (
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
  )
}
