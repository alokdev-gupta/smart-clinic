import { NextResponse } from "next/server";
import { getDashboardStats } from "@/lib/data/dashboard";

export async function GET() {
  try {
    const stats = await getDashboardStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("[dashboard/stats] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
