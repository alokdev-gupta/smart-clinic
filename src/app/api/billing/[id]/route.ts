import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth, canPerform, forbidden } from "@/lib/rbac";

export async function GET(
  _req: NextRequest,
  ctx: RouteContext<"/api/billing/[id]">
) {
  const { session, error } = await requireAuth();
  if (error) return error;

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

    // PATIENT can only view their own invoices
    const role = session!.user.role as string;
    if (role === "PATIENT") {
      const patient = await prisma.patient.findFirst({ where: { userId: session!.user.id } });
      if (!patient || invoice.patientId !== patient.id) {
        return forbidden("You can only view your own invoices");
      }
    }

    return NextResponse.json(invoice);
  } catch (err) {
    console.error("[billing/[id] GET]", err);
    return NextResponse.json({ error: "Failed to fetch invoice" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/billing/[id]">
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  // Only ADMIN can update invoices
  if (session!.user.role !== "ADMIN") {
    return forbidden("Only admins can update invoices");
  }

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
  } catch (err) {
    console.error("[billing/[id] PUT]", err);
    return NextResponse.json({ error: "Failed to update invoice" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/billing/[id]">
) {
  const { session, error } = await requireAuth();
  if (error) return error;

  // Only ADMIN can delete invoices
  if (!canPerform(session!.user.role as string, "delete")) {
    return forbidden("Only admins can delete invoices");
  }

  try {
    const { id } = await ctx.params;
    await prisma.invoice.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[billing/[id] DELETE]", err);
    return NextResponse.json({ error: "Failed to delete invoice" }, { status: 500 });
  }
}
