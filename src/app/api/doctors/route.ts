import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    const doctors = await prisma.doctor.findMany({
      include: { user: { select: { id: true, name: true, email: true, role: true, createdAt: true } } },
      orderBy: { user: { name: "asc" } },
    });
    return NextResponse.json(doctors);
  } catch (error) {
    console.error("[doctors GET]", error);
    return NextResponse.json({ error: "Failed to fetch doctors" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, specialization, licenseNumber, experience, consultationFee } = body;

    if (!name || !email || !specialization || !licenseNumber) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const licenseExists = await prisma.doctor.findUnique({ where: { licenseNumber } });
    if (licenseExists) {
      return NextResponse.json({ error: "License number already registered" }, { status: 409 });
    }

    const generatedPassword = Math.random().toString(36).slice(-12) + "A1!";
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);

    const doctor = await prisma.$transaction(async (tx: any) => {
      const user = await tx.user.create({
        data: { name, email, password: hashedPassword, role: "DOCTOR" },
      });
      return tx.doctor.create({
        data: {
          userId: user.id,
          specialization,
          licenseNumber,
          experience: Number(experience) || 0,
          consultationFee: Number(consultationFee) || 0,
        },
        include: { user: { select: { id: true, name: true, email: true, role: true, createdAt: true } } },
      });
    });

    return NextResponse.json(doctor, { status: 201 });
  } catch (error) {
    console.error("[doctors POST]", error);
    return NextResponse.json({ error: "Failed to create doctor" }, { status: 500 });
  }
}
