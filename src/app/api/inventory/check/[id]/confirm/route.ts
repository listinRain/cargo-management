import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  const check = await prisma.inventoryCheck.findUnique({
    where: { id: params.id },
    include: { items: true, warehouse: true },
  });
  if (!check) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });

  await prisma.$transaction(async (tx) => {
    for (const item of check.items) {
      if (item.actualQuantity !== item.bookQuantity) {
        // Find and update inventory
        const inv = await tx.inventory.findFirst({
          where: { productId: item.productId, locationId: item.locationId, warehouseId: check.warehouseId },
        });
        if (inv) {
          await tx.inventory.update({
            where: { id: inv.id },
            data: { quantity: item.actualQuantity },
          });
        }

        // Create transaction log
        await tx.transactionLog.create({
          data: {
            productId: item.productId,
            type: "CHECK_ADJUSTMENT",
            referenceNo: check.checkNo,
            quantity: item.difference,
            beforeQuantity: item.bookQuantity,
            afterQuantity: item.actualQuantity,
            warehouseId: check.warehouseId,
            locationId: item.locationId,
            operatorId: session.user.id,
            remark: `盘点调整: ${check.checkNo}`,
          },
        });
      }
    }
    await tx.inventoryCheck.update({ where: { id: params.id }, data: { status: "CONFIRMED" } });
  });

  return NextResponse.json({ success: true, message: "盘点已确认，库存已更新" });
}
