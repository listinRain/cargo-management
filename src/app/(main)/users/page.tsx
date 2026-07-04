"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "VIEWER", phone: "" });

  const fetchUsers = async () => {
    const res = await fetch("/api/users"); const d = await res.json();
    if (d.success) setUsers(d.data); setLoading(false);
  };
  useEffect(() => { fetchUsers(); }, []);

  const resetForm = () => { setForm({ name: "", email: "", password: "", role: "VIEWER", phone: "" }); setEditingId(null); setShowForm(false); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const url = editingId ? `/api/users/${editingId}` : "/api/users";
    const method = editingId ? "PUT" : "POST";
    const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const d = await res.json();
    if (d.success) { resetForm(); fetchUsers(); }
    else alert(d.error);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await fetch(`/api/users/${deleteId}`, { method: "DELETE" });
    setDeleteId(null);
    fetchUsers();
  };

  return (
    <div>
      <PageHeader title="用户管理"><Button size="sm" onClick={() => { resetForm(); setShowForm(true); }}><Plus className="h-4 w-4 mr-1" />新增用户</Button></PageHeader>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded-lg bg-muted/20 max-w-lg space-y-3">
          <h3 className="font-medium">{editingId ? "编辑用户" : "新增用户"}</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>姓名 *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required /></div>
            <div className="space-y-2"><Label>邮箱 *</Label><Input value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required /></div>
            {!editingId && <div className="space-y-2"><Label>密码</Label><Input type="password" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} placeholder="默认123456" /></div>}
            <div className="space-y-2"><Label>角色</Label>
              <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={form.role} onChange={e => setForm(p => ({ ...p, role: e.target.value }))}>
                <option value="VIEWER">只读查看者</option>
                <option value="WAREHOUSE_MANAGER">仓管员</option>
                <option value="ADMIN">管理员</option>
              </select>
            </div>
            <div className="space-y-2"><Label>电话</Label><Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} /></div>
          </div>
          <div className="flex gap-2"><Button type="submit" size="sm">{editingId ? "保存" : "创建"}</Button><Button type="button" variant="outline" size="sm" onClick={resetForm}>取消</Button></div>
        </form>
      )}

      {loading ? <div className="text-center py-12 text-muted-foreground">加载中...</div> :
       users.length === 0 ? <EmptyState message="暂无用户" /> : (
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm"><thead className="bg-muted/50"><tr>
            <th className="text-left px-4 py-3 font-medium">姓名</th><th className="text-left px-4 py-3 font-medium">邮箱</th>
            <th className="text-left px-4 py-3 font-medium">角色</th><th className="text-left px-4 py-3 font-medium">状态</th>
            <th className="text-left px-4 py-3 font-medium">创建时间</th><th className="text-right px-4 py-3 font-medium">操作</th>
          </tr></thead>
          <tbody className="divide-y">{users.map(u => (
            <tr key={u.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 font-medium">{u.name}</td><td className="px-4 py-3">{u.email}</td>
              <td className="px-4 py-3">{ROLE_LABELS[u.role as keyof typeof ROLE_LABELS]}</td>
              <td className="px-4 py-3"><span className={u.status === "ACTIVE" ? "text-green-600" : "text-red-600"}>{u.status === "ACTIVE" ? "启用" : "禁用"}</span></td>
              <td className="px-4 py-3 text-xs">{formatDate(u.createdAt)}</td>
              <td className="px-4 py-3 text-right"><div className="flex justify-end gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setForm({ name: u.name, email: u.email, password: "", role: u.role, phone: u.phone || "" }); setEditingId(u.id); setShowForm(true); }}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500" onClick={() => setDeleteId(u.id)}><Trash2 className="h-4 w-4" /></Button>
              </div></td>
            </tr>
          ))}</tbody></table>
        </div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={() => setDeleteId(null)}
        title="确认删除"
        description="该用户将被禁用，确定继续？"
        onConfirm={handleDelete}
      />
    </div>
  );
}
