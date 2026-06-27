"use client";

import { useSidebar } from "./SidebarContext";

export default function SidebarShift({ children }: { children: React.ReactNode }) {
  const { isOpen } = useSidebar();

  return (
    <div
      className="flex flex-col flex-1 min-h-screen overflow-hidden transition-all duration-300"
      style={{ marginLeft: isOpen ? "256px" : "0px" }}
    >
      {children}
    </div>
  );
}
