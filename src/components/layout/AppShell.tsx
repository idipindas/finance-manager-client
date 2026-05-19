import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

export default function AppShell() {
  return (
    <div className="flex min-h-dvh bg-bg-base">
      {/* Mobile: thin draggable strip at top for window-controls-overlay */}
      <div className="md:hidden fixed top-0 inset-x-0 h-[env(titlebar-area-height,0px)] bg-bg-base z-50 [-webkit-app-region:drag] [app-region:drag]" />
      <Sidebar />
      <main className="flex-1 overflow-x-hidden pb-20 md:pb-0">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
