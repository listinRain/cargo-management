import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean up existing data
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.transactionLog.deleteMany();
  await prisma.inventoryCheckItem.deleteMany();
  await prisma.inventoryCheck.deleteMany();
  await prisma.outboundOrderItem.deleteMany();
  await prisma.outboundOrder.deleteMany();
  await prisma.inboundOrderItem.deleteMany();
  await prisma.inboundOrder.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.location.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.department.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("123456", 12);

  // Users
  const admin = await prisma.user.create({
    data: {
      name: "系统管理员",
      email: "admin@example.com",
      password: passwordHash,
      role: "ADMIN",
      phone: "13800000001",
    },
  });

  const manager = await prisma.user.create({
    data: {
      name: "仓管员张三",
      email: "manager@example.com",
      password: passwordHash,
      role: "WAREHOUSE_MANAGER",
      phone: "13800000002",
    },
  });

  const viewer = await prisma.user.create({
    data: {
      name: "查看者李四",
      email: "viewer@example.com",
      password: passwordHash,
      role: "VIEWER",
      phone: "13800000003",
    },
  });

  // Categories (3-level tree)
  const electronics = await prisma.category.create({
    data: { name: "电子产品", code: "ELEC", level: 1, sortOrder: 1 },
  });
  const computers = await prisma.category.create({
    data: { name: "电脑", code: "ELEC-COMP", parentId: electronics.id, level: 2, sortOrder: 1 },
  });
  await prisma.category.create({
    data: { name: "笔记本", code: "ELEC-COMP-LAP", parentId: computers.id, level: 3, sortOrder: 1 },
  });
  await prisma.category.create({
    data: { name: "台式机", code: "ELEC-COMP-DESK", parentId: computers.id, level: 3, sortOrder: 2 },
  });
  const accessories = await prisma.category.create({
    data: { name: "配件", code: "ELEC-ACC", parentId: electronics.id, level: 2, sortOrder: 2 },
  });

  const rawMaterials = await prisma.category.create({
    data: { name: "原材料", code: "RAW", level: 1, sortOrder: 2 },
  });
  await prisma.category.create({
    data: { name: "金属材料", code: "RAW-METAL", parentId: rawMaterials.id, level: 2, sortOrder: 1 },
  });

  const finishedGoods = await prisma.category.create({
    data: { name: "成品", code: "FIN", level: 1, sortOrder: 3 },
  });

  // Warehouses and Locations
  const mainWh = await prisma.warehouse.create({
    data: { name: "主仓库", code: "WH-MAIN", address: "总部A栋1楼" },
  });
  const locA1 = await prisma.location.create({
    data: { name: "A区-1号货架", code: "A-01", warehouseId: mainWh.id },
  });
  const locA2 = await prisma.location.create({
    data: { name: "A区-2号货架", code: "A-02", warehouseId: mainWh.id },
  });
  const locB1 = await prisma.location.create({
    data: { name: "B区-1号货架", code: "B-01", warehouseId: mainWh.id },
  });

  const secondWh = await prisma.warehouse.create({
    data: { name: "备用仓库", code: "WH-BAK", address: "总部B栋2楼" },
  });
  const locC1 = await prisma.location.create({
    data: { name: "C区-1号货架", code: "C-01", warehouseId: secondWh.id },
  });

  // Suppliers
  const supplier1 = await prisma.supplier.create({
    data: { name: "深圳科技有限公司", code: "SUP-001", contactPerson: "王经理", phone: "0755-12345678", email: "wang@sztech.com", address: "深圳市南山区" },
  });
  const supplier2 = await prisma.supplier.create({
    data: { name: "北京电子器材公司", code: "SUP-002", contactPerson: "赵主管", phone: "010-87654321", email: "zhao@bjelec.com", address: "北京市海淀区" },
  });

  // Customers
  const customer1 = await prisma.customer.create({
    data: { name: "上海贸易有限公司", code: "CUS-001", contactPerson: "刘总", phone: "021-11112222" },
  });
  const customer2 = await prisma.customer.create({
    data: { name: "广州零售企业", code: "CUS-002", contactPerson: "陈经理", phone: "020-33334444" },
  });

  // Departments
  const dept1 = await prisma.department.create({
    data: { name: "生产部", code: "DEPT-PROD" },
  });
  const dept2 = await prisma.department.create({
    data: { name: "行政部", code: "DEPT-ADMIN" },
  });

  // Products
  const p1 = await prisma.product.create({
    data: { name: "ThinkPad X1 Carbon", code: "SKU-001", specification: "14寸/i7/16GB/512GB", unit: "台", unitPrice: 8999, categoryId: computers.id, minStock: 5, maxStock: 100, barcode: "BAR-001", remark: "高端商务笔记本" },
  });
  const p2 = await prisma.product.create({
    data: { name: "Logitech MX Master 3S", code: "SKU-002", specification: "无线蓝牙鼠标/黑色", unit: "个", unitPrice: 699, categoryId: accessories.id, minStock: 10, maxStock: 200, barcode: "BAR-002" },
  });
  const p3 = await prisma.product.create({
    data: { name: "铝合金板材", code: "SKU-003", specification: "6061-T6/2mm*1200mm*2400mm", unit: "张", unitPrice: 350, categoryId: rawMaterials.id, minStock: 20, maxStock: 500 },
  });
  const p4 = await prisma.product.create({
    data: { name: "USB-C Hub", code: "SKU-004", specification: "7合1/Type-C转HDMI+USB3.0", unit: "个", unitPrice: 199, categoryId: accessories.id, minStock: 15, maxStock: 300, barcode: "BAR-004" },
  });
  const p5 = await prisma.product.create({
    data: { name: "机械键盘 K8 Pro", code: "SKU-005", specification: "87键/红轴/RGB背光", unit: "个", unitPrice: 599, categoryId: accessories.id, minStock: 8, maxStock: 150, barcode: "BAR-005" },
  });

  // Inventory
  await prisma.inventory.createMany({
    data: [
      { productId: p1.id, warehouseId: mainWh.id, locationId: locA1.id, quantity: 25 },
      { productId: p2.id, warehouseId: mainWh.id, locationId: locA2.id, quantity: 50 },
      { productId: p3.id, warehouseId: mainWh.id, locationId: locB1.id, quantity: 200 },
      { productId: p4.id, warehouseId: mainWh.id, locationId: locA2.id, quantity: 8 },
      { productId: p5.id, warehouseId: mainWh.id, locationId: locA1.id, quantity: 5 },
      { productId: p1.id, warehouseId: secondWh.id, locationId: locC1.id, quantity: 3 },
    ],
  });

  console.log("Seed completed successfully!");
  console.log("---");
  console.log("Admin: admin@example.com / 123456");
  console.log("Manager: manager@example.com / 123456");
  console.log("Viewer: viewer@example.com / 123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
