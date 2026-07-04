"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Warehouse,
  MapPin,
  ArrowDownToLine,
  ArrowUpFromLine,
  ClipboardCheck,
  Users,
  UserCircle,
  Settings,
  Bell,
  FileText,
  TrendingUp,
  History,
  Shield,
  ChevronDown,
  ChevronRight,
  Truck,
  Building2,
  ShoppingCart,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavGroup {
  title: string;
  items: NavItem[];
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navGroups: NavGroup[] = [
  {
    title: "概览",
    items: [{ title: "首页看板", href: "/dashboard", icon: LayoutDashboard }],
  },
  {
    title: "货物管理",
    items: [
      { title: "货物列表", href: "/products", icon: Package },
      { title: "分类管理", href: "/categories", icon: FolderTree },
      { title: "仓库管理", href: "/warehouses", icon: Warehouse },
      { title: "库位管理", href: "/locations", icon: MapPin },
      { title: "供应商", href: "/suppliers", icon: Truck },
      { title: "客户", href: "/customers", icon: ShoppingCart },
      { title: "部门", href: "/departments", icon: Building2 },
    ],
  },
  {
    title: "库存管理",
    items: [
      { title: "库存查询", href: "/inventory", icon: Warehouse },
      { title: "库存预警", href: "/inventory/alerts", icon: Bell },
      { title: "库存盘点", href: "/inventory/check", icon: ClipboardCheck },
    ],
  },
  {
    title: "出入库",
    items: [
      { title: "入库管理", href: "/inbound", icon: ArrowDownToLine },
      { title: "出库管理", href: "/outbound", icon: ArrowUpFromLine },
    ],
  },
  {
    title: "报表",
    items: [
      { title: "库存报表", href: "/reports/inventory", icon: FileText },
      { title: "出入库统计", href: "/reports/inbound-outbound", icon: TrendingUp },
      { title: "周转分析", href: "/reports/turnover", icon: History },
    ],
  },
  {
    title: "系统",
    items: [
      { title: "交易流水", href: "/logs/transactions", icon: History },
      { title: "审计日志", href: "/logs/audit", icon: Shield, adminOnly: true },
      { title: "用户管理", href: "/users", icon: Users, adminOnly: true },
      { title: "通知中心", href: "/notifications", icon: Bell },
      { title: "个人设置", href: "/settings", icon: Settings },
    ],
  },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const isAdmin = session?.user?.role === "ADMIN";

  const toggleGroup = (title: string) => {
    setCollapsed((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  // 根据角色过滤：非管理员隐藏 adminOnly 菜单项；整组无可见项时隐藏分组
  const visibleGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => !item.adminOnly || isAdmin),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <div
      className={cn(
        "fixed left-0 top-0 z-40 h-screen w-64 border-r bg-card flex flex-col transition-transform duration-200",
        "lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full"
      )}
    >
      <div className="h-14 flex items-center gap-2 px-4 border-b">
        <div className="h-8 w-8 rounded-md bg-primary flex items-center justify-center shrink-0">
          <Package className="h-4 w-4 text-primary-foreground" />
        </div>
        <span className="font-semibold text-lg">货管系统</span>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 py-2">
        <nav className="px-3 space-y-1" onClick={() => onClose?.()}>
          {visibleGroups.map((group) => {
            const isCollapsed = collapsed[group.title];
            return (
              <div key={group.title} className="mb-2">
                <button
                  onClick={() => toggleGroup(group.title)}
                  className="flex items-center w-full px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider hover:text-foreground transition-colors"
                >
                  {isCollapsed ? (
                    <ChevronRight className="h-3 w-3 mr-1" />
                  ) : (
                    <ChevronDown className="h-3 w-3 mr-1" />
                  )}
                  {group.title}
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5">
                    {group.items.map((item) => {
                      const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
                      return (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                            isActive
                              ? "bg-primary/10 text-primary font-medium"
                              : "text-foreground hover:bg-muted"
                          )}
                        >
                          <item.icon className="h-4 w-4 shrink-0" />
                          <span>{item.title}</span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </ScrollArea>
    </div>
  );
}
