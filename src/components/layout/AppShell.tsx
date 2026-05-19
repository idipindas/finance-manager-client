import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

declare const __APP_VERSION__: string;
declare const __BUILD_DATE__: string;

export default function AppShell() {
  return (
    <div className="flex min-h-dvh bg-bg-base">
      {/* Mobile: draggable strip for window-controls-overlay */}
      <div className="md:hidden fixed top-0 inset-x-0 h-[env(titlebar-area-height,0px)] bg-bg-base z-50 [-webkit-app-region:drag] [app-region:drag]" />

      {/* Version badge — sits just below the titlebar area */}
      <div
        className="fixed right-3 z-50"
        style={{ top: "calc(env(titlebar-area-height, 0px) + 8px)" }}
      >
        <span className="flex items-center gap-1 text-[11px] font-mono font-semibold text-text-muted bg-bg-elevated border border-border px-2 py-0.5 rounded-full shadow-sm">
          v{__APP_VERSION__}
          <span className="text-border">·</span>
          <span className="text-[10px] font-normal">{__BUILD_DATE__}</span>
        </span>
      </div>

      <Sidebar />
      <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
