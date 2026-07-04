"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ArrowLeft, Save, Plus, X } from "lucide-react";

interface SelectOption { id: string; name: string; }
interface ItemRow { productId: string; quantity: string; unitPrice: string; warehouseId: string; locationId: string; }

export default function CreateInboundPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [suppliers, setSuppliers] = useState<SelectOption[]>([]);
  const [warehouses, setWarehouses] = useState<SelectOption[]>([]);
  const [locationsCache, setLocationsCache] = useState<Record<string, SelectOption[]>>({});
  const [products, setProducts] = useState<SelectOption[]>([]);
  const [type, setType] = useState("PURCHASE");
  const [supplierId, setSupplierId] = useState("");
  const [remark, setRemark] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ productId: "", quantity: "1", unitPrice: "0", warehouseId: "", locationId: "" }]);

  useEffect(() => {
    fetch("/api/suppliers").then(r => r.json()).then(d => { if (d.success) setSuppliers(d.data); });
    fetch("/api/warehouses").then(r => r.json()).then(d => { if (d.success) setWarehouses(d.data); });
    fetch("/api/products?pageSize=200").then(r => r.json()).then(d => { if (d.success) setProducts(d.data); });
  }, []);

  const loadLocations = (warehouseId: string) => {
    if (!warehouseId || locationsCache[warehouseId]) return;
    fetch(`/api/locations?warehouseId=${warehouseId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setLocationsCache(prev => ({ ...prev, [warehouseId]: d.data })); });
  };

  const updateItem = (index: number, field: keyof ItemRow, value: string) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  };

  const addRow = () => setItems(prev => [...prev, { productId: "", quantity: "1", unitPrice: "0", warehouseId: "", locationId: "" }]);
  const removeRow = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/inbound-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type, supplierId: supplierId || null, remark,
        items: items.map(i => ({
          productId: i.productId,
          quantity: parseFloat(i.quantity) || 0,
          unitPrice: parseFloat(i.unitPrice) || 0,
          warehouseId: i.warehouseId,
          locationId: i.locationId,
        })),
      }),
    });
    setLoading(false);
    if ((await res.json()).success) router.push("/inbound");
    else alert("创建失败");
  };

  const total = items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0), 0);

  return (
    <div>
      <PageHeader title="新建入库单">
        <Button variant="outline" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-1" />返回</Button>
      </PageHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 max-w-3xl">
          <Card>
            <CardHeader><CardTitle className="text-lg">入库信息</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>入库类型</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={type} onChange={e => setType(e.target.value)}>
                  <option value="PURCHASE">采购入库</option>
                  <option value="RETURN">退货入库</option>
                  <option value="PRODUCTION">生产入库</option>
                </select>
              </div>
              <div className="space-y-2"><Label>供应商</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={supplierId} onChange={e => setSupplierId(e.target.value)}>
                  <option value="">-- 选择供应商 --</option>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="space-y-2 col-span-2"><Label>备注</Label><Input value={remark} onChange={e => setRemark(e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">入库明细</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={addRow}><Plus className="h-4 w-4 mr-1" />添加行</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-end p-3 border rounded-lg bg-muted/10">
                    <div className="col-span-3"><Label className="text-xs">货物</Label>
                      <select className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm" value={item.productId} onChange={e => { updateItem(index, "productId", e.target.value); const p = products.find(p => p.id === e.target.value); if (p) updateItem(index, "unitPrice", String((p as any).unitPrice || 0)); }}>
                        <option value="">选择</option>
                        {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2"><Label className="text-xs">数量</Label><Input type="number" step="0.01" value={item.quantity} onChange={e => updateItem(index, "quantity", e.target.value)} /></div>
                    <div className="col-span-2"><Label className="text-xs">单价</Label><Input type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(index, "unitPrice", e.target.value)} /></div>
                    <div className="col-span-2"><Label className="text-xs">仓库</Label>
                      <select className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm" value={item.warehouseId} onChange={e => { updateItem(index, "warehouseId", e.target.value); loadLocations(e.target.value); }}>
                        <option value="">选择</option>
                        {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-2"><Label className="text-xs">库位</Label>
                      <select className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm" value={item.locationId} onChange={e => updateItem(index, "locationId", e.target.value)}>
                        <option value="">选择</option>
                        {(locationsCache[item.warehouseId] || []).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-1">
                      <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-red-500" onClick={() => removeRow(index)} disabled={items.length <= 1}><X className="h-4 w-4" /></Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right text-sm">合计金额: <span className="text-lg font-bold">{total.toFixed(2)}</span></div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}><Save className="h-4 w-4 mr-1" />{loading ? "保存中..." : "保存草稿"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
