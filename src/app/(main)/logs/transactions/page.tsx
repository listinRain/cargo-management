"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";
import { TRANSACTION_TYPE_LABELS } from "@/lib/constants";

export default function TransactionLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [typeFilter]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (typeFilter) params.set("type", typeFilter);
    params.set("page", String(page));
    params.set("pageSize", "50");
    fetch(`/api/transaction-logs?${params}`).then(r => r.json()).then(d => {
      if (d.success) { setLogs(d.data); setTotalPages(d.pagination.totalPages); }
      setLoading(false);
    });
  }, [typeFilter, page]);

  return (
    <div>
      <PageHeader title="交易流水" description="所有库存变动记录" />

      <div className="flex items-center gap-3 mb-4">
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">全部类型</option>
          <option value="INBOUND">入库</option>
          <option value="OUTBOUND">出库</option>
          <option value="CHECK_ADJUSTMENT">盘点调整</option>
        </select>
      </div>

      {loading ? <div className="text-center py-12 text-muted-foreground">加载中...</div> :
       logs.length === 0 ? <EmptyState message="暂无交易流水" /> : (
        <>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr>
                <th className="text-left px-4 py-3 font-medium">时间</th><th className="text-left px-4 py-3 font-medium">货物</th>
                <th className="text-left px-4 py-3 font-medium">类型</th><th className="text-right px-4 py-3 font-medium">变动数量</th>
                <th className="text-right px-4 py-3 font-medium">变动前</th><th className="text-right px-4 py-3 font-medium">变动后</th>
                <th className="text-left px-4 py-3 font-medium">单号</th><th className="text-left px-4 py-3 font-medium">操作人</th>
              </tr></thead>
              <tbody className="divide-y">{logs.map((log: any) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-xs">{formatDate(log.createdAt, "yyyy-MM-dd HH:mm")}</td>
                  <td className="px-4 py-3 font-medium">{log.product.name}</td>
                  <td className="px-4 py-3"><span className={log.type === "INBOUND" ? "text-green-600" : log.type === "OUTBOUND" ? "text-red-600" : "text-orange-600"}>{TRANSACTION_TYPE_LABELS[log.type] || log.type}</span></td>
                  <td className={`px-4 py-3 text-right font-medium ${log.quantity > 0 ? "text-green-600" : "text-red-600"}`}>{log.quantity > 0 ? "+" : ""}{log.quantity}</td>
                  <td className="px-4 py-3 text-right">{log.beforeQuantity}</td>
                  <td className="px-4 py-3 text-right">{log.afterQuantity}</td>
                  <td className="px-4 py-3 text-xs font-mono">{log.referenceNo || "-"}</td>
                  <td className="px-4 py-3">{log.operator?.name || "-"}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>上一页</Button>
              <span className="text-sm text-muted-foreground self-center">第 {page}/{totalPages} 页</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>下一页</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
