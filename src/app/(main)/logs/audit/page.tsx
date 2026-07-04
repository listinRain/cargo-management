"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`/api/audit-logs?page=${page}&pageSize=50`).then(r => r.json()).then(d => {
      if (d.success) { setLogs(d.data); setTotalPages(d.pagination.totalPages); }
      setLoading(false);
    });
  }, [page]);

  return (
    <div>
      <PageHeader title="审计日志" description="用户操作记录" />

      {loading ? <div className="text-center py-12 text-muted-foreground">加载中...</div> :
       logs.length === 0 ? <EmptyState message="暂无审计日志" /> : (
        <>
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50"><tr>
                <th className="text-left px-4 py-3 font-medium">时间</th><th className="text-left px-4 py-3 font-medium">用户</th>
                <th className="text-left px-4 py-3 font-medium">操作</th><th className="text-left px-4 py-3 font-medium">实体</th>
                <th className="text-left px-4 py-3 font-medium">详情</th>
              </tr></thead>
              <tbody className="divide-y">{logs.map((log: any) => (
                <tr key={log.id}>
                  <td className="px-4 py-3 text-xs">{formatDate(log.createdAt, "yyyy-MM-dd HH:mm")}</td>
                  <td className="px-4 py-3">{log.user.name}</td>
                  <td className="px-4 py-3">{log.action}</td>
                  <td className="px-4 py-3">{log.entity}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-xs truncate">{log.newValue || log.oldValue || "-"}</td>
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
