import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/data/dashboard";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = await getDashboardStats(session.user.id, session.user.role);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[dashboard/stats] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
