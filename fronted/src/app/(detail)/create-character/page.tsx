"use client";

import React, { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Upload,
  Sparkles,
  Save,
  Mic,
  Camera,
  FileText,
  User,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateCharacterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    avatar: "",
    voice: "",
    characterDescription: "",
    userRoleDescription: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    // 这里可以添加保存逻辑
    console.log("保存角色:", formData);
    router.push("/character-square");
  };

  const handleFileUpload = (field: string) => {
    // 这里处理文件上传逻辑
    console.log(`上传${field}`);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      {/* 固定头部 */}
      <div className="fixed top-0 w-full z-10 bg-[#FAF6F0]">
        <div className="h-[env(safe-area-inset-top)]"></div>
        <header className="flex justify-between items-center h-14 px-6">
          <button
            onClick={() => router.back()}
            className="flex items-center justify-center w-6 h-6 hover:bg-black/5 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-[#3D2914E6]" />
          </button>
          <h1 className="text-xl font-semibold text-[#3D2914E6]">创建角色</h1>
          <button
            onClick={handleSave}
            className="flex items-center justify-center w-8 h-8 hover:bg-black/5 rounded-full transition-colors"
          >
            <Save className="w-5 h-5 text-[#E07B39]" />
          </button>
        </header>
      </div>

      {/* 占位空间 */}
      <div>
        <div className="h-[env(safe-area-inset-top)]"></div>
        <div className="h-14"></div>
      </div>

      <main className="pt-4 pb-24">
        <div className="px-4 space-y-6">
          {/* 角色照片上传 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="bg-white/90 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <Camera className="w-5 h-5 text-[#E07B39]" />
                <h3 className="text-lg font-semibold text-[#3D2914E6]">
                  角色照片
                </h3>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-[#F7E7CE] rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden">
                  {formData.avatar ? (
                    <img
                      src={formData.avatar}
                      alt="角色照片"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Camera className="w-12 h-12 text-[#E07B39]" />
                  )}
                </div>
                <button
                  onClick={() => handleFileUpload("avatar")}
                  className="flex items-center gap-2 bg-[#E07B39] text-white px-6 py-3 rounded-full text-sm hover:bg-[#D06B29] transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  上传角色照片
                </button>
                <p className="text-[#8B7355B3] text-xs mt-2">
                  支持 JPG、PNG 格式，建议尺寸 512x512
                </p>
              </div>
            </div>
          </motion.section>

          {/* 角色声音上传 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="bg-white/90 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <Mic className="w-5 h-5 text-[#E07B39]" />
                <h3 className="text-lg font-semibold text-[#3D2914E6]">
                  角色声音
                </h3>
              </div>
              <div className="space-y-4">
                {formData.voice ? (
                  <div className="bg-[#F7E7CE] rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-[#E07B39] rounded-full flex items-center justify-center">
                          <Mic className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="text-[#3D2914E6] text-sm font-medium">
                            角色声音文件
                          </p>
                          <p className="text-[#8B7355B3] text-xs">已上传</p>
                        </div>
                      </div>
                      <button className="text-[#E07B39] text-sm">
                        重新上传
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-[#F7E7CE] rounded-xl p-8 text-center">
                    <Mic className="w-12 h-12 text-[#E07B39] mx-auto mb-4" />
                    <button
                      onClick={() => handleFileUpload("voice")}
                      className="bg-[#E07B39] text-white px-6 py-3 rounded-full text-sm hover:bg-[#D06B29] transition-colors"
                    >
                      上传声音文件
                    </button>
                    <p className="text-[#8B7355B3] text-xs mt-2">
                      支持 MP3、WAV 格式，建议时长 10-30 秒
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* 角色描述 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="bg-white/90 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <FileText className="w-5 h-5 text-[#E07B39]" />
                <h3 className="text-lg font-semibold text-[#3D2914E6]">
                  角色描述
                </h3>
              </div>
              <textarea
                value={formData.characterDescription}
                onChange={(e) =>
                  handleInputChange("characterDescription", e.target.value)
                }
                placeholder="详细描述角色的性格、背景、说话方式、行为特点等，这将帮助AI更好地扮演这个角色..."
                rows={6}
                className="w-full bg-[#F7E7CE] border-0 rounded-xl px-4 py-3 text-[#3D2914] placeholder:text-[#8B7355B3] focus:outline-none focus:ring-2 focus:ring-[#E07B39] resize-none"
              />
              <p className="text-[#8B7355B3] text-xs mt-2">
                建议 100-500 字，描述越详细，角色表现越生动
              </p>
            </div>
          </motion.section>

          {/* 用户角色描述 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="bg-white/90 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-4">
                <User className="w-5 h-5 text-[#E07B39]" />
                <h3 className="text-lg font-semibold text-[#3D2914E6]">
                  用户扮演角色
                </h3>
              </div>
              <textarea
                value={formData.userRoleDescription}
                onChange={(e) =>
                  handleInputChange("userRoleDescription", e.target.value)
                }
                placeholder="描述用户在对话中扮演的角色，比如：朋友、学生、访客、粉丝等，以及相应的背景设定..."
                rows={4}
                className="w-full bg-[#F7E7CE] border-0 rounded-xl px-4 py-3 text-[#3D2914] placeholder:text-[#8B7355B3] focus:outline-none focus:ring-2 focus:ring-[#E07B39] resize-none"
              />
              <p className="text-[#8B7355B3] text-xs mt-2">
                设定用户身份有助于创造更自然的对话体验
              </p>
            </div>
          </motion.section>
        </div>
      </main>

      {/* 底部操作栏 */}
      <div className="fixed bottom-0 w-full bg-[#FFFBF7] border-t border-[#F7E7CE] p-4">
        <button
          onClick={handleSave}
          className="w-full bg-[#E07B39] text-white py-4 px-6 rounded-full font-medium hover:bg-[#D06B29] transition-colors flex items-center justify-center gap-2"
        >
          <Sparkles className="w-5 h-5" />
          创建角色
        </button>
        <div className="h-[env(safe-area-inset-bottom)]"></div>
      </div>
    </div>
  );
}
