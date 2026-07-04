import { prisma } from "./prisma";

/**
 * 写入一条审计日志。
 */
export async function logAudit(params: {
  userId: string;
  action: string;
  entity: string;
  entityId?: string;
  oldValue?: string;
  newValue?: string;
  ip?: string;
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId ?? null,
        oldValue: params.oldValue ?? null,
        newValue: params.newValue ?? null,
        ip: params.ip ?? null,
      },
    });
  } catch {
    // 审计日志写入失败不应影响主业务
  }
}
