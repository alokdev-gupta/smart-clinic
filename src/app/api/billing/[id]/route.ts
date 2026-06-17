import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/billing/[id]">
) {
  try {
    const { id } = await ctx.params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        patient: { include: { user: { select: { name: true, email: true } } } },
        appointment: {
          include: { doctor: { include: { user: { select: { name: true } } } } },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }
    return NextResponse.json(invoice);
  } catch (error) {
    console.error("[billing/[id] GET]", error);
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/billing/[id]">
) {
  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const { status, paymentMethod } = body;

    const invoice = await prisma.invoice.update({
      where: { id },
      data: {
        status: status ?? undefined,
        paymentMethod: paymentMethod ?? undefined,
      },
      include: {
        patient: { include: { user: { select: { name: true } } } },
      },
    });
    return NextResponse.json(invoice);
  } catch (error) {
    console.error("[billing/[id] PUT]", error);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/billing/[id]">
) {
  try {
    const { id } = await ctx.params;
    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[billing/[id] DELETE]", error);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
