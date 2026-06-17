import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const records = await prisma.medicalRecord.findMany({
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
        prescriptions: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(records);
  } catch (error) {
    console.error("[medical-records GET]", error);
    return NextResponse.json({ error: "Failed to fetch medical records" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
  } catch (error) {
    console.error("[medical-records POST]", error);
    return NextResponse.json({ error: "Failed to create medical record" }, { status: 500 });
  }
}
