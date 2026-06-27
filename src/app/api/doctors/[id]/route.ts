import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, canPerform, forbidden } from "@/lib/rbac";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/doctors/[id]">
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await ctx.params;
    const doctor = await prisma.doctor.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
        appointments: {
          include: { patient: { include: { user: { select: { name: true } } } } },
          orderBy: { date: "desc" },
        },
        medicalRecords: {
          include: { patient: { include: { user: { select: { name: true } } } } },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }
    return NextResponse.json(doctor);
  } catch (err) {
    console.error("[doctors/[id] GET]", err);
    return NextResponse.json({ error: "Failed to fetch doctor" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/doctors/[id]">
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as string;
  if (!canPerform(role, "write")) return forbidden();

  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const { name, specialization, experience, consultationFee } = body;

    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }

    // DOCTOR can only update their own profile
    if (role === "DOCTOR") {
      if (doctor.userId !== session!.user.id) {
        return forbidden("You can only update your own profile");
      }
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      if (name) {
        await tx.user.update({ where: { id: doctor.userId }, data: { name } });
      }
      return tx.doctor.update({
        where: { id },
        data: {
          specialization: specialization ?? undefined,
          experience: experience !== undefined ? Number(experience) : undefined,
          consultationFee: consultationFee !== undefined ? Number(consultationFee) : undefined,
        },
        include: { user: { select: { id: true, name: true, email: true, role: true, createdAt: true } } },
      });
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[doctors/[id] PUT]", err);
    return NextResponse.json({ error: "Failed to update doctor" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/doctors/[id]">
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  // Only ADMIN can delete doctors
  if (!canPerform(session!.user.role as string, "delete")) {
    return forbidden("Only admins can delete doctors");
  }

  try {
    const { id } = await ctx.params;
    const doctor = await prisma.doctor.findUnique({ where: { id } });
    if (!doctor) {
      return NextResponse.json({ error: "Doctor not found" }, { status: 404 });
    }
    await prisma.user.delete({ where: { id: doctor.userId } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[doctors/[id] DELETE]", err);
    return NextResponse.json({ error: "Failed to delete doctor" }, { status: 500 });
  }
}
