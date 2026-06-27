import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import { SidebarProvider } from "@/components/layout/SidebarContext";
import SidebarShift from "@/components/layout/SidebarShift";

const ALLOWED_ROLES = ["ADMIN", "DOCTOR", "PATIENT"];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || !ALLOWED_ROLES.includes(session.user.role ?? "")) {
    redirect("/login");
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden" style={{ background: "#F8FAFC" }}>
        {/* Sidebar */}
        <Sidebar userName={session.user.name} userRole={session.user.role} />

        {/* Main content area — shifts right when sidebar is open */}
        <SidebarShift>
          {/* Top Header */}
          <Header
            userName={session.user.name}
            userRole={session.user.role}
          />

          {/* Scrollable page content */}
          <main
            className="flex-1 overflow-y-auto p-6"
            style={{ background: "#F8FAFC" }}
          >
            {children}
          </main>
        </SidebarShift>
      </div>
    </SidebarProvider>
  );
}
