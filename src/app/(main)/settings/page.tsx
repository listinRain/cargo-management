"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PageHeader } from "@/components/shared/page-header";
import { Save } from "lucide-react";

export default function SettingsPage() {
  const [profile, setProfile] = useState({ name: "", email: "", phone: "" });
  const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "" });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/settings").then(r => r.json()).then(d => {
      if (d.success) setProfile({ name: d.data.name, email: d.data.email, phone: d.data.phone || "" });
      setLoading(false);
    });
  }, []);

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(profile) });
    const d = await res.json();
    setMessage(d.success ? "个人信息已更新" : d.error);
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...pwForm, changePassword: true }) });
    const d = await res.json();
    setMessage(d.success ? "密码已更新" : d.error);
    if (d.success) setPwForm({ currentPassword: "", newPassword: "" });
  };

  if (loading) return <div className="text-center py-12 text-muted-foreground">加载中...</div>;

  return (
    <div>
      <PageHeader title="个人设置" />
      {message && <div className="mb-4 p-3 text-sm rounded-md bg-green-50 text-green-700 border border-green-200">{message}</div>}

      <div className="grid gap-6 max-w-md">
        <Card>
          <CardHeader><CardTitle className="text-lg">个人信息</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={updateProfile} className="space-y-4">
              <div className="space-y-2"><Label>姓名</Label><Input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} /></div>
              <div className="space-y-2"><Label>邮箱</Label><Input value={profile.email} disabled /></div>
              <div className="space-y-2"><Label>电话</Label><Input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} /></div>
              <Button type="submit"><Save className="h-4 w-4 mr-1" />保存</Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">修改密码</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={changePassword} className="space-y-4">
              <div className="space-y-2"><Label>当前密码</Label><Input type="password" value={pwForm.currentPassword} onChange={e => setPwForm(p => ({ ...p, currentPassword: e.target.value }))} required /></div>
              <div className="space-y-2"><Label>新密码</Label><Input type="password" value={pwForm.newPassword} onChange={e => setPwForm(p => ({ ...p, newPassword: e.target.value }))} required minLength={6} /></div>
              <Button type="submit">修改密码</Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
