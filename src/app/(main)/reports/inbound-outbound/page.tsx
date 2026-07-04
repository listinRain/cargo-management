"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { formatDate } from "@/lib/utils";

export default function InOutReportPage() {
  const [inbound, setInbound] = useState<any[]>([]);
  const [outbound, setOutbound] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/inbound-orders?status=CONFIRMED&pageSize=200").then(r => r.json()),
      fetch("/api/outbound-orders?status=CONFIRMED&pageSize=200").then(r => r.json()),
    ]).then(([inD, outD]) => {
      if (inD.success) setInbound(inD.data);
      if (outD.success) setOutbound(outD.data);
      setLoading(false);
    });
  }, []);

  const inCount = inbound.length;
  const outCount = outbound.length;

  return (
    <div>
      <PageHeader title="出入库统计" description="已确认的入库和出库汇总" />
      <div className="grid grid-cols-2 gap-4 mb-6">
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">入库单数</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-green-600">{inCount}</div></CardContent></Card>
        <Card><CardHeader className="pb-2"><CardTitle className="text-sm font-medium">出库单数</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-red-600">{outCount}</div></CardContent></Card>
      </div>
      {loading ? <div className="text-center py-12 text-muted-foreground">加载中...</div> :
       (inCount === 0 && outCount === 0) ? <EmptyState message="暂无已确认的出入库记录" /> : (
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium mb-2">入库记录</h3>
            {inbound.map(o => (
              <div key={o.id} className="text-sm p-2 border-b">{o.orderNo} - {formatDate(o.inboundDate)}</div>
            ))}
          </div>
          <div>
            <h3 className="font-medium mb-2">出库记录</h3>
            {outbound.map(o => (
              <div key={o.id} className="text-sm p-2 border-b">{o.orderNo} - {formatDate(o.outboundDate)}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
