"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { ArrowLeft, Save } from "lucide-react";

interface Category {
  id: string;
  name: string;
  level: number;
  children: Category[];
}

export default function CreateProductPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "", code: "", specification: "", unit: "pcs",
    unitPrice: "0", categoryId: "", minStock: "0", maxStock: "0", remark: "",
  });

  useEffect(() => {
    fetch("/api/categories").then(r => r.json()).then(d => {
      if (d.success) setCategories(d.data);
    });
  }, []);

  const handleChange = (field: string, value: string) => setForm(p => ({ ...p, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        unitPrice: parseFloat(form.unitPrice) || 0,
        minStock: parseFloat(form.minStock) || 0,
        maxStock: parseFloat(form.maxStock) || 0,
        categoryId: form.categoryId || null,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      router.push("/products");
    } else {
      alert(data.error || "创建失败");
    }
  };

  const renderCategoryOptions = (cats: Category[], depth = 0): React.ReactNode[] => {
    return cats.flatMap(c => [
      <option key={c.id} value={c.id}>{"　".repeat(depth)}{c.name}</option>,
      ...renderCategoryOptions(c.children || [], depth + 1),
    ]);
  };

  return (
    <div>
      <PageHeader title="新增货物">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-1" />返回
        </Button>
      </PageHeader>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 max-w-2xl">
          <Card>
            <CardHeader><CardTitle className="text-lg">基本信息</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">货物名称 *</Label>
                  <Input id="name" required value={form.name} onChange={e => handleChange("name", e.target.value)} placeholder="货物名称" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">货物编码 (SKU) *</Label>
                  <Input id="code" required value={form.code} onChange={e => handleChange("code", e.target.value)} placeholder="SKU-001" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="unit">单位</Label>
                  <Input id="unit" value={form.unit} onChange={e => handleChange("unit", e.target.value)} placeholder="pcs" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unitPrice">单价</Label>
                  <Input id="unitPrice" type="number" step="0.01" value={form.unitPrice} onChange={e => handleChange("unitPrice", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryId">分类</Label>
                  <select
                    id="categoryId"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    value={form.categoryId}
                    onChange={e => handleChange("categoryId", e.target.value)}
                  >
                    <option value="">无分类</option>
                    {renderCategoryOptions(categories)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="specification">规格</Label>
                <Input id="specification" value={form.specification} onChange={e => handleChange("specification", e.target.value)} placeholder="规格型号" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">库存设置</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minStock">最低库存预警</Label>
                  <Input id="minStock" type="number" value={form.minStock} onChange={e => handleChange("minStock", e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxStock">最高库存预警</Label>
                  <Input id="maxStock" type="number" value={form.maxStock} onChange={e => handleChange("maxStock", e.target.value)} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-lg">备注</CardTitle></CardHeader>
            <CardContent>
              <Input id="remark" value={form.remark} onChange={e => handleChange("remark", e.target.value)} placeholder="备注信息" />
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              <Save className="h-4 w-4 mr-1" />{loading ? "保存中..." : "保存"}
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>取消</Button>
          </div>
        </div>
      </form>
    </div>
  );
}
