import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const invoices = await prisma.invoice.findMany({
      include: {
        patient: { include: { user: { select: { name: true, email: true } } } },
        appointment: {
          include: { doctor: { include: { user: { select: { name: true } } } } },
        },
      },
      orderBy: { issuedAt: "desc" },
    });
    return NextResponse.json(invoices);
  } catch (error) {
    console.error("[billing GET]", error);
    return NextResponse.json({ error: "Failed to fetch invoices" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
  } catch (error) {
    console.error("[billing POST]", error);
    return NextResponse.json({ error: "Failed to create invoice" }, { status: 500 });
  }
}
