"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserRole } from "@prisma/client";
import type { ComponentType } from "react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CalendarDays,
  Truck,
  FileText,
  Calculator,
  Package,
  Settings,
  BarChart3,
  ChevronLeft,
  Wrench,
} from "lucide-react";

interface SidebarProps {
  className?: string;
  collapsed?: boolean;
  onToggle?: () => void;
  role?: UserRole;
}

interface NavigationItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

const navigation: NavigationItem[] = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Customers", href: "/customers", icon: Users, roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER] },
  { name: "Jobs", href: "/jobs", icon: Briefcase, roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN] },
  { name: "Dispatch Board", href: "/dispatch", icon: Truck, roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER] },
  { name: "Calendar", href: "/calendar", icon: CalendarDays, roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER, UserRole.TECHNICIAN] },
  { name: "Estimates", href: "/estimates", icon: Calculator, roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.ACCOUNTANT] },
  { name: "Invoices", href: "/invoices", icon: FileText, roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.ACCOUNTANT] },
  { name: "Equipment", href: "/equipment", icon: Wrench, roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.DISPATCHER] },
  { name: "Inventory", href: "/inventory", icon: Package, roles: [UserRole.OWNER, UserRole.ADMIN] },
  { name: "Reports", href: "/reports", icon: BarChart3, roles: [UserRole.OWNER, UserRole.ADMIN, UserRole.ACCOUNTANT] },
  { name: "Settings", href: "/settings", icon: Settings, roles: [UserRole.OWNER, UserRole.ADMIN] },
];

export function Sidebar({ className, collapsed = false, onToggle, role }: SidebarProps) {
  const pathname = usePathname();
  const visibleNavigation = navigation.filter((item) => !item.roles || !role || item.roles.includes(role));

  return (
    <aside
      className={cn(
        "relative flex h-full flex-col border-r border-[#393939] bg-[#161616] text-[#f4f4f4] transition-all duration-200",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="border-b border-[#393939] px-4 py-4">
        <Link
          href="/dashboard"
          className={cn("flex items-center gap-3", collapsed && "justify-center")}
        >
          <div className="flex h-10 w-10 items-center justify-center border border-[#0f62fe] bg-[#0f62fe] text-white">
            <Wrench className="h-5 w-5" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <span className="block text-[11px] uppercase tracking-[0.24em] text-[#8d8d8d]">
                Field Service
              </span>
              <span className="block truncate text-lg font-semibold text-white">
                HVACOps
              </span>
            </div>
          )}
        </Link>
      </div>

      {!collapsed && (
        <div className="px-4 pt-4">
          <p className="text-[11px] uppercase tracking-[0.24em] text-[#8d8d8d]">
            Workspace
          </p>
        </div>
      )}

      <ScrollArea className="flex-1 py-3">
        <nav className="space-y-1 px-2">
          {visibleNavigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                title={collapsed ? item.name : undefined}
                className={cn(
                  "group flex min-h-12 items-center gap-3 px-3 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-[#262626] text-white shadow-[inset_3px_0_0_0_#0f62fe]"
                    : "text-[#c6c6c6] hover:bg-[#262626] hover:text-white",
                  collapsed && "justify-center px-2"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive && "text-[#78a9ff]")} />
                {!collapsed && <span className="truncate">{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {onToggle && (
        <div className="border-t border-[#393939] p-2">
          <button
            type="button"
            onClick={onToggle}
            className={cn(
              "flex min-h-12 w-full items-center gap-3 px-3 text-sm font-medium text-[#c6c6c6] transition-colors hover:bg-[#262626] hover:text-white",
              collapsed && "justify-center px-2"
            )}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            <ChevronLeft className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
            {!collapsed && <span>Collapse navigation</span>}
          </button>
        </div>
      )}
    </aside>
  );
}
