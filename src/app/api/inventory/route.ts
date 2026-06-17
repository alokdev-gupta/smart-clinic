import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const items = await prisma.inventory.findMany({
      orderBy: { itemName: "asc" },
    });
    return NextResponse.json(items);
  } catch (error) {
    console.error("[inventory GET]", error);
    return NextResponse.json({ error: "Failed to fetch inventory" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
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
  } catch (error) {
    console.error("[inventory POST]", error);
    return NextResponse.json({ error: "Failed to create inventory item" }, { status: 500 });
  }
}
