"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ArrowLeft, CheckCircle, Printer, Trash2 } from "lucide-react";
import { formatDate, formatCurrency } from "@/lib/utils";
import { INBOUND_TYPE_LABELS } from "@/lib/constants";

export default function InboundDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);

  const fetchOrder = async () => {
    const res = await fetch(`/api/inbound-orders/${id}`);
    const d = await res.json();
    if (d.success) setOrder(d.data);
    setLoading(false);
  };
  useEffect(() => { fetchOrder(); }, [id]);

  const handleConfirm = async () => {
    const res = await fetch(`/api/inbound-orders/${id}/confirm`, { method: "POST" });
    const d = await res.json();
    setConfirmOpen(false);
    if (d.success) fetchOrder();
    else alert(d.error || "确认失败");
  };

  const handleDelete = async () => {
    await fetch(`/api/inbound-orders/${id}`, { method: "DELETE" });
    setDeleteOpen(false);
    router.push("/inbound");
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">加载中...</div>;
  if (!order) return <div className="text-center py-12 text-muted-foreground">订单不存在</div>;

  const total = order.items.reduce((s: number, i: any) => s + (i.quantity * i.unitPrice), 0);

  return (
    <div>
      <PageHeader title={`入库单: ${order.orderNo}`}>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-1" />返回</Button>
          {order.status === "DRAFT" && (
            <>
              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => setConfirmOpen(true)}><CheckCircle className="h-4 w-4 mr-1" />确认入库</Button>
              <Button size="sm" variant="destructive" onClick={() => setDeleteOpen(true)}><Trash2 className="h-4 w-4 mr-1" />删除</Button>
            </>
          )}
          <Button variant="outline" size="sm" onClick={() => router.push(`/inbound/print/${order.id}`)}><Printer className="h-4 w-4 mr-1" />打印</Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">入库类型</CardTitle></CardHeader><CardContent className="font-bold">{INBOUND_TYPE_LABELS[order.type] || order.type}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">供应商</CardTitle></CardHeader><CardContent className="font-bold">{order.supplier?.name || "-"}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">经办人</CardTitle></CardHeader><CardContent className="font-bold">{order.handler.name}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">状态</CardTitle></CardHeader><CardContent><StatusBadge status={order.status} /></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-lg">明细</CardTitle></CardHeader>
        <CardContent>
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr><th className="text-left px-4 py-3 font-medium">货物</th><th className="text-right px-4 py-3 font-medium">数量</th><th className="text-right px-4 py-3 font-medium">单价</th><th className="text-right px-4 py-3 font-medium">金额</th></tr></thead>
            <tbody className="divide-y">{order.items.map((item: any) => (
              <tr key={item.id}><td className="px-4 py-3 font-medium">{item.product.name} <span className="text-muted-foreground text-xs">({item.product.code})</span></td><td className="px-4 py-3 text-right">{item.quantity} {item.product.unit}</td><td className="px-4 py-3 text-right">{formatCurrency(item.unitPrice)}</td><td className="px-4 py-3 text-right">{formatCurrency(item.quantity * item.unitPrice)}</td></tr>
            ))}</tbody>
            <tfoot><tr className="bg-muted/20"><td colSpan={3} className="px-4 py-3 text-right font-medium">合计</td><td className="px-4 py-3 text-right font-bold text-lg">{formatCurrency(total)}</td></tr></tfoot>
          </table>
        </CardContent>
      </Card>

      <ConfirmDialog open={confirmOpen} onOpenChange={setConfirmOpen} title="确认入库" description="确认后库存将增加，并生成交易流水记录。" onConfirm={handleConfirm} />
      <ConfirmDialog open={deleteOpen} onOpenChange={setDeleteOpen} title="删除草稿" description="删除后该入库单将被永久移除，确定继续？" onConfirm={handleDelete} />
    </div>
  );
}
