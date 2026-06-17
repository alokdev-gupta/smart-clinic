import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  ctx: RouteContext<"/api/inventory/[id]">
) {
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
  } catch (error) {
    console.error("[inventory/[id] PUT]", error);
    return NextResponse.json({ error: "Failed to update inventory item" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  ctx: RouteContext<"/api/inventory/[id]">
) {
  try {
    const { id } = await ctx.params;
    await prisma.inventory.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[inventory/[id] DELETE]", error);
    return NextResponse.json({ error: "Failed to delete inventory item" }, { status: 500 });
  }
}
