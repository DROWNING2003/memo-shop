"use client";

import React from "react";
import CharacterDetail from "@/components/CharacterDetail";
import { Character } from "@/types/character";

// Mock data - in a real app, this would come from props or API
const mockCharacter: Character = {
  id: "1",
  name: "小樱",
  description:
    "温柔善良的魔法少女，总是带着治愈的笑容。\n擅长倾听他人的烦恼，用温暖的话语抚慰人心。",
  story: `小樱是一位拥有神奇魔法力量的少女，她的内心纯净如水晶般透明。从小就展现出对他人痛苦的敏感和同理心，总是能够察觉到身边人的情绪变化。

她相信每个人心中都有一片温暖的净土，只是有时候被生活的阴霾遮蔽了。通过她的魔法和温柔的话语，她帮助人们重新找回内心的光明。

在她的世界里，没有解决不了的烦恼，只有还没有找到合适方法的心灵。她愿意用自己的时间和耐心，陪伴每一个需要帮助的人走过人生的低谷。`,
  avatar:
    "https://static.paraflowcontent.com/public/resource/image/05666209-068e-4e4e-af43-5107d4583d47.jpeg",
  rating: 4.9,
  likes: "8.9k",
  messages: "2.1k",
  tags: ["魔法少女", "治愈系", "温柔", "善良", "倾听者", "动漫角色"],
  isOnline: true,
  conversations: [
    { time: "今天 14:30", preview: "谢谢你的鼓励，我感觉好多了..." },
    { time: "昨天 20:15", preview: "你说得对，我应该更相信自己" },
    { time: "3天前", preview: "和你聊天总是让我很放松" },
  ],
  similarCharacters: [
    {
      name: "子期",
      image:
        "https://static.paraflowcontent.com/public/resource/image/b8701244-20d0-4b2a-b619-909bb9984093.jpeg",
    },
    {
      name: "艾米医生",
      image:
        "https://static.paraflowcontent.com/public/resource/image/4903b3ca-ca13-4857-8ee5-ab96d42decf6.jpeg",
    },
    {
      name: "小魔女",
      image:
        "https://static.paraflowcontent.com/public/resource/image/9975f440-e846-48e9-8dc0-93b4b7d5a454.jpeg",
    },
  ],
};

export default function CharacterDetailPage() {
  const handleBack = () => {
    // Navigate back or close modal
    window.history.back();
  };

  const handleShare = () => {
    // Share character
    if (navigator.share) {
      navigator.share({
        title: `${mockCharacter.name} - 角色详情`,
        text: mockCharacter.description,
        url: window.location.href,
      });
    }
  };

  const handleStartChat = () => {
    // Navigate to chat page
    console.log("Starting chat with", mockCharacter.name);
  };

  const handleCall = () => {
    // Start voice call
    console.log("Starting call with", mockCharacter.name);
  };

  const handleLike = () => {
    // Toggle like
    console.log("Liked", mockCharacter.name);
  };
  return (
    <CharacterDetail
      character={mockCharacter}
      onBack={handleBack}
      onShare={handleShare}
      onStartChat={handleStartChat}
      onCall={handleCall}
      onLike={handleLike}
    />
  );
}
