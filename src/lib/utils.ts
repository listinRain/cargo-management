import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format as dateFnsFormat } from "date-fns";
import { zhCN } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 日期格式化。底层使用 date-fns，支持所有 date-fns 格式模式。
 * 默认: yyyy-MM-dd
 */
export function formatDate(date: Date | string, fmt: string = "yyyy-MM-dd"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return dateFnsFormat(d, fmt, { locale: zhCN });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("zh-CN", {
    style: "currency",
    currency: "CNY",
  }).format(amount);
}
