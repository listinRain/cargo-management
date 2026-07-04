"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Plus, Eye, Printer } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { INBOUND_TYPE_LABELS } from "@/lib/constants";

export default function InboundPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/inbound-orders?${params}`).then(r => r.json()).then(d => {
      if (d.success) setOrders(d.data);
      setLoading(false);
    });
  }, [statusFilter]);

  return (
    <div>
      <PageHeader title="入库管理" description="管理采购入库、退货入库、生产入库">
        <Button size="sm" onClick={() => router.push("/inbound/create")}><Plus className="h-4 w-4 mr-1" />新建入库单</Button>
      </PageHeader>

      <div className="flex items-center gap-3 mb-4">
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">全部状态</option>
          <option value="DRAFT">草稿</option>
          <option value="CONFIRMED">已确认</option>
          <option value="CANCELLED">已取消</option>
        </select>
      </div>

      {loading ? <div className="text-center py-12 text-muted-foreground">加载中...</div> :
       orders.length === 0 ? <EmptyState message="暂无入库单" /> : (
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="text-left px-4 py-3 font-medium">入库单号</th>
              <th className="text-left px-4 py-3 font-medium">类型</th>
              <th className="text-left px-4 py-3 font-medium">供应商</th>
              <th className="text-left px-4 py-3 font-medium">经办人</th>
              <th className="text-left px-4 py-3 font-medium">日期</th>
              <th className="text-left px-4 py-3 font-medium">状态</th>
              <th className="text-right px-4 py-3 font-medium">操作</th>
            </tr></thead>
            <tbody className="divide-y">{orders.map((o: any) => (
              <tr key={o.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-mono text-xs">{o.orderNo}</td>
                <td className="px-4 py-3">{INBOUND_TYPE_LABELS[o.type] || o.type}</td>
                <td className="px-4 py-3">{o.supplier?.name || "-"}</td>
                <td className="px-4 py-3">{o.handler.name}</td>
                <td className="px-4 py-3">{formatDate(o.inboundDate)}</td>
                <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/inbound/${o.id}`)}><Eye className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/inbound/print/${o.id}`)}><Printer className="h-4 w-4" /></Button>
                  </div>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
