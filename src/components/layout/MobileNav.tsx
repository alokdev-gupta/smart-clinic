"use client";

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

interface MobileNavProps {
  userName?: string | null;
  userRole?: string | null;
}

export default function MobileNav({ userName, userRole }: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close sheet on route change
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="p-2 -ml-2 mr-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors">
          <Menu className="h-6 w-6" />
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 w-64 border-r-0" style={{ background: "#0F172A" }}>
        <Sidebar userName={userName} userRole={userRole} isMobile />
      </SheetContent>
    </Sheet>
  );
}
