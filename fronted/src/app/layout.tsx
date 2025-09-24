// import { ConfigProvider } from "antd";
import { StoreProvider } from "@/store"
import type { Metadata, Viewport } from "next"
import { Toaster } from "@/components/ui/sonner"

import "./global.css"

export const metadata: Metadata = {
  title: "TEN Agent | Real-Time Multimodal AI Agent",
  description:
    "TEN Agent is an open-source multimodal AI agent that can speak, see, and access a knowledge base(RAG).",
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
