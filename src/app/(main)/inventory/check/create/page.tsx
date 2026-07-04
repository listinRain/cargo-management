"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ArrowLeft } from "lucide-react";

export default function CreateCheckPage() {
  const router = useRouter();
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);
  const [warehouseId, setWarehouseId] = useState("");
  const [remark, setRemark] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/warehouses").then(r => r.json()).then(d => { if (d.success) setWarehouses(d.data); });
  }, []);

  const handleSubmit = async () => {
    if (!warehouseId) return alert("请选择仓库");
    setLoading(true);
    const res = await fetch("/api/inventory/check", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ warehouseId, remark }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) router.push(`/inventory/check/${data.data.id}`);
    else alert(data.error || "创建失败");
  };

  return (
    <div>
      <PageHeader title="新建盘点">
        <Button variant="outline" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-1" />返回</Button>
      </PageHeader>
      <Card className="max-w-md">
        <CardHeader><CardTitle className="text-lg">盘点信息</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>选择仓库 *</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={warehouseId} onChange={e => setWarehouseId(e.target.value)}>
              <option value="">-- 请选择 --</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="space-y-2">
            <Label>备注</Label>
            <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={remark} onChange={e => setRemark(e.target.value)} placeholder="盘点说明" />
          </div>
          <Button onClick={handleSubmit} disabled={!warehouseId || loading}>
            {loading ? "创建中..." : "创建盘点单"}
          </Button>
          <p className="text-xs text-muted-foreground">创建后系统将自动填充该仓库所有货物的账面库存数量。</p>
        </CardContent>
      </Card>
    </div>
  );
}
