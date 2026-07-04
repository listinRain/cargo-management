import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + 1); // 周一
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [productCount, inventoryRaw, inboundToday, outboundToday, inboundMonth, outboundMonth] =
    await Promise.all([
      prisma.product.count({ where: { status: "ACTIVE" } }),
      prisma.inventory.findMany({ include: { product: true } }),
      // 今日入库单
      prisma.inboundOrder.count({
        where: { status: "CONFIRMED", updatedAt: { gte: todayStart } },
      }),
      // 今日出库单
      prisma.outboundOrder.count({
        where: { status: "CONFIRMED", updatedAt: { gte: todayStart } },
      }),
      // 本月入库单
      prisma.inboundOrder.count({
        where: { status: "CONFIRMED", updatedAt: { gte: monthStart } },
      }),
      // 本月出库单
      prisma.outboundOrder.count({
        where: { status: "CONFIRMED", updatedAt: { gte: monthStart } },
      }),
    ]);

  const totalQuantity = inventoryRaw.reduce((s, i) => s + i.quantity, 0);
  const totalValue = inventoryRaw.reduce((s, i) => s + i.quantity * i.product.unitPrice, 0);
  const lowStockCount = inventoryRaw.filter(
    (i) => i.product.minStock > 0 && i.quantity <= i.product.minStock
  ).length;
  const overstockCount = inventoryRaw.filter(
    (i) => i.product.maxStock > 0 && i.quantity >= i.product.maxStock
  ).length;

  const recentInbound = await prisma.inboundOrder.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      supplier: { select: { name: true } },
      handler: { select: { name: true } },
      _count: { select: { items: true } },
    },
  });

  const recentOutbound = await prisma.outboundOrder.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      customer: { select: { name: true } },
      department: { select: { name: true } },
      handler: { select: { name: true } },
      _count: { select: { items: true } },
    },
  });

  const recentLogs = await prisma.transactionLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { name: true } },
      operator: { select: { name: true } },
    },
  });

  return NextResponse.json({
    success: true,
    data: {
      stats: {
        productCount,
        totalQuantity,
        totalValue,
        lowStockCount,
        overstockCount,
        inboundToday,
        outboundToday,
        inboundMonth,
        outboundMonth,
      },
      recentInbound,
      recentOutbound,
      recentLogs,
    },
  });
}
