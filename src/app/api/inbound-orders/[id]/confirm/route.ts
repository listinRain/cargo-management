export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";
import { logAudit } from "@/lib/audit";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  const order = await prisma.inboundOrder.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  if (order.status !== "DRAFT") return NextResponse.json({ success: false, error: "订单已确认" }, { status: 400 });

  await prisma.$transaction(async (tx) => {
    for (const item of order.items) {
      const existing = await tx.inventory.findFirst({
        where: { productId: item.productId, warehouseId: item.warehouseId, locationId: item.locationId },
      });

      const beforeQty = existing?.quantity || 0;
      const afterQty = beforeQty + item.quantity;

      if (existing) {
        await tx.inventory.update({
          where: { id: existing.id },
          data: { quantity: afterQty },
        });
      } else {
        await tx.inventory.create({
          data: { productId: item.productId, warehouseId: item.warehouseId, locationId: item.locationId, quantity: item.quantity },
        });
      }

      await tx.transactionLog.create({
        data: {
          productId: item.productId, type: "INBOUND", referenceNo: order.orderNo,
          quantity: item.quantity, beforeQuantity: beforeQty, afterQuantity: afterQty,
          warehouseId: item.warehouseId, locationId: item.locationId,
          operatorId: session.user.id, remark: `入库: ${order.orderNo}`,
        },
      });

      // Stock alert check
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (product && afterQty >= product.maxStock && product.maxStock > 0) {
        const admins = await tx.user.findMany({ where: { role: { in: ["ADMIN", "WAREHOUSE_MANAGER"] } } });
        for (const admin of admins) {
          await tx.notification.create({
            data: { userId: admin.id, title: "超库存预警", message: `${product.name} 库存已达 ${afterQty}，超过上限 ${product.maxStock}`, type: "OVERSTOCK", relatedId: product.id },
          });
        }
      }
    }

    await tx.inboundOrder.update({ where: { id: params.id }, data: { status: "CONFIRMED" } });
  });

  await logAudit({
    userId: session.user.id,
    action: "CONFIRM",
    entity: "InboundOrder",
    entityId: params.id,
    newValue: JSON.stringify({ orderNo: order.orderNo, items: order.items.length }),
  });

  return NextResponse.json({ success: true, message: "入库已确认，库存已更新" });
}
