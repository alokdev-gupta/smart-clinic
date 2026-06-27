import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, forbidden } from "@/lib/rbac";

export async function GET() {
  const { session, error } = await requireAuth();
  if (error) return error;

  const role = session!.user.role as string;

  try {
    const where: Record<string, unknown> = {};

    // PATIENT: only see their own invoices
    if (role === "PATIENT") {
      const patient = await prisma.patient.findFirst({ where: { userId: session!.user.id } });
      if (patient) where.patientId = patient.id;
      else return NextResponse.json([]);
    }

    // DOCTOR: not normally needed, but allow read
    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        patient: { include: { user: { select: { name: true, email: true } } } },
        appointment: {
          include: { doctor: { include: { user: { select: { name: true } } } } },
        },
      },
      orderBy: { issuedAt: "desc" },
    });
    return NextResponse.json(invoices);
  } catch (err) {
    console.error("[billing GET]", err);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireAuth();
  if (error) return error;

  // Only ADMIN can create invoices
  if (session!.user.role !== "ADMIN") {
    return forbidden("Only admins can create invoices");
  }

  try {
    const body = await req.json();
    const { appointmentId, patientId, amount, tax, paymentMethod } = body;

    if (!appointmentId || !patientId || amount === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const calculatedTax = Number(tax) || 0;
    const baseAmount = Number(amount);
    const total = baseAmount + (baseAmount * calculatedTax) / 100;

    const invoice = await prisma.invoice.create({
      data: {
        appointmentId,
        patientId,
        amount: baseAmount,
        tax: calculatedTax,
        total,
        paymentMethod: paymentMethod || null,
        status: paymentMethod ? "PAID" : "PENDING",
      },
      include: {
        patient: { include: { user: { select: { name: true } } } },
        appointment: {
          include: { doctor: { include: { user: { select: { name: true } } } } },
        },
      },
    });

    return NextResponse.json(invoice, { status: 201 });
  } catch (err) {
    console.error("[billing POST]", err);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
