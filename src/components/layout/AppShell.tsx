import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

declare const __APP_VERSION__: string;

export default function AppShell() {
  return (
    <div className="flex min-h-dvh bg-bg-base">
      {/* Mobile: thin draggable strip at top for window-controls-overlay */}
      <div className="md:hidden fixed top-0 inset-x-0 h-[env(titlebar-area-height,0px)] bg-bg-base z-50 [-webkit-app-region:drag] [app-region:drag]" />

      {/* Version badge — top right, always visible */}
      <div className="fixed top-2 right-3 z-50 pointer-events-none">
        <span className="text-[10px] font-mono font-medium text-text-muted/60 bg-bg-card/80 border border-border/50 px-1.5 py-0.5 rounded-full backdrop-blur-sm">
          v{__APP_VERSION__}
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
