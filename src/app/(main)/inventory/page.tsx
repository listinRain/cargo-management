"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Search } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface InvItem {
  id: string; quantity: number;
  product: { id: string; name: string; code: string; unit: string; unitPrice: number; minStock: number; maxStock: number; category: { name: string } | null };
  warehouse: { id: string; name: string };
  location: { id: string; name: string; code: string };
}

export default function InventoryPage() {
  const [data, setData] = useState<InvItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [alertFilter, setAlertFilter] = useState("");
  const [warehouses, setWarehouses] = useState<{ id: string; name: string }[]>([]);

  const fetchData = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (warehouseId) params.set("warehouseId", warehouseId);
    if (alertFilter) params.set("alert", alertFilter);
    const res = await fetch(`/api/inventory?${params}`);
    const d = await res.json();
    if (d.success) setData(d.data);
    setLoading(false);
  };

  useEffect(() => {
    fetch("/api/warehouses").then(r => r.json()).then(d => { if (d.success) setWarehouses(d.data); });
  }, []);
  useEffect(() => { fetchData(); }, [search, warehouseId, alertFilter]);

  return (
    <div>
      <PageHeader title="库存查询" description="实时查看各仓库库位的库存情况" />

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="搜索货物..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={warehouseId} onChange={e => setWarehouseId(e.target.value)}>
          <option value="">全部仓库</option>
          {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
        </select>
        <select className="h-10 rounded-md border border-input bg-background px-3 text-sm" value={alertFilter} onChange={e => setAlertFilter(e.target.value)}>
          <option value="">全部</option>
          <option value="low">低库存预警</option>
          <option value="high">超库存预警</option>
        </select>
      </div>

      {loading ? <div className="text-center py-12 text-muted-foreground">加载中...</div> :
       data.length === 0 ? <EmptyState message="暂无库存数据" /> : (
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">编码</th>
                <th className="text-left px-4 py-3 font-medium">名称</th>
                <th className="text-left px-4 py-3 font-medium">分类</th>
                <th className="text-left px-4 py-3 font-medium">仓库</th>
                <th className="text-left px-4 py-3 font-medium">库位</th>
                <th className="text-right px-4 py-3 font-medium">数量</th>
                <th className="text-right px-4 py-3 font-medium">单价</th>
                <th className="text-right px-4 py-3 font-medium">库存金额</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {data.map(item => {
                const isLow = item.product.minStock > 0 && item.quantity <= item.product.minStock;
                const isHigh = item.product.maxStock > 0 && item.quantity >= item.product.maxStock;
                return (
                  <tr key={item.id} className={isLow ? "bg-red-50 hover:bg-red-100" : isHigh ? "bg-orange-50 hover:bg-orange-100" : "hover:bg-muted/30"}>
                    <td className="px-4 py-3 font-mono text-xs">{item.product.code}</td>
                    <td className="px-4 py-3 font-medium">{item.product.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{item.product.category?.name || "-"}</td>
                    <td className="px-4 py-3">{item.warehouse.name}</td>
                    <td className="px-4 py-3">{item.location.name} ({item.location.code})</td>
                    <td className={`px-4 py-3 text-right font-medium ${isLow ? "text-red-600" : isHigh ? "text-orange-600" : ""}`}>
                      {item.quantity} {item.product.unit}
                    </td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.product.unitPrice)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(item.quantity * item.product.unitPrice)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
