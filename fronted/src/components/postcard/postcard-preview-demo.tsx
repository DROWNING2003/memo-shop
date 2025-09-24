"use client";

import React from "react";
import { PostcardPreview } from "./postcard-preview";
import type { Postcard } from "@/types/api";

// 创建一个示例明信片数据用于演示
const demoPostcard: Postcard = {
  id: 1,
  content: "在这片宁静的湖畔，夕阳为群山镀上金边，美得令人屏息。大自然的鬼斧神工总能让人感叹不已。愿这份静谧的美景能带给你片刻的宁静与感动。",
  character_id: 1,
  user_id: 1,
  type: "user",
  status: "sent",
  is_favorite: false,
  created_at: "2025-09-24T14:43:46Z",
  updated_at: "2025-09-24T14:43:46Z",
  character: {
    id: 1,
    name: "Sarah",
    description: "热爱自然的旅行者",
    avatar_url: "",
    user_role_name: "朋友",
    user_role_desc: "可以分享旅行见闻的朋友",
    visibility: "public",
    is_active: true,
    popularity_score: 100,
    usage_count: 50,
    creator_id: 1,
    created_at: "2025-09-24T14:43:46Z",
    updated_at: "2025-09-24T14:43:46Z"
  }
};

export function PostcardPreviewDemo() {
  return (
    <div className="bg-gray-50 flex items-center justify-center min-h-screen p-4">
      <PostcardPreview postcard={demoPostcard} />
    </div>
  );
}
