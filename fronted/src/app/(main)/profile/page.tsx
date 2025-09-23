"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  Settings,
  Heart,
  MessageCircle,
  FileText,
  Palette,
  Eye,
  Globe,
  Type,
  Moon,
  MessageSquare,
  Headphones,
  Info,
  Shield,
  LogOut,
  Camera,
  ChevronRight,
} from "lucide-react";

export default function ProfilePage() {
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      {/* 固定头部 */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="fixed top-0 w-full bg-[#FAF6F0] z-10"
      >
        <div className="h-[env(safe-area-inset-top)]"></div>
        <header className="flex justify-between items-center h-14 px-6">
          <h1 className="text-[#3D2914E6] text-xl font-semibold">个人中心</h1>
          <div className="w-6 h-6 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#8B7355B3]" />
          </div>
        </header>
      </motion.div>

      {/* 占位空间 */}
      <div>
        <div className="h-[env(safe-area-inset-top)]"></div>
        <div className="h-14"></div>
      </div>

      <main className="pt-4 pb-4">
        {/* 用户信息卡片 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4 px-4"
        >
          <div className="bg-white/90 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-4 mb-4">
              <div className="relative">
                <img
                  src="https://static.paraflowcontent.com/public/resource/image/b1b01e4c-966c-496c-af0c-d707c9812105.jpeg"
                  alt="用户头像"
                  className="size-14 rounded-full object-cover"
                />
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#E07B39] rounded-full flex items-center justify-center">
                  <Camera className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <h2 className="text-[#3D2914E6] text-sm font-semibold mb-1">
                  小卖部的常客
                </h2>
                <p className="text-[#5C4A39CC] text-xs">
                  喜欢收集回忆，热爱分享故事
                </p>
              </div>
              <button className="bg-[#F4E4D699] text-[#E07B39] px-3 py-1.5 rounded-lg text-xs">
                编辑
              </button>
            </div>
          </div>
        </motion.section>

        {/* 明信片统计 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-4 px-4"
        >
          <div className="bg-white/90 rounded-2xl p-4 backdrop-blur-sm">
            <h3 className="text-[#3D2914E6] text-sm font-semibold mb-3">
              我的明信片统计
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-[#E07B39] text-xl font-semibold mb-1">
                  42
                </div>
                <div className="text-[#8B7355B3] text-xs">发出明信片</div>
              </div>
              <div className="text-center">
                <div className="text-[#E07B39] text-xl font-semibold mb-1">
                  38
                </div>
                <div className="text-[#8B7355B3] text-xs">收到回信</div>
              </div>
              <div className="text-center">
                <div className="text-[#E07B39] text-xl font-semibold mb-1">
                  25
                </div>
                <div className="text-[#8B7355B3] text-xs">收藏明信片</div>
              </div>
              <div className="text-center">
                <div className="text-[#E07B39] text-xl font-semibold mb-1">
                  12
                </div>
                <div className="text-[#8B7355B3] text-xs">通信角色</div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 功能入口 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-4 px-4"
        >
          <div className="bg-white/90 rounded-2xl p-4 backdrop-blur-sm">
            <div className="grid grid-cols-2 gap-4">
              <button className="bg-[#F4E4D699] flex flex-col items-center p-3 rounded-xl">
                <div className="w-8 h-8 bg-[#E07B39] rounded-full flex items-center justify-center mb-2">
                  <Heart className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[#3D2914E6] text-xs">我的收藏</span>
              </button>

              <button className="bg-[#F4E4D699] flex flex-col items-center p-3 rounded-xl">
                <div className="w-8 h-8 bg-[#8FBF47] rounded-full flex items-center justify-center mb-2">
                  <MessageCircle className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[#3D2914E6] text-xs">通信记录</span>
              </button>

              <button className="bg-[#F4E4D699] flex flex-col items-center p-3 rounded-xl">
                <div className="w-8 h-8 bg-[#F2CC8F] rounded-full flex items-center justify-center mb-2">
                  <FileText className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[#3D2914E6] text-xs">草稿箱</span>
              </button>

              <button className="bg-[#F4E4D699] flex flex-col items-center p-3 rounded-xl">
                <div className="w-8 h-8 bg-[#6B8CAE] rounded-full flex items-center justify-center mb-2">
                  <Palette className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-[#3D2914E6] text-xs">明信片模板</span>
              </button>
            </div>
          </div>
        </motion.section>

        {/* 设置选项 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-4 px-4"
        >
          <div className="bg-white/90 rounded-2xl p-4 backdrop-blur-sm">
            <h3 className="text-[#3D2914E6] text-sm font-semibold mb-3">
              设置
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Eye className="w-5 h-5 text-[#8B7355B3]" />
                  <span className="text-[#3D2914E6] text-xs">明信片可见性</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[#8B7355B3] text-[10px] mr-1">
                    公开
                  </span>
                  <ChevronRight className="w-2.5 h-2.5 text-[#8B7355B3]" />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Globe className="w-5 h-5 text-[#8B7355B3]" />
                  <span className="text-[#3D2914E6] text-xs">语言设置</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[#8B7355B3] text-[10px] mr-1">
                    中文
                  </span>
                  <ChevronRight className="w-2.5 h-2.5 text-[#8B7355B3]" />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Type className="w-5 h-5 text-[#8B7355B3]" />
                  <span className="text-[#3D2914E6] text-xs">字体大小</span>
                </div>
                <div className="flex items-center">
                  <span className="text-[#8B7355B3] text-[10px] mr-1">
                    标准
                  </span>
                  <ChevronRight className="w-2.5 h-2.5 text-[#8B7355B3]" />
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Moon className="w-5 h-5 text-[#8B7355B3]" />
                  <span className="text-[#3D2914E6] text-xs">深色模式</span>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`relative w-10 h-6 rounded-full transition-colors ${
                    darkMode ? "bg-[#E07B39]" : "bg-[#E6D5C3]"
                  }`}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                      darkMode ? "translate-x-5" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        </motion.section>

        {/* 帮助与支持 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mb-4 px-4"
        >
          <div className="bg-white/90 rounded-2xl p-4 backdrop-blur-sm">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-[#8B7355B3]" />
                  <span className="text-[#3D2914E6] text-xs">意见反馈</span>
                </div>
                <ChevronRight className="w-2.5 h-2.5 text-[#8B7355B3]" />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Headphones className="w-5 h-5 text-[#8B7355B3]" />
                  <span className="text-[#3D2914E6] text-xs">联系客服</span>
                </div>
                <ChevronRight className="w-2.5 h-2.5 text-[#8B7355B3]" />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Info className="w-5 h-5 text-[#8B7355B3]" />
                  <span className="text-[#3D2914E6] text-xs">关于我们</span>
                </div>
                <ChevronRight className="w-2.5 h-2.5 text-[#8B7355B3]" />
              </div>
            </div>
          </div>
        </motion.section>

        {/* 账户管理 */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="px-4"
        >
          <div className="bg-white/90 rounded-2xl p-4 backdrop-blur-sm">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-[#8B7355B3]" />
                  <span className="text-[#3D2914E6] text-xs">账户安全</span>
                </div>
                <ChevronRight className="w-2.5 h-2.5 text-[#8B7355B3]" />
              </div>

              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <LogOut className="w-5 h-5 text-[#D4614A]" />
                  <span className="text-[#D4614A] text-xs">退出登录</span>
                </div>
                <ChevronRight className="w-2.5 h-2.5 text-[#D4614A]" />
              </div>
            </div>
          </div>
        </motion.section>
      </main>
    </div>
  );
}
