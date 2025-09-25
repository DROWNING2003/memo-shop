import { LogoIcon, SmallLogoIcon } from "@/components/Icon";
import { HeaderRoomInfo, HeaderActions } from "./HeaderComponents";
import { cn } from "@/lib/utils";

export default function Header(props: { className?: string }) {
  const { className } = props;
  return (
    <>
      {/* Header */}
      <header
        className={cn("glass-container-primary p-4 rounded-b-2xl", className)}
      >
     
          <div className="flex items-center justify-between">
            <h1 className="text-lg font-semibold text-primary-custom">
              语音聊天
            </h1>
            {/* <HeaderRoomInfo /> */}
            <div className="flex items-center justify-center space-x-2">
              <HeaderActions />
            </div>
          </div>
      </header>
    </>
  );
}
