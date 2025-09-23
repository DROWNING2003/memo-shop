'use client'

import React from 'react'
import BottomNavigation from './BottomNavigation'

interface AppLayoutProps {
  children: React.ReactNode
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      {/* 主要内容区域 */}
      <div className="pb-[88px]">
        {children}
      </div>
      
      {/* 底部导航 */}
      <BottomNavigation />
    </div>
  )
}