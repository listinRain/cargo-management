"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { ArrowLeft, Save, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface CheckItem { id: string; product: { name: string; code: string; unit: string }; location: { name: string; code: string }; bookQuantity: number; actualQuantity: number; difference: number; }
interface Check { id: string; checkNo: string; status: string; checkDate: string; remark: string | null; warehouse: { name: string }; handler: { name: string }; items: CheckItem[]; }

export default function CheckDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [check, setCheck] = useState<Check | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchCheck = async () => {
    const res = await fetch(`/api/inventory/check/${id}`);
    const d = await res.json();
    if (d.success) setCheck(d.data);
    setLoading(false);
  };
  useEffect(() => { fetchCheck(); }, [id]);

  const updateActual = (itemId: string, value: number) => {
    if (!check) return;
    setCheck({
      ...check,
      items: check.items.map(i => i.id === itemId ? { ...i, actualQuantity: value, difference: value - i.bookQuantity } : i),
    });
  };

  const handleSave = async () => {
    if (!check) return;
    setSaving(true);
    await fetch(`/api/inventory/check/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: check.items.map(i => ({ id: i.id, actualQuantity: i.actualQuantity })) }),
    });
    setSaving(false);
    fetchCheck();
  };

  const handleConfirm = async () => {
    await fetch(`/api/inventory/check/${id}/confirm`, { method: "POST" });
    setConfirmOpen(false);
    fetchCheck();
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">加载中...</div>;
  if (!check) return <div className="text-center py-12 text-muted-foreground">盘点不存在</div>;

  const canEdit = check.status === "DRAFT";

  return (
    <div>
      <PageHeader title={`盘点: ${check.checkNo}`}>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-1" />返回</Button>
          {canEdit && <Button size="sm" onClick={handleSave} disabled={saving}><Save className="h-4 w-4 mr-1" />{saving ? "保存中..." : "保存"}</Button>}
          {canEdit && <Button size="sm" onClick={() => setConfirmOpen(true)} className="bg-green-600 hover:bg-green-700"><CheckCircle className="h-4 w-4 mr-1" />确认盘点</Button>}
        </div>
      </PageHeader>

      <div className="grid grid-cols-4 gap-4 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">盘点仓库</CardTitle></CardHeader><CardContent className="text-lg font-bold">{check.warehouse.name}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">盘点人</CardTitle></CardHeader><CardContent className="text-lg font-bold">{check.handler.name}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">日期</CardTitle></CardHeader><CardContent className="text-lg font-bold">{formatDate(check.checkDate)}</CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-xs text-muted-foreground">状态</CardTitle></CardHeader><CardContent><StatusBadge status={check.status} /></CardContent></Card>
      </div>

      {check.items.length === 0 ? (
        <p className="text-muted-foreground">该仓库暂无货物库存。</p>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50"><tr>
              <th className="text-left px-4 py-3 font-medium">货物编码</th>
              <th className="text-left px-4 py-3 font-medium">货物名称</th>
              <th className="text-left px-4 py-3 font-medium">库位</th>
              <th className="text-right px-4 py-3 font-medium">账面数量</th>
              <th className="text-right px-4 py-3 font-medium">实盘数量</th>
              <th className="text-right px-4 py-3 font-medium">差异</th>
            </tr></thead>
            <tbody className="divide-y">
              {check.items.map(item => {
                const hasDiff = item.difference !== 0;
                return (
                  <tr key={item.id} className={`hover:bg-muted/30 ${hasDiff ? "bg-yellow-50" : ""}`}>
                    <td className="px-4 py-3 font-mono text-xs">{item.product.code}</td>
                    <td className="px-4 py-3 font-medium">{item.product.name}</td>
                    <td className="px-4 py-3">{item.location.name} ({item.location.code})</td>
                    <td className="px-4 py-3 text-right">{item.bookQuantity} {item.product.unit}</td>
                    <td className="px-4 py-3 text-right">
                      {canEdit ? (
                        <input
                          type="number" step="0.01"
                          className="w-24 h-8 text-right border rounded px-2 text-sm"
                          value={item.actualQuantity}
                          onChange={e => updateActual(item.id, parseFloat(e.target.value) || 0)}
                        />
                      ) : (
                        <span>{item.actualQuantity} {item.product.unit}</span>
                      )}
                    </td>
                    <td className={`px-4 py-3 text-right font-medium ${item.difference > 0 ? "text-green-600" : item.difference < 0 ? "text-red-600" : ""}`}>
                      {item.difference > 0 ? "+" : ""}{item.difference} {item.product.unit}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen} onOpenChange={setConfirmOpen}
        title="确认盘点" description="确认后库存将被调整为实盘数量，差异将记录为盈亏。确定继续？"
        onConfirm={handleConfirm}
      />
    </div>
  );
}
