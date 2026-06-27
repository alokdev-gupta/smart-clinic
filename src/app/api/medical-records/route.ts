import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, canPerform, forbidden } from "@/lib/rbac";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as string;

  try {
    const where: Record<string, unknown> = {};

    // DOCTOR: only see records where they are the treating doctor
    if (role === "DOCTOR") {
      const doctor = await prisma.doctor.findFirst({ where: { userId: session!.user.id } });
      if (doctor) where.doctorId = doctor.id;
      else return NextResponse.json([]);
    }

    // PATIENT: only see their own medical records
    if (role === "PATIENT") {
      const patient = await prisma.patient.findFirst({ where: { userId: session!.user.id } });
      if (patient) where.patientId = patient.id;
      else return NextResponse.json([]);
    }

    const records = await prisma.medicalRecord.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
        prescriptions: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(records);
  } catch (err) {
    console.error("[medical-records GET]", err);
    return NextResponse.json({ error: "Failed to fetch medical records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as string;

  // Only ADMIN and DOCTOR can create medical records
  if (role === "PATIENT") {
    return forbidden("Patients cannot create medical records");
  }

  try {
    const body = await req.json();
    const { patientId, doctorId, appointmentId, diagnosis, prescription, labResults, followUpDate, prescriptions } = body;

    if (!patientId || !doctorId || !appointmentId || !diagnosis) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const record = await prisma.medicalRecord.create({
      data: {
        patientId,
        doctorId,
        appointmentId,
        diagnosis,
        prescription: prescription || null,
        labResults: labResults || null,
        followUpDate: followUpDate ? new Date(followUpDate) : null,
        prescriptions: prescriptions?.length
          ? { create: prescriptions.map((p: { medicineName: string; dosage: string; duration: string; instructions?: string }) => ({
              medicineName: p.medicineName,
              dosage: p.dosage,
              duration: p.duration,
              instructions: p.instructions || null,
            })) }
          : undefined,
      },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
        prescriptions: true,
      },
    });

    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    console.error("[medical-records POST]", err);
    return NextResponse.json({ error: "Failed to create medical record" }, { status: 500 });
  }
}
