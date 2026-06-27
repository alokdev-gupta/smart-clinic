import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireRole } from "@/lib/rbac";

// Inventory is ADMIN-only for all operations
export async function GET() {
  const { session, error } = await requireRole(["ADMIN"]);
  if (error) return error;

  try {
    const items = await prisma.inventory.findMany({
      orderBy: { itemName: "asc" },
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error("[inventory GET]", err);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireRole(["ADMIN"]);
  if (error) return error;

  try {
    const body = await req.json();
    const { itemName, category, quantity, unit, reorderLevel, expiryDate, supplier, costPerUnit } = body;

    if (!itemName || !category || quantity === undefined || !unit || reorderLevel === undefined || costPerUnit === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const item = await prisma.inventory.create({
      data: {
        itemName,
        category,
        quantity: Number(quantity),
        unit,
        reorderLevel: Number(reorderLevel),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        supplier: supplier || null,
        costPerUnit: Number(costPerUnit),
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error("[inventory POST]", err);
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 });
  }
}
