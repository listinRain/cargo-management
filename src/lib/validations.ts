import { z } from "zod";

// ============ 认证 ============

export const loginSchema = z.object({
  email: z.string().email("请输入有效的邮箱"),
  password: z.string().min(1, "请输入密码"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "姓名至少2个字符"),
  email: z.string().email("请输入有效的邮箱"),
  password: z.string().min(6, "密码至少6个字符"),
});

// ============ 货物 ============

export const productSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  code: z.string().min(1, "编码不能为空"),
  specification: z.string().nullable().optional(),
  unit: z.string().default("pcs"),
  unitPrice: z.number().min(0).default(0),
  categoryId: z.string().nullable().optional(),
  minStock: z.number().min(0).default(0),
  maxStock: z.number().min(0).default(0),
  remark: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  barcode: z.string().nullable().optional(),
});

// ============ 分类 ============

export const categorySchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  code: z.string().nullable().optional(),
  parentId: z.string().nullable().optional(),
  level: z.number().default(1),
  sortOrder: z.number().default(0),
});

// ============ 仓库 ============

export const warehouseSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  code: z.string().min(1, "编码不能为空"),
  address: z.string().nullable().optional(),
  manager: z.string().nullable().optional(),
});

// ============ 库位 ============

export const locationSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  code: z.string().min(1, "编码不能为空"),
  warehouseId: z.string().min(1, "仓库不能为空"),
});

// ============ 供应商 ============

export const supplierSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  code: z.string().nullable().optional(),
  contactPerson: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  remark: z.string().nullable().optional(),
});

// ============ 客户 / 部门 ============

export const customerSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  code: z.string().nullable().optional(),
  contactPerson: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  remark: z.string().nullable().optional(),
});

export const departmentSchema = z.object({
  name: z.string().min(1, "名称不能为空"),
  code: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
});

// ============ 入库单 ============

export const inboundOrderItemSchema = z.object({
  productId: z.string().min(1, "货物不能为空"),
  quantity: z.number().positive("数量必须大于0"),
  unitPrice: z.number().min(0).default(0),
  warehouseId: z.string().min(1, "仓库不能为空"),
  locationId: z.string().min(1, "库位不能为空"),
});

export const inboundOrderSchema = z.object({
  type: z.string().default("PURCHASE"),
  supplierId: z.string().nullable().optional(),
  inboundDate: z.string().optional(),
  remark: z.string().nullable().optional(),
  items: z.array(inboundOrderItemSchema).min(1, "至少需要一个货物明细"),
});

// ============ 出库单 ============

export const outboundOrderItemSchema = z.object({
  productId: z.string().min(1, "货物不能为空"),
  quantity: z.number().positive("数量必须大于0"),
  unitPrice: z.number().min(0).default(0),
  warehouseId: z.string().min(1, "仓库不能为空"),
  locationId: z.string().min(1, "库位不能为空"),
});

export const outboundOrderSchema = z.object({
  type: z.string().default("SALES"),
  customerId: z.string().nullable().optional(),
  departmentId: z.string().nullable().optional(),
  outboundDate: z.string().optional(),
  remark: z.string().nullable().optional(),
  items: z.array(outboundOrderItemSchema).min(1, "至少需要一个货物明细"),
});

// ============ 盘点 ============

export const inventoryCheckItemSchema = z.object({
  productId: z.string().min(1, "货物不能为空"),
  locationId: z.string().min(1, "库位不能为空"),
  bookQuantity: z.number().default(0),
  actualQuantity: z.number().default(0),
  remark: z.string().nullable().optional(),
});

export const inventoryCheckSchema = z.object({
  warehouseId: z.string().min(1, "仓库不能为空"),
  checkDate: z.string().optional(),
  remark: z.string().nullable().optional(),
  items: z.array(inventoryCheckItemSchema).min(1, "至少需要一个盘点明细"),
});

// ============ 用户（管理员创建/编辑） ============

export const userSchema = z.object({
  name: z.string().min(1, "姓名不能为空"),
  email: z.string().email("请输入有效的邮箱"),
  password: z.string().optional(),
  role: z.string().default("VIEWER"),
  phone: z.string().nullable().optional(),
});

// ============ 个人设置 ============

export const profileSchema = z.object({
  name: z.string().min(1, "姓名不能为空"),
  phone: z.string().nullable().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "请输入当前密码"),
  newPassword: z.string().min(6, "新密码至少6个字符"),
  changePassword: z.literal(true),
});

// ============ 辅助函数 ============

/** 返回第一个校验错误的中文消息，否则 null */
export function getValidationError<T>(schema: z.ZodSchema<T>, data: unknown): string | null {
  const result = schema.safeParse(data);
  if (!result.success) {
    return result.error.issues[0]?.message ?? "输入数据无效";
  }
  return null;
}
