"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { SearchableProductSelect, ProductOption } from "@/components/shared/product-select";
import { ArrowLeft, Save, Plus, X } from "lucide-react";

interface SelectOption { id: string; name: string; }
interface ItemRow { productId: string; productName: string; productCode: string; unit: string; quantity: string; unitPrice: string; warehouseId: string; locationId: string; maxStock: number; }

export default function CreateOutboundPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState<SelectOption[]>([]);
  const [departments, setDepartments] = useState<SelectOption[]>([]);
  const [warehouses, setWarehouses] = useState<SelectOption[]>([]);
  const [locationsCache, setLocationsCache] = useState<Record<string, SelectOption[]>>({});
  const [type, setType] = useState("SALES");
  const [customerId, setCustomerId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [remark, setRemark] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ productId: "", productName: "", productCode: "", unit: "", quantity: "1", unitPrice: "0", warehouseId: "", locationId: "", maxStock: 0 }]);

  useEffect(() => {
    fetch("/api/customers").then(r => r.json()).then(d => { if (d.success) setCustomers(d.data); });
    fetch("/api/departments").then(r => r.json()).then(d => { if (d.success) setDepartments(d.data); });
    fetch("/api/warehouses").then(r => r.json()).then(d => { if (d.success) setWarehouses(d.data); });
  }, []);

  const loadLocations = (warehouseId: string) => {
    if (!warehouseId || locationsCache[warehouseId]) return;
    fetch(`/api/locations?warehouseId=${warehouseId}`)
      .then(r => r.json())
      .then(d => { if (d.success) setLocationsCache(prev => ({ ...prev, [warehouseId]: d.data })); });
  };

  const updateItem = (index: number, field: keyof ItemRow, value: string) =>
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: value } : item));
  const addRow = () => setItems(prev => [...prev, { productId: "", productName: "", productCode: "", unit: "", quantity: "1", unitPrice: "0", warehouseId: "", locationId: "", maxStock: 0 }]);
  const removeRow = (index: number) => setItems(prev => prev.filter((_, i) => i !== index));

  const handleProductChange = (index: number, productId: string, option: ProductOption | null) => {
    if (option) {
      updateItem(index, "productId", option.productId);
      updateItem(index, "productName", option.productName);
      updateItem(index, "productCode", option.productCode);
      updateItem(index, "unit", option.unit);
      updateItem(index, "unitPrice", String(option.unitPrice));
      updateItem(index, "maxStock", String(option.stockQuantity));
      // 自动选中第一个有库存的仓库和库位
      if (option.stockDetails.length > 0) {
        const first = option.stockDetails[0];
        updateItem(index, "warehouseId", warehouses.find(w => w.name === first.warehouseName)?.id || "");
        updateItem(index, "locationId", "");
      }
    } else {
      updateItem(index, "productId", "");
      updateItem(index, "productName", "");
      updateItem(index, "unitPrice", "0");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/outbound-orders", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type, customerId: type === "SALES" ? (customerId || null) : null,
        departmentId: type === "INTERNAL" ? (departmentId || null) : null,
        remark, items: items.map(i => ({
          productId: i.productId,
          quantity: parseFloat(i.quantity) || 0,
          unitPrice: parseFloat(i.unitPrice) || 0,
          warehouseId: i.warehouseId,
          locationId: i.locationId,
        })),
      }),
    });
    setLoading(false);
    if ((await res.json()).success) router.push("/outbound");
    else alert("创建失败");
  };

  const total = items.reduce((s, i) => s + (parseFloat(i.quantity) || 0) * (parseFloat(i.unitPrice) || 0), 0);

  return (
    <div>
      <PageHeader title="新建出库单">
        <Button variant="outline" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-1" />返回</Button>
      </PageHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 max-w-4xl">
          <Card>
            <CardHeader><CardTitle className="text-lg">出库信息</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>出库类型</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={type} onChange={e => setType(e.target.value)}>
                  <option value="SALES">销售出库</option>
                  <option value="INTERNAL">领用出库</option>
                </select>
              </div>
              {type === "SALES" ? (
                <div className="space-y-2"><Label>客户</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={customerId} onChange={e => setCustomerId(e.target.value)}>
                    <option value="">-- 选择客户 --</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              ) : (
                <div className="space-y-2"><Label>部门</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={departmentId} onChange={e => setDepartmentId(e.target.value)}>
                    <option value="">-- 选择部门 --</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}
              <div className="space-y-2 col-span-2"><Label>备注</Label><Input value={remark} onChange={e => setRemark(e.target.value)} /></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">出库明细</CardTitle>
              <Button type="button" size="sm" variant="outline" onClick={addRow}><Plus className="h-4 w-4 mr-1" />添加行</Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {items.map((item, index) => (
                  <div key={index} className="p-3 border rounded-lg bg-muted/10 space-y-2">
                    {/* 货物搜索 */}
                    <div className="relative">
                      <Label className="text-xs">货物</Label>
                      <SearchableProductSelect
                        value={item.productId}
                        onChange={(pid, opt) => handleProductChange(index, pid, opt)}
                        placeholder="搜索货物名称或编码..."
                      />
                    </div>

                    {/* 已选货物信息 + 数量单价 */}
                    {item.productId && (
                      <div className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-3">
                          <div className="text-xs text-muted-foreground mb-0.5">编码 / 单位</div>
                          <div className="h-9 flex items-center px-2 text-sm border rounded-md bg-background/50">
                            {item.productCode} / {item.unit}
                          </div>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">出库数量 *</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.quantity}
                            onChange={e => updateItem(index, "quantity", e.target.value)}
                          />
                          {item.maxStock > 0 && parseFloat(item.quantity) > item.maxStock && (
                            <p className="text-xs text-red-500 mt-0.5">⚠ 超出库存 ({item.maxStock} {item.unit})</p>
                          )}
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">单价</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={item.unitPrice}
                            onChange={e => updateItem(index, "unitPrice", e.target.value)}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">仓库</Label>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                            value={item.warehouseId}
                            onChange={e => { updateItem(index, "warehouseId", e.target.value); loadLocations(e.target.value); }}
                          >
                            <option value="">选择</option>
                            {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
                          </select>
                        </div>
                        <div className="col-span-2">
                          <Label className="text-xs">库位</Label>
                          <select
                            className="flex h-9 w-full rounded-md border border-input bg-background px-2 py-1 text-sm"
                            value={item.locationId}
                            onChange={e => updateItem(index, "locationId", e.target.value)}
                          >
                            <option value="">选择</option>
                            {(locationsCache[item.warehouseId] || []).map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
                          </select>
                        </div>
                        <div className="col-span-1">
                          <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-red-500" onClick={() => removeRow(index)} disabled={items.length <= 1}><X className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-4 text-right text-sm">
                合计金额: <span className="text-lg font-bold">{total.toFixed(2)} 元</span>
              </div>
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
