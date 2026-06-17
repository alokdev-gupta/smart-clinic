import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const patients = await prisma.patient.findMany({
      include: { user: { select: { id: true, name: true, email: true, role: true, createdAt: true } } },
      orderBy: { user: { name: "asc" } },
    });
    return NextResponse.json(patients);
  } catch (error) {
    console.error("[patients GET]", error);
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name, email,
      dateOfBirth, gender, bloodGroup,
      phone, address, medicalHistory,
    } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Auto-generate a random password for patient accounts
    const autoPassword = Math.random().toString(36).slice(-10) + "P@1";
    const hashedPassword = await bcrypt.hash(autoPassword, 10);

    const patient = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: { name, email, password: hashedPassword, role: "PATIENT" },
      });
      return tx.patient.create({
        data: {
          userId: user.id,
          dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
          gender: gender || null,
          bloodGroup: bloodGroup || null,
          phone: phone || null,
          address: address || null,
          emergencyContact: null,
          medicalHistory: medicalHistory || null,
        },
        include: { user: { select: { id: true, name: true, email: true, role: true, createdAt: true } } },
      });
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error("[patients POST]", error);
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}
