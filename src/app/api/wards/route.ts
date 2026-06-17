import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const wards = await prisma.ward.findMany({
      include: {
        beds: {
          include: {
            patient: { include: { user: { select: { name: true } } } },
          },
          orderBy: { bedNumber: "asc" },
        },
      },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(wards);
  } catch (error) {
    console.error("[wards GET]", error);
    return NextResponse.json({ error: "Failed to fetch wards" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, floor, totalBeds, type } = body;

    if (!name || floor === undefined || !totalBeds || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const bedsCount = Number(totalBeds);

    const ward = await prisma.$transaction(async (tx: any) => {
      const createdWard = await tx.ward.create({
        data: {
          name,
          floor: Number(floor),
          totalBeds: bedsCount,
          availableBeds: bedsCount,
          type,
        },
      });

      // Auto-create beds
      const bedsData = Array.from({ length: bedsCount }).map((_, i) => ({
        wardId: createdWard.id,
        bedNumber: `B-${i + 1}`,
        isOccupied: false,
      }));

      await tx.bed.createMany({ data: bedsData });

      return tx.ward.findUnique({
        where: { id: createdWard.id },
        include: { beds: true },
      });
    });

    return NextResponse.json(ward, { status: 201 });
  } catch (error) {
    console.error("[wards POST]", error);
    return NextResponse.json({ error: "Failed to create ward" }, { status: 500 });
  }
}
