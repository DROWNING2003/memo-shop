// import { ConfigProvider } from "antd";
import { StoreProvider } from "@/store"
import type { Metadata, Viewport } from "next"
import { Toaster } from "@/components/ui/sonner"

import "./global.css"

export const metadata: Metadata = {
  title: "回忆明信片",
  description:
    "如果回忆有声音，你会和谁聊天？用AI技术把回忆变成明信片，和TA分享你的故事。",
  icons: {
    icon: "/logo.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black",
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
}

import { ThemeProvider } from "@/components/theme-provider"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
          <StoreProvider>{children}</StoreProvider>
          <Toaster richColors closeButton />
        </ThemeProvider>
      </body>
    </html>
  )
}
