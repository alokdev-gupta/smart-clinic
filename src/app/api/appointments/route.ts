import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const doctorId = searchParams.get("doctorId");
    const status = searchParams.get("status");
    const date = searchParams.get("date");

    const where: Record<string, unknown> = {};
    if (doctorId) where.doctorId = doctorId;
    if (status) where.status = status;
    if (date) {
      const d = new Date(date);
      where.date = { gte: startOfDay(d), lte: endOfDay(d) };
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
  } catch (error) {
    console.error("[appointments GET]", error);
    return NextResponse.json({ error: "Failed to fetch appointments" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
  } catch (error) {
    console.error("[appointments POST]", error);
    return NextResponse.json({ error: "Failed to create appointment" }, { status: 500 });
  }
}
