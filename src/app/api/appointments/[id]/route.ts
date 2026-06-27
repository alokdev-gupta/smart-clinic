import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, canPerform, forbidden } from "@/lib/rbac";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/appointments/[id]">
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await ctx.params;
    const role = session!.user.role as string;

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

    // DOCTOR: only own appointments
    if (role === "DOCTOR") {
      const doctor = await prisma.doctor.findFirst({ where: { userId: session!.user.id } });
      if (!doctor || appointment.doctorId !== doctor.id) {
        return forbidden("You can only view your own appointments");
      }
    }

    // PATIENT: only own appointments
    if (role === "PATIENT") {
      const patient = await prisma.patient.findFirst({ where: { userId: session!.user.id } });
      if (!patient || appointment.patientId !== patient.id) {
        return forbidden("You can only view your own appointments");
      }
    }

    return NextResponse.json(appointment);
  } catch (err) {
    console.error("[appointments/[id] GET]", err);
    return NextResponse.json({ error: "Failed to fetch appointment" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/appointments/[id]">
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as string;
  if (!canPerform(role, "write")) return forbidden();

  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const { status, notes, reason } = body;

    const existing = await prisma.appointment.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // DOCTOR: can only update their own appointments
    if (role === "DOCTOR") {
      const doctor = await prisma.doctor.findFirst({ where: { userId: session!.user.id } });
      if (!doctor || existing.doctorId !== doctor.id) {
        return forbidden("You can only update your own appointments");
      }
    }

    // PATIENT: can only cancel their own appointments
    if (role === "PATIENT") {
      const patient = await prisma.patient.findFirst({ where: { userId: session!.user.id } });
      if (!patient || existing.patientId !== patient.id) {
        return forbidden("You can only update your own appointments");
      }
    }

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
  } catch (err) {
    console.error("[appointments/[id] PUT]", err);
    return NextResponse.json({ error: "Failed to update appointment" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/appointments/[id]">
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  // Only ADMIN can delete appointments
  if (!canPerform(session!.user.role as string, "delete")) {
    return forbidden("Only admins can delete appointments");
  }

  try {
    const { id } = await ctx.params;
    await prisma.appointment.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[appointments/[id] DELETE]", err);
    return NextResponse.json({ error: "Failed to delete appointment" }, { status: 500 });
  }
}
