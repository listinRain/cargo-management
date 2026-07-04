import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireWriteAccess } from "@/lib/auth-utils";
import * as XLSX from "xlsx";

export async function POST(req: NextRequest) {
  const { session, error } = await requireWriteAccess();
  if (error) return error;

  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ success: false, error: "未找到文件" }, { status: 400 });

    const bytes = await file.arrayBuffer();
    const workbook = XLSX.read(Buffer.from(bytes), { type: "buffer" });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet) as Record<string, string | number>[];

    // 读取列值（兼容列名中的空格和大小写差异）
    const getVal = (row: Record<string, string | number>, ...keys: string[]): string => {
      for (const k of keys) {
        if (row[k] !== undefined) return String(row[k] ?? "").trim();
      }
      return "";
    };
    const getNum = (row: Record<string, string | number>, fallback = 0, ...keys: string[]): number => {
      const v = getVal(row, ...keys);
      if (!v) return fallback;
      const n = parseFloat(v);
      return isNaN(n) ? fallback : n;
    };

    let created = 0;
    let skipped = 0;
    let inventoryAdded = 0;

    for (const row of rows) {
      const name = getVal(row, "名称", "name");
      if (!name) continue;

      const code = getVal(row, "编码", "code");
      if (!code) { skipped++; continue; }

      // 检查编码是否已存在
      const existing = await prisma.product.findUnique({ where: { code } });
      if (existing) { skipped++; continue; }

      const product = await prisma.product.create({
        data: {
          name,
          code,
          specification: getVal(row, "规格", "specification") || null,
          unit: getVal(row, "单位", "unit") || "pcs",
          unitPrice: getNum(row, 0, "单价", "unitPrice"),
          minStock: getNum(row, 0, "最低库存", "minStock"),
          maxStock: getNum(row, 0, "最高库存", "maxStock"),
          barcode: getVal(row, "条码", "barcode") || null,
          remark: getVal(row, "备注", "remark") || null,
        },
      });
      created++;

      // 如果提供了初始数量，自动创建入库单
      const initialQty = getNum(row, 0, "初始数量", "初始库存", "数量", "quantity");
      if (initialQty > 0) {
        const warehouseName = getVal(row, "仓库", "入库仓库", "warehouse");
        const locationName = getVal(row, "库位", "入库库位", "location");

        if (warehouseName && locationName) {
          // 查找或创建默认仓库和库位
          let warehouse = await prisma.warehouse.findFirst({ where: { name: warehouseName } });
          if (!warehouse) {
            warehouse = await prisma.warehouse.create({
              data: { name: warehouseName, code: `WH-${warehouseName.substring(0, 4).toUpperCase()}` },
            });
          }

          let location = await prisma.location.findFirst({
            where: { name: locationName, warehouseId: warehouse.id },
          });
          if (!location) {
            location = await prisma.location.create({
              data: { name: locationName, code: locationName, warehouseId: warehouse.id },
            });
          }

          const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
          const suffix = Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 4).toUpperCase();
          const orderNo = `IMPORT-${dateStr}-${suffix}`;

          await prisma.$transaction(async (tx) => {
            await tx.inboundOrder.create({
              data: {
                orderNo,
                type: "PURCHASE",
                status: "CONFIRMED",
                handlerId: session.user.id,
                inboundDate: new Date(),
                remark: "数据导入 - 初始库存",
                totalAmount: initialQty * product.unitPrice,
                items: {
                  create: {
                    productId: product.id,
                    quantity: initialQty,
                    unitPrice: product.unitPrice,
                    totalPrice: initialQty * product.unitPrice,
                    warehouseId: warehouse.id,
                    locationId: location.id,
                  },
                },
              },
            });

            const existingInv = await tx.inventory.findFirst({
              where: {
                productId: product.id,
                warehouseId: warehouse.id,
                locationId: location.id,
              },
            });
            if (existingInv) {
              await tx.inventory.update({
                where: { id: existingInv.id },
                data: { quantity: existingInv.quantity + initialQty },
              });
            } else {
              await tx.inventory.create({
                data: {
                  productId: product.id,
                  warehouseId: warehouse.id,
                  locationId: location.id,
                  quantity: initialQty,
                },
              });
            }

            await tx.transactionLog.create({
              data: {
                productId: product.id,
                type: "INBOUND",
                referenceNo: orderNo,
                quantity: initialQty,
                beforeQuantity: 0,
                afterQuantity: initialQty,
                warehouseId: warehouse.id,
                locationId: location.id,
                operatorId: session.user.id,
                remark: "数据导入 - 初始库存",
              },
            });
          });

          inventoryAdded++;
        }
      }
    }

    return NextResponse.json({
      success: true,
      created,
      skipped,
      inventoryAdded,
      message: `成功导入 ${created} 个货物${skipped > 0 ? `，跳过 ${skipped} 个重复` : ""}${inventoryAdded > 0 ? `，为 ${inventoryAdded} 个货物添加了初始库存` : ""}`,
    });
  } catch (e) {
    console.error("导入失败:", e);
    return NextResponse.json({ success: false, error: "导入失败，请检查文件格式是否正确" }, { status: 500 });
  }
}
