"use client";

import React from "react";
import { motion } from "motion/react";
import { Mail, Users, User } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";

const navigationItems = [
  {
    icon: Mail,
    label: "我的明信片",
    path: "/home",
    key: "home"
  },
  {
    icon: Users,
    label: "明信片广场",
    path: "/square",
    key: "square"
  },
  {
    icon: Users,
    label: "角色广场",
    path: "/characters",
    key: "characters"
  },
  {
    icon: User,
    label: "个人中心",
    path: "/profile",
    key: "profile"
  },
];

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  // 判断当前页面是否激活
  const isActive = (path: string) => {
    if (path === "/home") {
      return pathname === "/home" || pathname === "/";
    }
    if (path === "/characters") {
      return (
        pathname === "/characters" ||
        pathname.startsWith("/character-detail") ||
        pathname === "/character-square"
      );
    }
    if (path === "/profile") {
      return pathname === "/profile" || pathname.startsWith("/profile");
    }
    return pathname === path || pathname.startsWith(path);
  };

  // 处理导航点击
  const handleNavClick = (path: string) => {
    router.push(path);
  };

  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3 }}
      className="fixed bottom-0 w-full flex flex-col z-50"
    >
      <div className="bg-white border-t border-gray-100">
        <nav className="flex justify-around pt-standard px-1 pb-standard">
          {navigationItems.map((item) => (
            <motion.div
              key={item.key}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNavClick(item.path)}
              className="flex flex-col flex-1 items-center gap-1 cursor-pointer"
            >
              <div className="flex justify-center items-center w-6 h-6">
                <item.icon
                  className={`w-5 h-5 ${
                    isActive(item.path)
                      ? "text-primary-base"
                      : "color-text-quaternary"
                  }`}
                />
              </div>
              <span
                className={`text-caption ${
                  isActive(item.path) ? "text-primary-base" : "color-text-quaternary"
                }`}
              >
                {item.label}
              </span>
            </motion.div>
          ))}
        </nav>
        <div style={{ height: 'env(safe-area-inset-bottom)' }}></div>
      </div>
    </motion.div>
  );
}
