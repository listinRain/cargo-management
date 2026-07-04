"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import {
  Plus, Edit, Trash2, Warehouse, MapPin, Package,
  ChevronRight, ChevronDown,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface WarehouseData {
  id: string; name: string; code: string; address: string | null;
  manager: string | null; status: string;
  _count: { locations: number; inventory: number };
}

interface LocationData {
  id: string; name: string; code: string;
}

interface InvItem {
  id: string; quantity: number;
  product: { id: string; name: string; code: string; unit: string; unitPrice: number; minStock: number; maxStock: number };
  location: { id: string; name: string; code: string };
  warehouse: { id: string; name: string };
}

export default function WarehousesPage() {
  const [warehouses, setWarehouses] = useState<WarehouseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", address: "", manager: "" });

  // 展开的仓库 → 其下的库位列表
  const [expandedWh, setExpandedWh] = useState<Record<string, boolean>>({});
  const [locationsCache, setLocationsCache] = useState<Record<string, LocationData[]>>({});
  const [loadingLocs, setLoadingLocs] = useState<Record<string, boolean>>({});

  // 展开的库位 → 货物库存
  const [expandedLoc, setExpandedLoc] = useState<Record<string, boolean>>({});
  const [invCache, setInvCache] = useState<Record<string, InvItem[]>>({});
  const [loadingInv, setLoadingInv] = useState<Record<string, boolean>>({});

  const fetchWarehouses = async () => {
    setLoading(true);
    const res = await fetch("/api/warehouses");
    const d = await res.json();
    if (d.success) setWarehouses(d.data);
    setLoading(false);
  };

  useEffect(() => { fetchWarehouses(); }, []);

  const resetForm = () => { setForm({ name: "", code: "", address: "", manager: "" }); setEditingId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/warehouses/${editingId}` : "/api/warehouses";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    resetForm();
    fetchWarehouses();
  };

  const handleEdit = (w: WarehouseData) => {
    setForm({ name: w.name, code: w.code, address: w.address || "", manager: w.manager || "" });
    setEditingId(w.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/warehouses/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchWarehouses();
  };

  // 展开/收起仓库 → 加载库位
  const toggleWarehouse = async (whId: string) => {
    if (expandedWh[whId]) {
      setExpandedWh(prev => ({ ...prev, [whId]: false }));
      return;
    }
    setExpandedWh(prev => ({ ...prev, [whId]: true }));
    if (locationsCache[whId]) return;

    setLoadingLocs(prev => ({ ...prev, [whId]: true }));
    const res = await fetch(`/api/locations?warehouseId=${whId}`);
    const d = await res.json();
    if (d.success) setLocationsCache(prev => ({ ...prev, [whId]: d.data }));
    setLoadingLocs(prev => ({ ...prev, [whId]: false }));
  };

  // 展开/收起库位 → 加载库存
  const toggleLocation = async (locId: string) => {
    if (expandedLoc[locId]) {
      setExpandedLoc(prev => ({ ...prev, [locId]: false }));
      return;
    }
    setExpandedLoc(prev => ({ ...prev, [locId]: true }));
    if (invCache[locId]) return;

    setLoadingInv(prev => ({ ...prev, [locId]: true }));
    const res = await fetch(`/api/inventory?locationId=${locId}`);
    const d = await res.json();
    if (d.success) setInvCache(prev => ({ ...prev, [locId]: d.data }));
    setLoadingInv(prev => ({ ...prev, [locId]: false }));
  };

  return (
    <div>
      <PageHeader title="仓库管理" description="点击仓库查看库位，再点击库位查看存放的货物">
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" />新增仓库</Button>
      </PageHeader>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-muted/20 max-w-md space-y-3">
          <h3 className="font-medium">{editingId ? "编辑仓库" : "新增仓库"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>名称 *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>编码 *</Label><Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} required /></div>
          </div>
          <div className="space-y-2"><Label>地址</Label><Input value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} /></div>
          <div className="space-y-2"><Label>负责人</Label><Input value={form.manager} onChange={e => setForm(p => ({ ...p, manager: e.target.value }))} /></div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">{editingId ? "保存" : "创建"}</Button>
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>取消</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : warehouses.length === 0 ? (
        <EmptyState message="暂无仓库" />
      ) : (
        <div className="space-y-4">
          {warehouses.map(wh => {
            const isWhOpen = expandedWh[wh.id] || false;
            const locations = locationsCache[wh.id] || [];
            const isLoadingLocs = loadingLocs[wh.id] || false;

            return (
              <div key={wh.id} className="border rounded-lg overflow-hidden">
                {/* 仓库行 */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                  onClick={() => toggleWarehouse(wh.id)}
                >
                  <div className="flex items-center gap-3">
                    {isWhOpen
                      ? <ChevronDown className="h-5 w-5 text-primary shrink-0" />
                      : <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                    }
                    <Warehouse className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">{wh.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        {wh.code}
                        {wh.address && ` · ${wh.address}`}
                        {wh.manager && ` · 负责人: ${wh.manager}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground text-right">
                      <div>{wh._count.locations} 个库位</div>
                      <div>{wh._count.inventory} 条库存</div>
                    </div>
                    <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(wh)}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteId(wh.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </div>

                {/* 展开的库位列表 */}
                {isWhOpen && (
                  <div className="border-t bg-muted/10 p-3 pl-12">
                    {isLoadingLocs ? (
                      <div className="text-center py-4 text-sm text-muted-foreground">加载库位...</div>
                    ) : locations.length === 0 ? (
                      <div className="text-center py-4 text-sm text-muted-foreground">该仓库暂无库位</div>
                    ) : (
                      <div className="space-y-2">
                        {locations.map(loc => {
                          const isLocOpen = expandedLoc[loc.id] || false;
                          const invItems = invCache[loc.id] || [];
                          const isLoadingItems = loadingInv[loc.id] || false;

                          return (
                            <div key={loc.id} className="border rounded-md bg-background">
                              {/* 库位行 */}
                              <div
                                className="flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-muted/20 transition-colors text-sm"
                                onClick={() => toggleLocation(loc.id)}
                              >
                                {isLocOpen
                                  ? <ChevronDown className="h-4 w-4 text-primary shrink-0" />
                                  : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                                }
                                <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                                <span className="font-medium">{loc.name}</span>
                                <span className="text-xs text-muted-foreground font-mono">({loc.code})</span>
                              </div>

                              {/* 库位下的货物库存 */}
                              {isLocOpen && (
                                <div className="border-t bg-muted/5">
                                  {isLoadingItems ? (
                                    <div className="text-center py-3 text-xs text-muted-foreground">加载中...</div>
                                  ) : invItems.length === 0 ? (
                                    <div className="text-center py-3 text-xs text-muted-foreground">该库位暂无库存</div>
                                  ) : (
                                    <table className="w-full text-xs">
                                      <thead className="bg-muted/30">
                                        <tr>
                                          <th className="text-left px-3 py-2 font-medium text-muted-foreground">编码</th>
                                          <th className="text-left px-3 py-2 font-medium text-muted-foreground">货物名称</th>
                                          <th className="text-right px-3 py-2 font-medium text-muted-foreground">数量</th>
                                          <th className="text-right px-3 py-2 font-medium text-muted-foreground">单价</th>
                                          <th className="text-right px-3 py-2 font-medium text-muted-foreground">金额</th>
                                          <th className="text-left px-3 py-2 font-medium text-muted-foreground">状态</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-border">
                                        {invItems.map(item => (
                                          <tr key={item.id} className="hover:bg-muted/20">
                                            <td className="px-3 py-2 font-mono text-xs">{item.product.code}</td>
                                            <td className="px-3 py-2 font-medium">{item.product.name}</td>
                                            <td className="px-3 py-2 text-right">
                                              <span className={
                                                item.product.minStock > 0 && item.quantity <= item.product.minStock
                                                  ? "text-red-600 font-bold"
                                                  : item.product.maxStock > 0 && item.quantity >= item.product.maxStock
                                                  ? "text-orange-600 font-bold"
                                                  : ""
                                              }>
                                                {item.quantity} {item.product.unit}
                                              </span>
                                            </td>
                                            <td className="px-3 py-2 text-right">{formatCurrency(item.product.unitPrice)}</td>
                                            <td className="px-3 py-2 text-right font-medium">{formatCurrency(item.quantity * item.product.unitPrice)}</td>
                                            <td className="px-3 py-2">
                                              {item.product.minStock > 0 && item.quantity <= item.product.minStock ? (
                                                <span className="text-red-500 text-xs">⚠ 低库存</span>
                                              ) : item.product.maxStock > 0 && item.quantity >= item.product.maxStock ? (
                                                <span className="text-orange-500 text-xs">⚠ 超库存</span>
                                              ) : (
                                                <span className="text-green-600 text-xs">正常</span>
                                              )}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="确认删除" description="该仓库将被标记为停用。" onConfirm={handleDelete} />
    </div>
  );
}
