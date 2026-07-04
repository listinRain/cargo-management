"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Package, Boxes, AlertTriangle, ArrowDownToLine, ArrowUpFromLine, TrendingUp, Calendar, CalendarDays } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/dashboard/stats").then(r => r.json()).then(d => {
      if (d.success) setData(d.data);
    });
  }, []);

  if (!data) return <div className="text-center py-12 text-muted-foreground">加载中...</div>;

  const { stats, recentInbound, recentOutbound, recentLogs } = data;

  const clickableCard = (href: string) =>
    "cursor-pointer hover:shadow-md hover:border-primary/40 transition-all duration-200";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">首页看板</h1>
        <p className="text-muted-foreground">货物库存管理概览</p>
      </div>

      {/* 第一行：核心统计 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={clickableCard("/products")} onClick={() => router.push("/products")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">货物总数</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.productCount}</div><p className="text-xs text-muted-foreground mt-1">查看货物列表 →</p></CardContent>
        </Card>
        <Card className={clickableCard("/reports/inventory")} onClick={() => router.push("/reports/inventory")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">库存总金额</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(stats.totalValue)}</div><p className="text-xs text-muted-foreground mt-1">查看库存报表 →</p></CardContent>
        </Card>
        <Card className={clickableCard("/inventory/alerts")} onClick={() => router.push("/inventory/alerts")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">低库存预警</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className={cn("text-2xl font-bold", stats.lowStockCount > 0 ? "text-red-600" : "")}>{stats.lowStockCount}</div>
            <p className="text-xs text-muted-foreground mt-1">查看预警详情 →</p>
          </CardContent>
        </Card>
        <Card className={clickableCard("/inventory")} onClick={() => router.push("/inventory")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">库存总量</CardTitle>
            <Boxes className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">{stats.totalQuantity}</div><p className="text-xs text-muted-foreground mt-1">查看库存详情 →</p></CardContent>
        </Card>
      </div>

      {/* 第二行：今日/本月统计 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={clickableCard("/inbound")} onClick={() => router.push("/inbound")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日入库</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats.inboundToday}</div><p className="text-xs text-muted-foreground">已确认单数</p></CardContent>
        </Card>
        <Card className={clickableCard("/outbound")} onClick={() => router.push("/outbound")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">今日出库</CardTitle>
            <Calendar className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{stats.outboundToday}</div><p className="text-xs text-muted-foreground">已确认单数</p></CardContent>
        </Card>
        <Card className={clickableCard("/inbound")} onClick={() => router.push("/inbound")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月入库</CardTitle>
            <CalendarDays className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-green-600">{stats.inboundMonth}</div><p className="text-xs text-muted-foreground">已确认单数</p></CardContent>
        </Card>
        <Card className={clickableCard("/outbound")} onClick={() => router.push("/outbound")}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本月出库</CardTitle>
            <CalendarDays className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold text-red-600">{stats.outboundMonth}</div><p className="text-xs text-muted-foreground">已确认单数</p></CardContent>
        </Card>
      </div>

      {/* 快捷操作 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push("/inbound/create")}>
          <ArrowDownToLine className="h-6 w-6" /><span>新建入库</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push("/outbound/create")}>
          <ArrowUpFromLine className="h-6 w-6" /><span>新建出库</span>
        </Button>
        <Button variant="outline" className="h-auto py-4 flex-col gap-2" onClick={() => router.push("/inventory/check/create")}>
          <Boxes className="h-6 w-6" /><span>库存盘点</span>
        </Button>
      </div>

      {/* 最近入库 / 出库 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">最近入库</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push("/inbound")}>查看全部 →</Button>
          </CardHeader>
          <CardContent>
            {recentInbound.length === 0 ? <p className="text-sm text-muted-foreground">暂无记录</p> : (
              <div className="space-y-2">{recentInbound.map((o: any) => (
                <div key={o.id} className="flex justify-between text-sm p-2 hover:bg-muted/30 rounded cursor-pointer" onClick={() => router.push(`/inbound/${o.id}`)}>
                  <div><p className="font-medium">{o.orderNo}</p><p className="text-xs text-muted-foreground">{o.handler.name} | {formatDate(o.inboundDate)}</p></div>
                  <span className="text-green-600">{o._count.items} 项</span>
                </div>
              ))}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">最近出库</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => router.push("/outbound")}>查看全部 →</Button>
          </CardHeader>
          <CardContent>
            {recentOutbound.length === 0 ? <p className="text-sm text-muted-foreground">暂无记录</p> : (
              <div className="space-y-2">{recentOutbound.map((o: any) => (
                <div key={o.id} className="flex justify-between text-sm p-2 hover:bg-muted/30 rounded cursor-pointer" onClick={() => router.push(`/outbound/${o.id}`)}>
                  <div><p className="font-medium">{o.orderNo}</p><p className="text-xs text-muted-foreground">{o.handler.name} | {formatDate(o.outboundDate)}</p></div>
                  <span className="text-red-600">{o._count.items} 项</span>
                </div>
              ))}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 最近交易流水 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">最近交易流水</CardTitle>
          <Button variant="ghost" size="sm" onClick={() => router.push("/logs/transactions")}>查看全部 →</Button>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? <p className="text-sm text-muted-foreground">暂无记录</p> : (
            <div className="space-y-1">{recentLogs.map((log: any) => (
              <div key={log.id} className="flex justify-between text-sm py-1.5 px-2 hover:bg-muted/30 rounded">
                <span>{log.product.name}</span>
                <span className={log.type === "INBOUND" ? "text-green-600" : log.type === "OUTBOUND" ? "text-red-600" : "text-orange-600"}>
                  {log.type === "INBOUND" ? "+" : log.type === "OUTBOUND" ? "-" : ""}{log.quantity}
                </span>
                <span className="text-muted-foreground">{formatDate(log.createdAt, "MM-dd HH:mm")}</span>
              </div>
            ))}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
