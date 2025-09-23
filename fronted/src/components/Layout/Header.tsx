import { LogoIcon, SmallLogoIcon } from "@/components/Icon"
import { HeaderRoomInfo, HeaderActions } from "./HeaderComponents"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Users } from "lucide-react"

export default function Header(props: { className?: string }) {
  const { className } = props
  return (
    <>
      {/* Header */}
      <header
        className={cn(
          "flex items-center justify-between bg-[#181a1d] p-2 md:p-4",
          className,
        )}
      >
        <div className="flex items-center space-x-4">
          {/* <LogoIcon className="hidden h-5 md:block" />
          <SmallLogoIcon className="block h-4 md:hidden" /> */}
          <h1 className="text-sm font-bold md:text-xl">TEN Agent</h1>
          <Link 
            href="/character-square"
            className="flex items-center space-x-1 text-sm text-gray-300 hover:text-white transition-colors"
          >
            <Users className="w-4 h-4" />
            <span className="hidden md:inline">角色广场</span>
          </Link>
        </div>
        <HeaderRoomInfo />
        <HeaderActions />
      </header>
    </>
  )
}
