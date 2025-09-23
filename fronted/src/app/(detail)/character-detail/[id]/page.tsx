'use client'

import React, { use } from 'react'
import { useRouter } from 'next/navigation'
import { notFound } from 'next/navigation'
import CharacterDetail from '@/components/CharacterDetail'
import { getCharacterById } from '@/lib/characters'

interface CharacterDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default function CharacterDetailPage({ params }: CharacterDetailPageProps) {
  const router = useRouter()
  const { id } = use(params)
  const character = getCharacterById(id)

  // 如果角色不存在，显示404页面
  if (!character) {
    notFound()
  }

  const handleBack = () => {
    router.back()
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${character.name} - 角色详情`,
        text: character.description,
        url: window.location.href
      }).catch(console.error)
    } else {
      // 降级处理：复制到剪贴板
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('链接已复制到剪贴板')
      }).catch(() => {
        alert('分享功能暂不可用')
      })
    }
  }

  const handleStartChat = () => {
    // 跳转到聊天页面
    router.push(`/chat/${id}`)
  }

  const handleCall = () => {
    // 跳转到语音通话页面
    router.push(`/call/${id}`)
  }

  const handleLike = () => {
    // 处理点赞逻辑
    console.log('Liked character:', character.name)
    // 这里可以添加实际的点赞API调用
  }

  return (
    <CharacterDetail
      character={character}
      onBack={handleBack}
      onShare={handleShare}
      onStartChat={handleStartChat}
      onCall={handleCall}
      onLike={handleLike}
    />
  )
}