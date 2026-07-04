"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Plus, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function CheckListPage() {
  const router = useRouter();
  const [checks, setChecks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inventory/check").then(r => r.json()).then(d => {
      if (d.success) setChecks(d.data);
      setLoading(false);
    });
  }, []);

  return (
    <div>
      <PageHeader title="库存盘点" description="管理盘点记录和库存调整">
        <Button size="sm" onClick={() => router.push("/inventory/check/create")}><Plus className="h-4 w-4 mr-1" />新建盘点</Button>
      </PageHeader>

      {loading ? <div className="text-center py-12 text-muted-foreground">加载中...</div> :
       checks.length === 0 ? <EmptyState message="暂无盘点记录" /> : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="text-left px-4 py-3 font-medium">盘点单号</th><th className="text-left px-4 py-3 font-medium">仓库</th>
              <th className="text-left px-4 py-3 font-medium">盘点人</th><th className="text-left px-4 py-3 font-medium">日期</th>
              <th className="text-left px-4 py-3 font-medium">状态</th><th className="text-right px-4 py-3 font-medium">操作</th>
            </tr></thead>
            <tbody className="divide-y">{checks.map((c: any) => (
              <tr key={c.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{c.checkNo}</td><td className="px-4 py-3">{c.warehouse.name}</td>
                <td className="px-4 py-3">{c.handler.name}</td><td className="px-4 py-3">{formatDate(c.checkDate)}</td>
                <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                <td className="px-4 py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/inventory/check/${c.id}`)}><Eye className="h-4 w-4" /></Button>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
