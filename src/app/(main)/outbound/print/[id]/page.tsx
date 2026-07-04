"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Printer } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { OUTBOUND_TYPE_LABELS } from "@/lib/constants";

export default function PrintOutboundPage() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/outbound-orders/${id}`).then(r => r.json()).then(d => { if (d.success) setOrder(d.data); });
  }, [id]);

  if (!order) return <div className="text-center py-12">加载中...</div>;

  const total = order.items.reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0);

  return (
    <div>
      <div className="flex justify-end mb-4 no-print"><Button onClick={() => window.print()}><Printer className="h-4 w-4 mr-1" />打印</Button></div>
      <div className="max-w-2xl mx-auto bg-white p-8 print:p-0">
        <h1 className="text-center text-xl font-bold mb-2">出库单</h1>
        <p className="text-center text-sm mb-6">单号: {order.orderNo}</p>
        <div className="grid grid-cols-2 gap-2 text-sm mb-6">
          <div><span className="text-muted-foreground">出库类型：</span>{OUTBOUND_TYPE_LABELS[order.type]}</div>
          <div><span className="text-muted-foreground">日期：</span>{formatDate(order.outboundDate)}</div>
          <div><span className="text-muted-foreground">客户/部门：</span>{order.customer?.name || order.department?.name || "-"}</div>
          <div><span className="text-muted-foreground">经办人：</span>{order.handler.name}</div>
        </div>
        <table className="w-full text-sm border">
          <thead><tr className="border-b"><th className="text-left px-4 py-2">货物</th><th className="text-right px-4 py-2">数量</th><th className="text-right px-4 py-2">单价</th><th className="text-right px-4 py-2">金额</th></tr></thead>
          <tbody>{order.items.map((item: any) => (
            <tr key={item.id} className="border-b"><td className="px-4 py-2">{item.product.name}</td><td className="px-4 py-2 text-right">{item.quantity} {item.product.unit}</td><td className="px-4 py-2 text-right">{formatCurrency(item.unitPrice)}</td><td className="px-4 py-2 text-right">{formatCurrency(item.quantity * item.unitPrice)}</td></tr>
          ))}</tbody>
          <tfoot><tr><td colSpan={3} className="px-4 py-2 text-right font-medium">合计</td><td className="px-4 py-2 text-right font-bold">{formatCurrency(total)}</td></tr></tfoot>
        </table>
        <div className="mt-12 flex justify-between text-sm"><div>制单人：________________</div><div>领取人：________________</div></div>
      </div>
    </div>
  );
}
