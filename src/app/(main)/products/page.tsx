"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Plus, Search, Download, Upload, Edit, Eye, Barcode, Trash2 } from "lucide-react";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { formatCurrency } from "@/lib/utils";
import * as XLSX from "xlsx";

interface Product {
  id: string;
  name: string;
  code: string;
  specification: string | null;
  unit: string;
  unitPrice: number;
  category: { id: string; name: string } | null;
  status: string;
  inventory: { quantity: number; warehouse: { id: string; name: string }; location: { id: string; name: string; code: string } }[];
  createdAt: string;
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchProducts = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", String(page));
    params.set("pageSize", "20");

    const res = await fetch(`/api/products?${params}`);
    const data = await res.json();
    if (data.success) {
      setProducts(data.data);
      setTotalPages(data.pagination.totalPages);
    }
    setLoading(false);
  };

  useEffect(() => { fetchProducts(); }, [search, page]);

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/products/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchProducts();
  };

  const handleExport = async () => {
    const res = await fetch("/api/products?pageSize=10000");
    const d = await res.json();
    if (!d.success || !d.data.length) return;
    const rows = d.data.map((p: Product) => ({
      "编码": p.code,
      "名称": p.name,
      "分类": p.category?.name || "",
      "规格": p.specification || "",
      "单价": p.unitPrice,
      "单位": p.unit,
      "状态": p.status === "ACTIVE" ? "启用" : "停用",
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "货物列表");
    XLSX.writeFile(wb, "货物数据导出.xlsx");
  };

  return (
    <div>
      <PageHeader title="货物列表" description="管理所有货物基础信息">
        <Link href="/products/create">
          <Button size="sm"><Plus className="h-4 w-4 mr-1" />新增货物</Button>
        </Link>
        <Link href="/products/import">
          <Button variant="outline" size="sm"><Upload className="h-4 w-4 mr-1" />导入</Button>
        </Link>
        <Button variant="outline" size="sm" onClick={handleExport}><Download className="h-4 w-4 mr-1" />导出</Button>
      </PageHeader>

      <div className="flex items-center gap-4 mb-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索名称或编码..."
            className="pl-9"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : products.length === 0 ? (
        <EmptyState message="暂无货物数据" />
      ) : (
        <>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">编码</th>
                  <th className="text-left px-4 py-3 font-medium">名称</th>
                  <th className="text-left px-4 py-3 font-medium">分类</th>
                  <th className="text-left px-4 py-3 font-medium">规格</th>
                  <th className="text-right px-4 py-3 font-medium">单价</th>
                  <th className="text-left px-4 py-3 font-medium">仓库 / 库位 (数量)</th>
                  <th className="text-right px-4 py-3 font-medium">状态</th>
                  <th className="text-right px-4 py-3 font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs">{p.code}</td>
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.category?.name || "-"}</td>
                    <td className="px-4 py-3 text-muted-foreground">{p.specification || "-"}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(p.unitPrice)}</td>
                    <td className="px-4 py-3">
                      {p.inventory.length === 0 ? (
                        <span className="text-muted-foreground">无库存</span>
                      ) : (
                        <div className="space-y-0.5">
                          {p.inventory.map((inv, i) => (
                            <div key={i} className="text-xs">
                              <span className="font-medium">{inv.warehouse.name}</span>
                              <span className="text-muted-foreground"> / {inv.location.name}({inv.location.code})</span>
                              <span className="ml-1 font-medium">{inv.quantity} {p.unit}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={p.status === "ACTIVE" ? "text-green-600" : "text-red-600"}>
                        {p.status === "ACTIVE" ? "启用" : "停用"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/products/${p.id}`)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => router.push(`/products/${p.id}/edit`)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteId(p.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>上一页</Button>
              <span className="text-sm text-muted-foreground">第 {page}/{totalPages} 页</span>
              <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>下一页</Button>
            </div>
          )}
        </>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="确认删除"
        description="删除后该货物将标记为停用，确定继续？"
        onConfirm={handleDelete}
      />
    </div>
  );
}
