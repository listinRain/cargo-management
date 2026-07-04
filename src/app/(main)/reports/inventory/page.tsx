"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { formatCurrency } from "@/lib/utils";

export default function InventoryReportPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/inventory").then(r => r.json()).then(d => { if (d.success) setData(d.data); setLoading(false); });
  }, []);

  const totalValue = data.reduce((s, i) => s + i.quantity * i.product.unitPrice, 0);
  const totalQty = data.reduce((s, i) => s + i.quantity, 0);

  return (
    <div>
      <PageHeader title="库存报表" description="库存总览与价值分析" />
      <div className="grid grid-cols-3 gap-4 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">库存总数量</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{totalQty}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">库存总金额</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{formatCurrency(totalValue)}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">库存记录数</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{data.length}</div></CardContent></Card>
      </div>
      {loading ? <div className="text-center py-12 text-muted-foreground">加载中...</div> :
       data.length === 0 ? <EmptyState message="暂无数据" /> : (
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="text-left px-4 py-3 font-medium">货物</th><th className="text-left px-4 py-3 font-medium">仓库/库位</th>
              <th className="text-right px-4 py-3 font-medium">数量</th><th className="text-right px-4 py-3 font-medium">单价</th>
              <th className="text-right px-4 py-3 font-medium">金额</th>
            </tr></thead>
            <tbody className="divide-y">{data.map(i => (
              <tr key={i.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{i.product.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{i.warehouse.name} / {i.location.name}</td>
                <td className="px-4 py-3 text-right">{i.quantity} {i.product.unit}</td>
                <td className="px-4 py-3 text-right">{formatCurrency(i.product.unitPrice)}</td>
                <td className="px-4 py-3 text-right font-medium">{formatCurrency(i.quantity * i.product.unitPrice)}</td>
              </tr>
            ))}</tbody>
            <tfoot><tr className="bg-muted/30 font-bold"><td colSpan={4} className="px-4 py-3 text-right">合计</td><td className="px-4 py-3 text-right">{formatCurrency(totalValue)}</td></tr></tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
