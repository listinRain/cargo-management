"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Location { id: string; name: string; code: string; warehouseId: string; warehouse: { id: string; name: string }; }
interface Warehouse { id: string; name: string; }

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", warehouseId: "" });

  const fetchData = async () => {
    const [locRes, whRes] = await Promise.all([
      fetch("/api/locations").then(r => r.json()),
      fetch("/api/warehouses").then(r => r.json()),
    ]);
    if (locRes.success) setLocations(locRes.data);
    if (whRes.success) setWarehouses(whRes.data);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => { setForm({ name: "", code: "", warehouseId: "" }); setEditingId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/locations/${editingId}` : "/api/locations";
    const method = editingId ? "PUT" : "POST";
    await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    resetForm(); fetchData();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const res = await fetch(`/api/locations/${deleteId}`, { method: "DELETE" });
    const data = await res.json();
    if (!data.success) alert(data.error);
    setDeleteId(null); fetchData();
  };

  return (
    <div>
      <PageHeader title="库位管理" description="管理各仓库下的存储库位">
        <Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" />新增库位</Button>
      </PageHeader>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-muted/20 max-w-md space-y-3">
          <h3 className="font-medium">{editingId ? "编辑库位" : "新增库位"}</h3>
          <div className="space-y-2"><Label>所属仓库 *</Label>
            <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.warehouseId} onChange={e => setForm(p => ({ ...p, warehouseId: e.target.value }))} required>
              <option value="">选择仓库</option>
              {warehouses.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>名称 *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>编码 *</Label><Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} required /></div>
          </div>
          <div className="flex gap-2">
            <Button type="submit" size="sm">{editingId ? "保存" : "创建"}</Button>
            <Button type="button" variant="outline" size="sm" onClick={resetForm}>取消</Button>
          </div>
        </form>
      )}

      {loading ? <div className="text-center py-12 text-muted-foreground">加载中...</div> :
       locations.length === 0 ? <EmptyState message="暂无库位" /> : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left px-4 py-3 font-medium">仓库</th>
                <th className="text-left px-4 py-3 font-medium">名称</th>
                <th className="text-left px-4 py-3 font-medium">编码</th>
                <th className="text-right px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {locations.map(l => (
                <tr key={l.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3">{l.warehouse.name}</td>
                  <td className="px-4 py-3">{l.name}</td>
                  <td className="px-4 py-3 font-mono text-xs">{l.code}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setForm({ name: l.name, code: l.code, warehouseId: l.warehouseId }); setEditingId(l.id); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteId(l.id)}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <ConfirmDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)} title="确认删除" description="该库位下有库存时将无法删除。" onConfirm={handleDelete} />
    </div>
  );
}
