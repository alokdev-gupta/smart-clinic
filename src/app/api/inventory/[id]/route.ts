import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

// Inventory ADMIN-only operations
export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/inventory/[id]">
) {
  const { error } = await requireRole(["ADMIN"]);
  if (error) return error;

  try {
    const { id } = await ctx.params;
    const body = await req.json();
    const { itemName, category, quantity, unit, reorderLevel, expiryDate, supplier, costPerUnit } = body;

    const item = await prisma.inventory.update({
      where: { id },
      data: {
        itemName: itemName ?? undefined,
        category: category ?? undefined,
        quantity: quantity !== undefined ? Number(quantity) : undefined,
        unit: unit ?? undefined,
        reorderLevel: reorderLevel !== undefined ? Number(reorderLevel) : undefined,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        supplier: supplier !== undefined ? supplier : undefined,
        costPerUnit: costPerUnit !== undefined ? Number(costPerUnit) : undefined,
      },
    });

    return NextResponse.json(item);
  } catch (err) {
    console.error("[inventory/[id] PUT]", err);
    return NextResponse.json({ error: "Failed to update inventory item" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/inventory/[id]">
) {
  const { error } = await requireRole(["ADMIN"]);
  if (error) return error;

  try {
    const { id } = await ctx.params;
    await prisma.inventory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[inventory/[id] DELETE]", err);
    return NextResponse.json({ error: "Failed to delete inventory item" }, { status: 500 });
  }
}
