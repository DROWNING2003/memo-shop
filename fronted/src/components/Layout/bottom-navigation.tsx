"use client";

import React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Home, Users, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  {
    icon: Home,
    label: "首页",
    href: "/home",
    activePattern: /^\/home/
  },
  {
    icon: Users,
    label: "角色",
    href: "/characters",
    activePattern: /^\/characters/
  },
  {
    icon: User,
    label: "我的",
    href: "/profile",
    activePattern: /^\/profile/
  }
];

export function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const handleCreatePostcard = () => {
    router.push("/postcards/create");
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-t border-border/50">
      <div className="flex items-center justify-around px-4 py-2 max-w-md mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const isActive = item.activePattern.test(pathname);
          
          return (
            <button
              key={item.href}
              onClick={() => router.push(item.href)}
              className={cn(
                "flex flex-col items-center space-y-1 py-2 px-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn(
                "w-5 h-5",
                isActive && "scale-110"
              )} />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
        
        {/* 中间的创建按钮 */}
        <Button
          onClick={handleCreatePostcard}
          size="icon"
          className="w-12 h-12 rounded-full neumorphism healing-gradient-green shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}