import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { requireAuth, canPerform, forbidden } from "@/lib/rbac";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as string;

  try {
    // PATIENT can only see their own record
    if (role === "PATIENT") {
      const patient = await prisma.patient.findFirst({
        where: { user: { id: session!.user.id } },
        include: { user: { select: { id: true, name: true, email: true, role: true, createdAt: true } } },
      });
      return NextResponse.json(patient ? [patient] : []);
    }

    // ADMIN and DOCTOR can see all patients
    const patients = await prisma.patient.findMany({
      include: { user: { select: { id: true, name: true, email: true, role: true, createdAt: true } } },
      orderBy: { user: { name: "asc" } },
    });
    return NextResponse.json(patients);
  } catch (err) {
    console.error("[patients GET]", err);
    return NextResponse.json({ error: "Failed to fetch patients" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  // Only ADMIN can register new patients
  if (!canPerform(session!.user.role as string, "write") || session!.user.role !== "ADMIN") {
    return forbidden("Only admins can register new patients");
  }

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
  } catch (err) {
    console.error("[patients POST]", err);
    return NextResponse.json({ error: "Failed to create patient" }, { status: 500 });
  }
}
