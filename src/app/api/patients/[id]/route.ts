import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, canPerform, forbidden } from "@/lib/rbac";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/patients/[id]">
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { id } = await ctx.params;
    const role = session!.user.role as string;

    // PATIENT can only fetch their own record
    if (role === "PATIENT") {
      const ownPatient = await prisma.patient.findFirst({
        where: { user: { id: session!.user.id } },
      });
      if (!ownPatient || ownPatient.id !== id) {
        return forbidden("You can only view your own patient record");
      }
    }

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, email: true, role: true, createdAt: true } },
        appointments: {
          include: { doctor: { include: { user: { select: { name: true } } } } },
          orderBy: { date: "desc" },
        },
        medicalRecords: {
          include: { doctor: { include: { user: { select: { name: true } } } }, prescriptions: true },
          orderBy: { createdAt: "desc" },
        },
        invoices: { orderBy: { issuedAt: "desc" } },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }
    return NextResponse.json(patient);
  } catch (err) {
    console.error("[patients/[id] GET]", err);
    return NextResponse.json({ error: "Failed to fetch patient" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/patients/[id]">
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as string;
  if (!canPerform(role, "write")) return forbidden();

  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const { name, phone, address, emergencyContact, medicalHistory } = body;

    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    // PATIENT can only update their own record
    if (role === "PATIENT") {
      const ownPatient = await prisma.patient.findFirst({
        where: { user: { id: session!.user.id } },
      });
      if (!ownPatient || ownPatient.id !== id) {
        return forbidden("You can only update your own profile");
      }
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      if (name) {
        await tx.user.update({ where: { id: patient.userId }, data: { name } });
      }
      return tx.patient.update({
        where: { id },
        data: {
          phone: phone ?? undefined,
          address: address ?? undefined,
          emergencyContact: emergencyContact ?? undefined,
          medicalHistory: medicalHistory ?? undefined,
        },
        include: { user: { select: { id: true, name: true, email: true, role: true, createdAt: true } } },
      });
    });

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[patients/[id] PUT]", err);
    return NextResponse.json({ error: "Failed to update patient" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/patients/[id]">
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  // Only ADMIN can delete patients
  if (!canPerform(session!.user.role as string, "delete")) {
    return forbidden("Only admins can delete patients");
  }

  try {
    const { id } = await ctx.params;
    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    await prisma.$transaction(async (tx: any) => {
      // 1. Delete prescriptions inside medical records
      const records = await tx.medicalRecord.findMany({ where: { patientId: id }, select: { id: true } });
      if (records.length > 0) {
        await tx.prescription.deleteMany({ where: { medicalRecordId: { in: records.map((r: any) => r.id) } } });
      }

      // 2. Delete medical records
      await tx.medicalRecord.deleteMany({ where: { patientId: id } });

      // 3. Delete invoice items then invoices
      const invoices = await tx.invoice.findMany({ where: { patientId: id }, select: { id: true } });
      if (invoices.length > 0) {
        await tx.invoiceItem.deleteMany({ where: { invoiceId: { in: invoices.map((inv: any) => inv.id) } } });
      }
      await tx.invoice.deleteMany({ where: { patientId: id } });

      // 4. Delete appointments
      await tx.appointment.deleteMany({ where: { patientId: id } });

      // 5. Delete patient record
      await tx.patient.delete({ where: { id } });

      // 6. Delete user account
      await tx.user.delete({ where: { id: patient.userId } });
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[patients/[id] DELETE]", err);
    return NextResponse.json({ error: "Failed to delete patient" }, { status: 500 });
  }
}
