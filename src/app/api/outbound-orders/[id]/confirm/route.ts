export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";
import { logAudit } from "@/lib/audit";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  const order = await prisma.outboundOrder.findUnique({
    where: { id: params.id },
    include: { items: true },
  });
  if (!order) return NextResponse.json({ success: false, error: "Not found" }, { status: 404 });
  if (order.status !== "DRAFT") return NextResponse.json({ success: false, error: "订单已确认" }, { status: 400 });

  try {
    await prisma.$transaction(async (tx) => {
      // Validate stock inside transaction to prevent TOCTOU race condition
      for (const item of order.items) {
        const inv = await tx.inventory.findFirst({
          where: { productId: item.productId, warehouseId: item.warehouseId, locationId: item.locationId },
        });
        const currentQty = inv?.quantity || 0;
        if (currentQty < item.quantity) {
          throw new Error("库存不足");
        }
      }

      for (const item of order.items) {
        const inv = await tx.inventory.findFirst({
          where: { productId: item.productId, warehouseId: item.warehouseId, locationId: item.locationId },
        });

        const beforeQty = inv?.quantity || 0;
        const afterQty = beforeQty - item.quantity;

        await tx.inventory.update({
          where: { id: inv!.id },
          data: { quantity: afterQty },
        });

        await tx.transactionLog.create({
          data: {
            productId: item.productId, type: "OUTBOUND", referenceNo: order.orderNo,
            quantity: -item.quantity, beforeQuantity: beforeQty, afterQuantity: afterQty,
            warehouseId: item.warehouseId, locationId: item.locationId,
            operatorId: session.user.id, remark: `出库: ${order.orderNo}`,
          },
        });

        // Low stock alert
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (product && afterQty <= product.minStock && product.minStock > 0) {
          const admins = await tx.user.findMany({ where: { role: { in: ["ADMIN", "WAREHOUSE_MANAGER"] } } });
          for (const admin of admins) {
            await tx.notification.create({
              data: { userId: admin.id, title: "低库存预警", message: `${product.name} 库存仅剩 ${afterQty}，低于下限 ${product.minStock}`, type: "LOW_STOCK", relatedId: product.id },
            });
          }
        }
      }

      await tx.outboundOrder.update({ where: { id: params.id }, data: { status: "CONFIRMED" } });
    });
  } catch (e) {
    return NextResponse.json({ success: false, error: (e as Error).message || "库存不足" }, { status: 400 });
  }

  await logAudit({
    userId: session.user.id,
    action: "CONFIRM",
    entity: "OutboundOrder",
    entityId: params.id,
    newValue: JSON.stringify({ orderNo: order.orderNo, items: order.items.length }),
  });

  return NextResponse.json({ success: true, message: "出库已确认，库存已更新" });
}
