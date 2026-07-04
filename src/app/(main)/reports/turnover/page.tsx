"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";

export default function TurnoverReportPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/transaction-logs?type=INBOUND").then(r => r.json()),
      fetch("/api/transaction-logs?type=OUTBOUND").then(r => r.json()),
    ]).then(([inD, outD]) => {
      // Count movements per product
      const moveCount: Record<string, number> = {};
      [inD, outD].forEach(d => {
        if (d.success) d.data.forEach((log: any) => {
          moveCount[log.product.name] = (moveCount[log.product.name] || 0) + Math.abs(log.quantity);
        });
      });
      const sorted = Object.entries(moveCount).sort(([, a], [, b]) => b - a);
      setData(sorted.slice(0, 15));
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="text-center py-12 text-muted-foreground">加载中...</div>;
  if (!data || data.length === 0) return <EmptyState message="暂无交易数据" />;

  return (
    <div>
      <PageHeader title="周转分析" description="货物出入库频率分析" />
      <Card>
        <CardHeader><CardTitle className="text-lg">货物周转量 Top 15</CardTitle></CardHeader>
        <CardContent>
          {data.map(([name, count]: [string, number], i: number) => (
            <div key={name} className="flex justify-between text-sm py-1.5 border-b">
              <span>{i + 1}. {name}</span>
              <span className="font-medium text-green-600">{count} 单位</span>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
