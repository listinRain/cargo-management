"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react";

export interface Column<T> {
  key: string;
  header: string;
  className?: string;
  headerClassName?: string;
  sortable?: boolean;
  render?: (row: T, index: number) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  loading?: boolean;
  emptyMessage?: string;
  /** 当前页码 */
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onSort?: (key: string, direction: "asc" | "desc") => void;
  sortKey?: string;
  sortDir?: "asc" | "desc";
  onRowClick?: (row: T) => void;
  rowClassName?: string | ((row: T) => string);
}

/**
 * 通用数据表格组件。
 * 支持排序、分页、行点击、自定义列渲染、加载/空状态。
 */
export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField = "id",
  loading = false,
  emptyMessage = "暂无数据",
  page,
  totalPages,
  onPageChange,
  onSort,
  sortKey,
  sortDir,
  onRowClick,
  rowClassName,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={cn("text-left px-4 py-3 font-medium", col.headerClassName)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i} className="animate-pulse">
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-3">
                    <div className="h-4 bg-muted rounded w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground border rounded-lg">
        <p>{emptyMessage}</p>
      </div>
    );
  }

  const renderSortIcon = (col: Column<T>) => {
    if (!col.sortable) return null;
    if (sortKey === col.key) {
      return sortDir === "asc" ? (
        <ChevronUp className="h-3 w-3 ml-1 inline" />
      ) : (
        <ChevronDown className="h-3 w-3 ml-1 inline" />
      );
    }
    return <ChevronsUpDown className="h-3 w-3 ml-1 inline text-muted-foreground/50" />;
  };

  return (
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "text-left px-4 py-3 font-medium",
                  col.sortable && "cursor-pointer select-none hover:bg-muted",
                  col.headerClassName
                )}
                onClick={() => {
                  if (!col.sortable || !onSort) return;
                  const dir = sortKey === col.key && sortDir === "asc" ? "desc" : "asc";
                  onSort(col.key, dir);
                }}
              >
                {col.header}
                {renderSortIcon(col)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.map((row, index) => (
            <tr
              key={String(row[keyField] ?? index)}
              className={cn(
                "hover:bg-muted/30",
                onRowClick && "cursor-pointer",
                typeof rowClassName === "function" ? rowClassName(row) : rowClassName
              )}
              onClick={() => onRowClick?.(row)}
            >
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3", col.className)}>
                  {col.render ? col.render(row, index) : String(row[col.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {page && totalPages && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 p-3 border-t">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPageChange?.(page - 1)}>
            上一页
          </Button>
          <span className="text-sm text-muted-foreground">
            第 {page}/{totalPages} 页
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => onPageChange?.(page + 1)}>
            下一页
          </Button>
        </div>
      )}
    </div>
  );
}
