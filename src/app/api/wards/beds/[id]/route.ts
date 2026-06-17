import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/wards/beds/[id]">
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const { action, patientId } = body;

    if (action !== "admit" && action !== "discharge") {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (action === "admit" && !patientId) {
      return NextResponse.json({ error: "Patient ID required for admission" }, { status: 400 });
    }

    const bed = await prisma.bed.findUnique({ where: { id } });
    if (!bed) return NextResponse.json({ error: "Bed not found" }, { status: 404 });

    if (action === "admit" && bed.isOccupied) {
      return NextResponse.json({ error: "Bed is already occupied" }, { status: 409 });
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      const updatedBed = await tx.bed.update({
        where: { id },
        data: {
          isOccupied: action === "admit",
          patientId: action === "admit" ? patientId : null,
        },
      });

      // Update ward available beds count
      await tx.ward.update({
        where: { id: bed.wardId },
        data: {
          availableBeds: {
            [action === "admit" ? "decrement" : "increment"]: 1,
          },
        },
      });

      return updatedBed;
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[wards/beds/[id] PUT]", error);
    return NextResponse.json({ error: "Failed to update bed status" }, { status: 500 });
  }
}
