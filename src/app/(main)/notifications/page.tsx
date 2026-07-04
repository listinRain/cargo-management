"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { CheckCheck, Bell } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    const res = await fetch("/api/notifications");
    const d = await res.json();
    if (d.success) setNotifications(d.data);
    setLoading(false);
  };
  useEffect(() => { fetchData(); }, []);

  const markAllRead = async () => {
    await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ markAllRead: true }) });
    fetchData();
  };

  return (
    <div>
      <PageHeader title="通知中心">
        <Button variant="outline" size="sm" onClick={markAllRead} disabled={notifications.every(n => n.isRead)}>
          <CheckCheck className="h-4 w-4 mr-1" />全部已读
        </Button>
      </PageHeader>

      {loading ? <div className="text-center py-12 text-muted-foreground">加载中...</div> :
       notifications.length === 0 ? <EmptyState message="暂无通知" /> : (
        <div className="space-y-2 max-w-2xl">
          {notifications.map(n => (
            <div key={n.id} className={`p-4 rounded-lg border ${n.isRead ? "bg-background" : "bg-blue-50 border-blue-200"}`}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-sm">{n.title}</p>
                  <p className="text-sm text-muted-foreground mt-1">{n.message}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={async () => {
                  await fetch("/api/notifications", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: n.id }) });
                  fetchData();
                }} disabled={n.isRead}>
                  <Bell className={`h-3 w-3 ${n.isRead ? "text-muted-foreground" : "text-blue-500"}`} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">{formatDate(n.createdAt, "yyyy-MM-dd HH:mm")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
