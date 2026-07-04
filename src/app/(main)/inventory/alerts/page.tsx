"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { AlertTriangle, TrendingDown, TrendingUp } from "lucide-react";

interface AlertItem { id: string; quantity: number; product: { id: string; name: string; code: string; unit: string; minStock: number; maxStock: number }; warehouse: { name: string }; location: { name: string; code: string }; }

export default function AlertsPage() {
  const [data, setData] = useState<{ lowStock: AlertItem[]; overstock: AlertItem[]; lowStockCount: number; overstockCount: number } | null>(null);

  useEffect(() => {
    fetch("/api/inventory/alerts").then(r => r.json()).then(d => { if (d.success) setData(d.data); });
  }, []);

  return (
    <div>
      <PageHeader title="库存预警" description="低库存与超库存实时预警" />

      {!data ? <div className="text-center py-12 text-muted-foreground">加载中...</div> : (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><TrendingDown className="h-5 w-5 text-red-500" />低库存预警 ({data.lowStockCount})</CardTitle>
            </CardHeader>
            <CardContent>
              {data.lowStock.length === 0 ? <EmptyState message="无低库存预警" /> :
                <div className="space-y-3">{data.lowStock.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{item.product.code} | {item.warehouse.name} / {item.location.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">{item.quantity} <span className="text-sm">{item.product.unit}</span></p>
                      <p className="text-xs text-muted-foreground">最低阈值: {item.product.minStock}</p>
                    </div>
                  </div>
                ))}</div>
              }
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-orange-500" />超库存预警 ({data.overstockCount})</CardTitle>
            </CardHeader>
            <CardContent>
              {data.overstock.length === 0 ? <EmptyState message="无超库存预警" /> :
                <div className="space-y-3">{data.overstock.map(item => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{item.product.code} | {item.warehouse.name} / {item.location.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-orange-600">{item.quantity} <span className="text-sm">{item.product.unit}</span></p>
                      <p className="text-xs text-muted-foreground">最高阈值: {item.product.maxStock}</p>
                    </div>
                  </div>
                ))}</div>
              }
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
