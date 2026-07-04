export const ROLES = {
  ADMIN: "ADMIN",
  WAREHOUSE_MANAGER: "WAREHOUSE_MANAGER",
  VIEWER: "VIEWER",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "管理员",
  WAREHOUSE_MANAGER: "仓管员",
  VIEWER: "只读查看者",
};

export const ORDER_STATUS = {
  DRAFT: "DRAFT",
  CONFIRMED: "CONFIRMED",
  COMPLETED: "COMPLETED",
  CANCELLED: "CANCELLED",
} as const;

export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  DRAFT: "草稿",
  CONFIRMED: "已确认",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

export const INBOUND_TYPES = {
  PURCHASE: "PURCHASE",
  RETURN: "RETURN",
  PRODUCTION: "PRODUCTION",
} as const;

export const INBOUND_TYPE_LABELS: Record<string, string> = {
  PURCHASE: "采购入库",
  RETURN: "退货入库",
  PRODUCTION: "生产入库",
};

export const OUTBOUND_TYPES = {
  SALES: "SALES",
  INTERNAL: "INTERNAL",
} as const;

export const OUTBOUND_TYPE_LABELS: Record<string, string> = {
  SALES: "销售出库",
  INTERNAL: "领用出库",
};

export const TRANSACTION_TYPES = {
  INBOUND: "INBOUND",
  OUTBOUND: "OUTBOUND",
  CHECK_ADJUSTMENT: "CHECK_ADJUSTMENT",
} as const;

export const TRANSACTION_TYPE_LABELS: Record<string, string> = {
  INBOUND: "入库",
  OUTBOUND: "出库",
  CHECK_ADJUSTMENT: "盘点调整",
};

export const NOTIFICATION_TYPES = {
  LOW_STOCK: "LOW_STOCK",
  OVERSTOCK: "OVERSTOCK",
  ORDER_STATUS: "ORDER_STATUS",
  SYSTEM: "SYSTEM",
} as const;
