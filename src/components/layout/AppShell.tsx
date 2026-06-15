"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { BookOpen, ChevronLeft, CircleHelp, LayoutDashboard, MessageCircle, Settings, Sparkles, Upload } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { CommandPalette, type CommandPaletteItem } from "@/components/ui/CommandPalette";
import { cn } from "@/lib/utils";

type AppShellProps = {
  userEmail?: string | null;
  children: React.ReactNode;
};

const navItems = [
  { label: "Opportunities", href: "/dashboard", icon: LayoutDashboard },
  { label: "Whiteboard", href: "/dashboard?view=whiteboard", icon: BookOpen },
  { label: "Ember", href: "/dashboard?view=ember", icon: MessageCircle },
  { label: "Docs", href: "/docs", icon: Upload },
  { label: "Settings", href: "/settings", icon: Settings }
];

export function AppShell({ userEmail, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const commandItems = useMemo<CommandPaletteItem[]>(
    () => [
      {
        id: "create-opportunity",
        label: "Create opportunity",
        description: "Start a new FounderOS whiteboard",
        category: "Opportunities",
        onSelect: () => router.push("/dashboard")
      },
      {
        id: "example-opportunity",
        label: "Open example opportunity",
        description: "Create a worked founder whiteboard",
        category: "Opportunities",
        onSelect: () => router.push("/dashboard?example=true")
      },
      {
        id: "ask-ember-market",
        label: "Ask Ember to analyze the market",
        description: "Open the opportunity board and run Market Intel",
        category: "Ember",
        onSelect: () => router.push("/dashboard")
      },
      {
        id: "settings-env",
        label: "Review environment setup",
        description: "Check Supabase and OpenAI deployment requirements",
        category: "Settings",
        onSelect: () => router.push("/settings")
      },
      {
        id: "docs",
        label: "Review document workflow",
        description: "Upload, synthesize, download, and delete documents",
        category: "Settings",
        onSelect: () => router.push("/docs")
      }
    ],
    [router]
  );

  return (
    <div className="min-h-screen bg-os-bg text-os-text">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-shell hidden border-r border-os-border bg-os-surface p-3 motion-safe-transition lg:block",
          collapsed ? "w-16" : "w-[260px]"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between gap-2 px-2 py-2">
            <Link href="/dashboard" className="flex min-h-11 items-center gap-3 rounded-os-md font-display font-semibold text-os-text">
              <span className="flex h-9 w-9 items-center justify-center rounded-os-md bg-os-indigo text-white">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              </span>
              {!collapsed && <span>FounderOS</span>}
            </Link>
            <Button
              type="button"
              size="icon"
              variant="ghost"
              onClick={() => setCollapsed((current) => !current)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <ChevronLeft className={cn("h-4 w-4 motion-safe-transition", collapsed && "rotate-180")} aria-hidden="true" />
            </Button>
          </div>

          <nav className="mt-5 grid gap-1">
            {navItems.slice(0, 4).map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href || (item.label === "Whiteboard" && pathname.startsWith("/opportunity"));
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    "motion-safe-transition flex min-h-11 items-center gap-3 rounded-os-md border-l-[3px] px-3 text-os-sm font-medium",
                    active ? "border-os-indigo bg-os-panel text-os-text" : "border-transparent text-os-sub hover:bg-os-panel hover:text-os-text",
                    collapsed && "justify-center px-0"
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          <div className="mt-5 px-2">
            {!collapsed ? (
              <CommandPalette items={commandItems} />
            ) : (
              <CommandPalette items={commandItems} compact />
            )}
          </div>

          <div className="mt-auto grid gap-2 border-t border-os-border px-2 pt-4">
            <Link className={cn("flex min-h-11 items-center gap-3 rounded-os-md px-2 text-os-sm text-os-sub hover:bg-os-panel hover:text-os-text", collapsed && "justify-center")} href="/help">
              <CircleHelp className="h-4 w-4" aria-hidden="true" />
              {!collapsed && <span>Help</span>}
            </Link>
            <div className={cn("flex items-center gap-3 rounded-os-md px-2 py-2", collapsed && "justify-center")}>
              <Avatar name={userEmail} />
              {!collapsed && (
                <div className="min-w-0">
                  <p className="truncate text-os-sm text-os-text">{userEmail ?? "Founder"}</p>
                  <p className="text-os-xs text-os-muted">Workspace</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-shell border-t border-os-border bg-os-surface/95 backdrop-blur lg:hidden">
        <div className="grid h-14 grid-cols-5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href || (item.label === "Whiteboard" && pathname.startsWith("/opportunity"));
            return (
              <Link key={item.label} href={item.href} className="flex min-h-14 flex-col items-center justify-center gap-0.5 text-os-xs" aria-label={item.label}>
                <Icon className={cn("h-5 w-5", active ? "fill-os-indigo text-os-indigo" : "text-os-muted")} aria-hidden="true" />
                <span className={active ? "text-os-indigo" : "text-os-muted"}>{item.label === "Opportunities" ? "Home" : item.label}</span>
                <span className={cn("h-1 w-1 rounded-full", active ? "bg-os-indigo" : "bg-transparent")} aria-hidden="true" />
              </Link>
            );
          })}
        </div>
      </nav>

      <div className={cn("min-h-screen pb-24 motion-safe-transition lg:pb-0", collapsed ? "lg:pl-16" : "lg:pl-[260px]")}>{children}</div>
    </div>
  );
}
