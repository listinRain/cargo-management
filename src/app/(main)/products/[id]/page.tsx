"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ArrowLeft, Edit } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface ProductDetail {
  id: string; name: string; code: string; specification: string | null;
  unit: string; unitPrice: number; minStock: number; maxStock: number;
  remark: string | null; status: string; createdAt: string;
  category: { id: string; name: string } | null;
  inventory: { quantity: number; warehouse: { id: string; name: string }; location: { id: string; name: string; code: string } }[];
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/products/${params.id}`).then(r => r.json()).then(d => {
      if (d.success) setProduct(d.data);
      setLoading(false);
    });
  }, [params.id]);

  if (loading) return <div className="text-center py-12 text-muted-foreground">加载中...</div>;
  if (!product) return <div className="text-center py-12 text-muted-foreground">货物不存在</div>;

  const totalStock = product.inventory.reduce((s, i) => s + i.quantity, 0);

  return (
    <div>
      <PageHeader title={product.name}>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />返回
          </Button>
          <Button size="sm" onClick={() => router.push(`/products/${product.id}/edit`)}>
            <Edit className="h-4 w-4 mr-1" />编辑
          </Button>
        </div>
      </PageHeader>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-lg">基本信息</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">编码：</span>{product.code}</div>
              <div><span className="text-muted-foreground">分类：</span>{product.category?.name || "-"}</div>
              <div><span className="text-muted-foreground">规格：</span>{product.specification || "-"}</div>
              <div><span className="text-muted-foreground">单位：</span>{product.unit}</div>
              <div><span className="text-muted-foreground">单价：</span>{formatCurrency(product.unitPrice)}</div>
              <div><span className="text-muted-foreground">状态：</span>
                <span className={product.status === "ACTIVE" ? "text-green-600" : "text-red-600"}>
                  {product.status === "ACTIVE" ? "启用" : "停用"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">库存概览</CardTitle></CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-4">{totalStock} <span className="text-lg font-normal text-muted-foreground">{product.unit}</span></div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">最低预警：</span>{product.minStock}</div>
              <div><span className="text-muted-foreground">最高预警：</span>{product.maxStock}</div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader><CardTitle className="text-lg">库存明细</CardTitle></CardHeader>
          <CardContent>
            {product.inventory.length === 0 ? (
              <p className="text-muted-foreground text-sm">暂无库存记录</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left px-4 py-2 font-medium">仓库</th>
                    <th className="text-left px-4 py-2 font-medium">库位</th>
                    <th className="text-right px-4 py-2 font-medium">数量</th>
                    <th className="text-right px-4 py-2 font-medium">金额</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {product.inventory.map((inv, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-4 py-2">{inv.warehouse.name}</td>
                      <td className="px-4 py-2">{inv.location.name} ({inv.location.code})</td>
                      <td className="px-4 py-2 text-right">{inv.quantity}</td>
                      <td className="px-4 py-2 text-right">{formatCurrency(inv.quantity * product.unitPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>

        {product.remark && (
          <Card className="md:col-span-2">
            <CardHeader><CardTitle className="text-lg">备注</CardTitle></CardHeader>
            <CardContent><p className="text-sm text-muted-foreground">{product.remark}</p></CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
