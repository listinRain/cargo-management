"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ArrowLeft, Save } from "lucide-react";

interface Category { id: string; name: string; level: number; children: Category[]; }

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [form, setForm] = useState({
    name: "", code: "", specification: "", unit: "pcs",
    unitPrice: "0", categoryId: "", minStock: "0", maxStock: "0", remark: "",
  });

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then(r => r.json()),
      fetch(`/api/products/${params.id}`).then(r => r.json()),
    ]).then(([catData, prodData]) => {
      if (catData.success) setCategories(catData.data);
      if (prodData.success) {
        const p = prodData.data;
        setForm({
          name: p.name, code: p.code, specification: p.specification || "",
          unit: p.unit, unitPrice: String(p.unitPrice), categoryId: p.categoryId || "",
          minStock: String(p.minStock), maxStock: String(p.maxStock), remark: p.remark || "",
        });
      }
      setFetching(false);
    });
  }, [params.id]);

  const handleChange = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch(`/api/products/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        unitPrice: parseFloat(form.unitPrice) || 0,
        minStock: parseFloat(form.minStock) || 0,
        maxStock: parseFloat(form.maxStock) || 0,
        categoryId: form.categoryId || null,
      }),
    });
    setLoading(false);
    if ((await res.json()).success) router.push("/products");
    else alert("更新失败");
  };

  const renderOptions = (cats: Category[], d = 0): React.ReactNode[] =>
    cats.flatMap(c => [<option key={c.id} value={c.id}>{"　".repeat(d)}{c.name}</option>, ...renderOptions(c.children || [], d + 1)]);

  if (fetching) return <div className="text-center py-12 text-muted-foreground">加载中...</div>;

  return (
    <div>
      <PageHeader title="编辑货物">
        <Button variant="outline" size="sm" onClick={() => router.back()}><ArrowLeft className="h-4 w-4 mr-1" />返回</Button>
      </PageHeader>
      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 max-w-2xl">
          <Card>
            <CardHeader><CardTitle className="text-lg">基本信息</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="name">货物名称 *</Label><Input id="name" required value={form.name} onChange={e => handleChange("name", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="code">货物编码 *</Label><Input id="code" required value={form.code} onChange={e => handleChange("code", e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2"><Label htmlFor="unit">单位</Label><Input id="unit" value={form.unit} onChange={e => handleChange("unit", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="unitPrice">单价</Label><Input id="unitPrice" type="number" step="0.01" value={form.unitPrice} onChange={e => handleChange("unitPrice", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="categoryId">分类</Label><select id="categoryId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.categoryId} onChange={e => handleChange("categoryId", e.target.value)}><option value="">无分类</option>{renderOptions(categories)}</select></div>
              </div>
              <div className="space-y-2"><Label htmlFor="spec">规格</Label><Input id="spec" value={form.specification} onChange={e => handleChange("specification", e.target.value)} /></div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">库存设置</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label htmlFor="min">最低库存预警</Label><Input id="min" type="number" value={form.minStock} onChange={e => handleChange("minStock", e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="max">最高库存预警</Label><Input id="max" type="number" value={form.maxStock} onChange={e => handleChange("maxStock", e.target.value)} /></div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-lg">备注</CardTitle></CardHeader>
            <CardContent><Input value={form.remark} onChange={e => handleChange("remark", e.target.value)} /></CardContent>
          </Card>
          <div className="flex gap-2">
            <Button type="submit" disabled={loading}><Save className="h-4 w-4 mr-1" />{loading ? "保存中..." : "保存"}</Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
