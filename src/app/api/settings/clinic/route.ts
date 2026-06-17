import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    let settings = await prisma.clinicSettings.findUnique({
      where: { id: "default" },
    });

    if (!settings) {
      // Create default if not exists
      settings = await prisma.clinicSettings.create({
        data: {
          id: "default",
          name: "ClinicOS",
          address: "Biratnagar-1, Koshi Province, Nepal",
          phone: "021-555555",
          email: "clinic@clinicos.com",
          website: "www.clinicos.com",
        },
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error("[settings/clinic] GET error:", error);
    return NextResponse.json(
      { error: "Failed to fetch clinic settings" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, address, phone, email, website } = body;

    const settings = await prisma.clinicSettings.upsert({
      where: { id: "default" },
      update: { name, address, phone, email, website },
      create: {
        id: "default",
        name,
        address,
        phone,
        email,
        website,
      },
    });

    return NextResponse.json(settings);
  } catch (error: any) {
    console.error("[settings/clinic] POST error:", error);
    return NextResponse.json(
      { error: "Failed to update clinic settings", details: error.message || String(error) },
      { status: 500 }
    );
  }
}
