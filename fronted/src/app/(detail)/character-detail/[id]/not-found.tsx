'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search } from 'lucide-react'

export default function CharacterNotFound() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col">
      {/* Header */}
      <div className="fixed top-0 w-full z-10 bg-[#FAF6F0]">
        <div className="h-[env(safe-area-inset-top)]"></div>
        <header className="flex justify-between items-center h-14 px-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center w-6 h-6 hover:bg-black/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#3D2914E6]" />
          </button>
          <h1 className="text-xl font-semibold text-[#3D2914E6]">角色详情</h1>
          <div className="w-6 h-6"></div>
        </header>
      </div>

      {/* Spacer for fixed header */}
      <div>
        <div className="h-[env(safe-area-inset-top)]"></div>
        <div className="h-14"></div>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <div className="bg-white/90 rounded-2xl p-8 backdrop-blur-sm max-w-sm w-full">
          <div className="w-20 h-20 bg-[#F7E7CE] rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="w-10 h-10 text-[#E07B39]" />
          </div>
          
          <h2 className="text-2xl font-bold text-[#3D2914E6] mb-4">
            角色未找到
          </h2>
          
          <p className="text-[#5C4A39CC] mb-6 leading-relaxed">
            抱歉，您要查找的角色不存在或已被移除。
            <br />
            请检查链接是否正确，或返回角色广场寻找其他有趣的角色。
          </p>
          
          <div className="space-y-3">
            <button 
              onClick={() => router.push('/character-square')}
              className="w-full bg-[#E07B39] text-white py-3 px-4 rounded-full font-medium hover:bg-[#D06B29] transition-colors"
            >
              返回角色广场
            </button>
            
            <button 
              onClick={() => router.back()}
              className="w-full bg-[#F7E7CE] text-[#3D2914] py-3 px-4 rounded-full font-medium hover:bg-[#F0D9B8] transition-colors"
            >
              返回上一页
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Spacer */}
      <div className="h-[env(safe-area-inset-bottom)]"></div>
    </div>
  )
}