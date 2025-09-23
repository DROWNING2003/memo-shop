"use client";

import React from "react";
import { motion } from "motion/react";
import { Store, Mail, User, Plus } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const navigationItems = [
  {
    icon: Store,
    label: "角色广场",
    path: "/character-square",
    key: "character-square",
  },
  {
    icon: Mail,
    label: "明信片广场",
    path: "/postcard-square",
    key: "postcard-square",
  },
  {
    icon: User,
    label: "个人中心",
    path: "/profile",
    key: "profile",
  },
];

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  // 判断当前页面是否激活
  const isActive = (path: string) => {
    if (path === "/character-square") {
      return (
        pathname === "/character-square" ||
        pathname.startsWith("/character-detail")
      );
    }
    return pathname === path || pathname.startsWith(path);
  };

  // 处理导航点击
  const handleNavClick = (path: string) => {
    router.push(path);
  };

  // 处理快捷创建角色
  const handleQuickCreate = () => {
    router.push("/create-character");
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="fixed bottom-0 w-full flex flex-col z-50"
    >
      <div className="bg-[#FFFBF7] border-t border-[#F7E7CE]">
        <nav className="flex justify-around items-center px-1 py-4 relative">
          {navigationItems.map((item) => (
            <motion.div
              key={item.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavClick(item.path)}
              className="flex flex-col flex-1 items-center gap-1 cursor-pointer"
            >
              <div className="w-6 h-6 flex items-center justify-center">
                <item.icon
                  className={`w-5 h-5 transition-colors ${
                    isActive(item.path)
                      ? "text-[#3D2914E6]"
                      : "text-[#A68B6B80]"
                  }`}
                />
              </div>
              <span
                className={`text-[10px] transition-colors ${
                  isActive(item.path) ? "text-[#3D2914E6]" : "text-[#A68B6B80]"
                }`}
              >
                {item.label}
              </span>
            </motion.div>
          ))}

          {/* 快捷创建角色按钮 */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleQuickCreate}
            className="absolute right-4 -top-24 w-12 h-12 bg-[#E07B39] rounded-full shadow-lg flex items-center justify-center"
          >
            <Plus className="w-6 h-6 text-white" />
          </motion.button>
        </nav>
        <div className="h-[env(safe-area-inset-bottom)]"></div>
      </div>
    </motion.div>
  );
}
