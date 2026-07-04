"use client";

import { useEffect, useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Plus, Edit, Trash2, ChevronRight, ChevronDown, FolderTree, Box } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface Category {
  id: string;
  name: string;
  code: string | null;
  parentId: string | null;
  level: number;
  _count?: { products: number };
}

interface CategoryNode extends Category {
  children: CategoryNode[];
}

interface ProductBrief {
  id: string;
  name: string;
  code: string;
  specification: string | null;
  unit: string;
  unitPrice: number;
  status: string;
}

export default function CategoriesPage() {
  const [raw, setRaw] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", parentId: "" });

  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [productsCache, setProductsCache] = useState<Record<string, ProductBrief[]>>({});
  const [loadingProducts, setLoadingProducts] = useState<Record<string, boolean>>({});

  const fetchCategories = async () => {
    setLoading(true);
    const res = await fetch("/api/categories");
    const data = await res.json();
    if (data.success) setRaw(data.data);
    setLoading(false);
  };

  useEffect(() => { fetchCategories(); }, []);

  // 从平铺列表构建树
  const tree = useMemo(() => {
    const map = new Map<string, CategoryNode>();
    const roots: CategoryNode[] = [];

    for (const c of raw) {
      map.set(c.id, { ...c, children: [] });
    }
    for (const c of raw) {
      const node = map.get(c.id)!;
      if (c.parentId && map.has(c.parentId)) {
        map.get(c.parentId)!.children.push(node);
      } else if (!c.parentId) {
        roots.push(node);
      }
    }
    return roots;
  }, [raw]);

  const toggleExpand = async (catId: string) => {
    if (expanded[catId]) {
      setExpanded(prev => ({ ...prev, [catId]: false }));
      return;
    }
    setExpanded(prev => ({ ...prev, [catId]: true }));
    if (productsCache[catId]) return;

    setLoadingProducts(prev => ({ ...prev, [catId]: true }));
    const res = await fetch(`/api/products?categoryId=${catId}&pageSize=200`);
    const d = await res.json();
    if (d.success) {
      setProductsCache(prev => ({ ...prev, [catId]: d.data }));
    }
    setLoadingProducts(prev => ({ ...prev, [catId]: false }));
  };

  const resetForm = () => {
    setForm({ name: "", code: "", parentId: "" });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      await fetch(`/api/categories/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, parentId: form.parentId || null }),
      });
    }
    resetForm();
    fetchCategories();
  };

  const handleEdit = (cat: Category) => {
    setForm({ name: cat.name, code: cat.code || "", parentId: cat.parentId || "" });
    setEditingId(cat.id);
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/categories/${deleteId}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) alert(data.error);
    setDeleteId(null);
    fetchCategories();
  };

  const renderNode = (node: CategoryNode, depth: number): React.ReactNode[] => {
    const isOpen = expanded[node.id] || false;
    const products = productsCache[node.id] || [];
    const isLoading = loadingProducts[node.id] || false;
    const productCount = node._count?.products ?? products.length;

    return [
      <tr key={node.id} className="hover:bg-muted/30 cursor-pointer" onClick={() => toggleExpand(node.id)}>
        <td className="px-4 py-2">
          <span style={{ paddingLeft: depth * 24 }} className="inline-flex items-center gap-1">
            {node.children.length > 0
              ? (isOpen ? <ChevronDown className="h-4 w-4 text-primary shrink-0" /> : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />)
              : <span className="w-4 shrink-0" />
            }
            <FolderTree className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="font-medium">{node.name}</span>
            {productCount > 0 && (
              <span className="text-xs text-muted-foreground">({productCount}个货物)</span>
            )}
          </span>
        </td>
        <td className="px-4 py-2 text-sm text-muted-foreground">{node.code || "-"}</td>
        <td className="px-4 py-2 text-right" onClick={e => e.stopPropagation()}>
          <div className="flex justify-end gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(node)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteId(node.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>,
      // 展开的货物列表
      isOpen && (
        <tr key={`${node.id}-products`} className="bg-muted/10">
          <td colSpan={3} className="px-4 py-2">
            {isLoading ? (
              <div className="text-center py-4 text-sm text-muted-foreground">加载中...</div>
            ) : products.length === 0 ? (
              <div className="text-center py-4 text-sm text-muted-foreground">
                <Box className="h-5 w-5 mx-auto mb-1 text-muted-foreground/50" />
                该分类下暂无货物
              </div>
            ) : (
              <div className="ml-8 border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">编码</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">名称</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">规格</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">单位</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-muted-foreground">单价</th>
                      <th className="text-left px-3 py-2 text-xs font-medium text-muted-foreground">状态</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-muted/20">
                        <td className="px-3 py-2 font-mono text-xs">{p.code}</td>
                        <td className="px-3 py-2 font-medium">{p.name}</td>
                        <td className="px-3 py-2 text-muted-foreground text-xs">{p.specification || "-"}</td>
                        <td className="px-3 py-2">{p.unit}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(p.unitPrice)}</td>
                        <td className="px-3 py-2">
                          <span className={p.status === "ACTIVE" ? "text-green-600 text-xs" : "text-red-600 text-xs"}>
                            {p.status === "ACTIVE" ? "启用" : "停用"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </td>
        </tr>
      ),
      // 递归渲染子分类
      ...(isOpen ? node.children.flatMap(child => renderNode(child, depth + 1)) : []),
    ];
  };

  return (
    <div>
      <PageHeader title="分类管理" description="管理货物多级分类，点击展开查看子分类及货物">
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}>
          <Plus className="h-4 w-4 mr-1" />新增分类
        </Button>
      </PageHeader>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-muted/20 max-w-md space-y-3">
          <h3 className="font-medium">{editingId ? "编辑分类" : "新增分类"}</h3>
          <div className="space-y-2">
            <label className="text-sm font-medium">名称 *</label>
            <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">编码</label>
            <Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">上级分类</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              value={form.parentId}
              onChange={e => setForm(p => ({ ...p, parentId: e.target.value }))}
            >
              <option value="">无 (一级分类)</option>
              {raw.filter(c => c.id !== editingId).map(c => (
                <option key={c.id} value={c.id}>
                  {"　".repeat(c.level - 1)}{c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">{editingId ? "保存" : "创建"}</Button>
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>取消</Button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">加载中...</div>
      ) : tree.length === 0 ? (
        <EmptyState message="暂无分类数据" />
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">名称</th>
                <th className="text-left px-4 py-3 font-medium">编码</th>
                <th className="text-right px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tree.flatMap(root => renderNode(root, 0))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="确认删除"
        description="该分类下有子分类或货物时将无法删除。"
        onConfirm={handleDelete}
      />
    </div>
  );
}
