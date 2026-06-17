import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/appointments/[id]">
) {
  try {
    const { id } = await ctx.params;
    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { name: true, email: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
        medicalRecord: { include: { prescriptions: true } },
        invoice: true,
      },
    });
    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }
    return NextResponse.json(appointment);
  } catch (error) {
    console.error("[appointments/[id] GET]", error);
    return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/appointments/[id]">
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const { status, notes, reason } = body;

    const appointment = await prisma.appointment.update({
      where: { id },
      data: {
        status: status ?? undefined,
        notes: notes ?? undefined,
        reason: reason ?? undefined,
      },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });
    return NextResponse.json(appointment);
  } catch (error) {
    console.error("[appointments/[id] PUT]", error);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/appointments/[id]">
) {
  try {
    const { id } = await ctx.params;
    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[appointments/[id] DELETE]", error);
    return NextResponse.json({ error: "Failed to delete appointment" }, { status: 500 });
  }
}
