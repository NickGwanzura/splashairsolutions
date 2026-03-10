"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const settingsNav = [
  { name: "Organization", href: "/settings" },
  { name: "Users", href: "/settings/users" },
  { name: "Billing", href: "/settings/billing" },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="space-y-6">
      <div className="border-b">
        <nav className="flex gap-6">
          {settingsNav.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "pb-4 text-sm font-medium border-b-2 transition-colors",
                  isActive
                    ? "border-hvac-600 text-hvac-700"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}
