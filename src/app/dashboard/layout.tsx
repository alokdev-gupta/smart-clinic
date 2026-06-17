import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

const pageTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/patients": "Patients",
  "/dashboard/doctors": "Doctors",
  "/dashboard/appointments": "Appointments",
  "/dashboard/medical-records": "Medical Records",
  "/dashboard/billing": "Billing",
  "/dashboard/inventory": "Inventory",
  "/dashboard/wards": "Wards",
  "/dashboard/settings": "Settings",
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "#F8FAFC" }}>
      {/* Main content area */}
      <div className="flex flex-col flex-1 ml-0 min-h-screen overflow-hidden">
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
      </div>
    </div>
  );
}
