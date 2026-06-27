import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import { requireAuth } from "@/lib/rbac";

export async function GET(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status");
    const date = searchParams.get("date");
    const role = session!.user.role as string;

    const where: Record<string, unknown> = {};
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      where.date = { gte: startOfDay(d), lte: endOfDay(d) };
    }

    // DOCTOR: only see their own appointments
    if (role === "DOCTOR") {
      const doctor = await prisma.doctor.findFirst({ where: { userId: session!.user.id } });
      if (doctor) where.doctorId = doctor.id;
      else return NextResponse.json([]);
    }

    // PATIENT: only see their own appointments
    if (role === "PATIENT") {
      const patient = await prisma.patient.findFirst({ where: { userId: session!.user.id } });
      if (patient) where.patientId = patient.id;
      else return NextResponse.json([]);
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
      orderBy: [{ date: "desc" }, { time: "asc" }],
    });
    return NextResponse.json(appointments);
  } catch (err) {
    console.error("[appointments GET]", err);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  // All authenticated roles can create appointments
  try {
    const body = await req.json();
    const { patientId, doctorId, date, time, reason } = body;

    if (!patientId || !doctorId || !date || !time) {
      return NextResponse.json({ error: "Patient, doctor, date and time are required" }, { status: 400 });
    }

    const apptDate = new Date(date);

    // Check for double-booking
    const conflict = await prisma.appointment.findFirst({
      where: {
        doctorId,
        time,
        date: { gte: startOfDay(apptDate), lte: endOfDay(apptDate) },
        status: { not: "CANCELLED" },
      },
    });

    if (conflict) {
      return NextResponse.json(
        { error: "Doctor already has an appointment at this time. Please choose a different slot." },
        { status: 409 }
      );
    }

    const appointment = await prisma.appointment.create({
      data: {
        patientId,
        doctorId,
        date: apptDate,
        time,
        reason: reason || null,
        status: "PENDING",
      },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        doctor: { include: { user: { select: { name: true } } } },
      },
    });

    return NextResponse.json(appointment, { status: 201 });
  } catch (err) {
    console.error("[appointments POST]", err);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
