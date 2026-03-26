"use client";

import { useState } from "react";
import Link from "next/link";
import { Search as CarbonSearch, Tag } from "@carbon/react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { Bell, Menu, Plus, User as UserIcon, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import { getInitials } from "@/lib/utils";
import type { User } from "@/types";

interface HeaderProps {
  user: User;
  notificationCount?: number;
  isDemo?: boolean;
}

export function Header({ user, notificationCount = 0, isDemo = false }: HeaderProps) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleSignOut = async () => {
    if (isDemo) {
      await fetch("/api/demo/session", { method: "DELETE" });
      router.push("/login");
      router.refresh();
      return;
    }

    await signOut({ callbackUrl: "/login" });
  };

  const quickActions = [
    { label: "New Job", href: "/jobs/new", shortcut: "J" },
    { label: "New Customer", href: "/customers/new", shortcut: "C" },
    { label: "New Estimate", href: "/estimates/new", shortcut: "E" },
    { label: "New Invoice", href: "/invoices/new", shortcut: "I" },
  ];

  return (
    <header className="sticky top-0 z-30 border-b border-[#393939] bg-[#161616] text-[#f4f4f4]">
      <div className="flex min-h-12 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild className="lg:hidden">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center text-[#c6c6c6] transition-colors hover:bg-[#262626] hover:text-white"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 border-r border-[#393939] bg-[#161616] p-0 text-[#f4f4f4]">
            <Sidebar role={user.role} />
          </SheetContent>
        </Sheet>

        <form onSubmit={handleSearch} className="hidden max-w-xl flex-1 sm:block">
          <CarbonSearch
            id="global-search"
            size="lg"
            value={searchQuery}
            labelText="Search jobs, customers, and invoices"
            placeholder="Search jobs, customers, and invoices"
            onChange={(event) => setSearchQuery(event.target.value)}
            onClear={() => setSearchQuery("")}
            className="carbon-header-search"
          />
        </form>

        <div className="ml-auto flex items-center gap-2">
          {isDemo && (
            <Tag type="cool-gray" size="sm" className="hidden sm:inline-flex">
              Demo workspace
            </Tag>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="hidden gap-2 border-[#6f6f6f] bg-transparent text-[#f4f4f4] hover:bg-[#262626] hover:text-white sm:flex"
              >
                <Plus className="h-4 w-4" />
                Quick add
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 border-border bg-card">
              {quickActions.map((action) => (
                <DropdownMenuItem key={action.label} asChild>
                  <Link href={action.href} className="flex justify-between">
                    <span>{action.label}</span>
                    <span className="font-mono text-xs text-muted-foreground">{action.shortcut}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            className="relative flex h-10 w-10 items-center justify-center text-[#c6c6c6] transition-colors hover:bg-[#262626] hover:text-white"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#da1e28] px-1 text-[10px] font-semibold text-white">
                {notificationCount > 9 ? "9+" : notificationCount}
              </span>
            )}
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex h-10 w-10 items-center justify-center rounded-full text-[#f4f4f4] transition-colors hover:bg-[#262626]"
              >
                <Avatar className="h-9 w-9 border border-[#393939]">
                  <AvatarImage src={user.avatar || undefined} alt={user.name || ""} />
                  <AvatarFallback className="bg-[#0f62fe] text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 border-border bg-card" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-semibold leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  <p className="text-xs leading-none uppercase tracking-[0.18em] text-muted-foreground">
                    {user.role.toLowerCase().replace("_", " ")}
                  </p>
                  {isDemo && (
                    <p className="text-xs leading-none text-amber-700">
                      Read-only demo workspace
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/settings">
                  <UserIcon className="mr-2 h-4 w-4" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/users">Team</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
