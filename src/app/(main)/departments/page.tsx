"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/page-header";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Plus, Edit, Trash2 } from "lucide-react";

interface Department { id: string; name: string; code: string | null; description: string | null; }

export default function DepartmentsPage() {
  const [data, setData] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", code: "", description: "" });

  const fetchData = async () => {
    const res = await fetch("/api/departments"); const d = await res.json();
    if (d.success) setData(d.data); setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const resetForm = () => { setForm({ name: "", code: "", description: "" }); setEditingId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/departments/${editingId}` : "/api/departments";
    await fetch(url, { method: editingId ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    resetForm(); fetchData();
  };

  return (
    <div>
      <PageHeader title="部门管理"><Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" />新增部门</Button></PageHeader>
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-muted/20 max-w-md space-y-3">
          <h3 className="font-medium">{editingId ? "编辑部门" : "新增部门"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>名称 *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>编码</Label><Input value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value }))} /></div>
          </div>
          <div className="space-y-2"><Label>描述</Label><Input value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} /></div>
          <div className="flex gap-2"><Button type="submit" size="sm">{editingId ? "保存" : "创建"}</Button><Button type="button" variant="outline" size="sm" onClick={resetForm}>取消</Button></div>
        </form>
      )}
      {loading ? <div className="text-center py-12 text-muted-foreground">加载中...</div> : data.length === 0 ? <EmptyState message="暂无部门" /> : (
        <div className="border rounded-lg overflow-hidden"><table className="w-full text-sm"><thead className="bg-muted/50"><tr><th className="text-left px-4 py-3 font-medium">名称</th><th className="text-left px-4 py-3 font-medium">编码</th><th className="text-left px-4 py-3 font-medium">描述</th><th className="text-right px-4 py-3 font-medium">操作</th></tr></thead>
          <tbody className="divide-y">{data.map(d => (
            <tr key={d.id} className="hover:bg-muted/30"><td className="px-4 py-3 font-medium">{d.name}</td><td className="px-4 py-3">{d.code || "-"}</td><td className="px-4 py-3">{d.description || "-"}</td>
              <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setForm({ name: d.name, code: d.code || "", description: d.description || "" }); setEditingId(d.id); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={async () => { await fetch(`/api/departments/${d.id}`, { method: "DELETE" }); fetchData(); }}><Trash2 className="h-4 w-4" /></Button>
              </div></td>
            </tr>
          ))}</tbody></table></div>
      )}
    </div>
  );
}
