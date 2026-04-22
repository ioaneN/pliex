"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  Receipt,
  Boxes,
  Sparkles,
  Settings,
  HelpCircle
} from "lucide-react";
import { BrandMark } from "@/components/ui/brand-mark";
import { cn } from "@/lib/utils/cn";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const WORKSPACE_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/inventory", label: "Inventory", icon: Boxes }
];

const INTELLIGENCE_ITEMS: NavItem[] = [
  { href: "/assistant", label: "AI Assistant", icon: Sparkles, badge: "New" }
];

interface SidebarProps {
  businessName: string;
}

export function Sidebar({ businessName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-screen w-[240px] flex-col gap-3 overflow-y-auto border-r border-white/5 bg-gradient-to-b from-navy-900 to-[#081627] px-3.5 py-4 text-sky-100">
      <Link href="/dashboard" className="mx-1.5 my-0.5">
        <BrandMark className="text-white" />
      </Link>

      <BusinessSwitcher businessName={businessName} />

      <NavSection label="Workspace" items={WORKSPACE_ITEMS} pathname={pathname} />
      <NavSection label="Intelligence" items={INTELLIGENCE_ITEMS} pathname={pathname} />

      <div className="mt-auto flex flex-col gap-1 border-t border-white/5 pt-3">
        <NavLink href="/settings" label="Settings" icon={Settings} pathname={pathname} />
        <NavLink href="/help" label="Help" icon={HelpCircle} pathname={pathname} />
      </div>
    </aside>
  );
}

function BusinessSwitcher({ businessName }: { businessName: string }) {
  const initials = businessName
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="flex items-center gap-2.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 py-2">
      <div className="grid h-8 w-8 place-items-center rounded-md bg-gradient-to-br from-denim-400 to-navy-500 text-xs font-bold text-white">
        {initials || "P"}
      </div>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-semibold text-white">{businessName}</div>
        <div className="text-[11px] tracking-wide text-sky-300">Owner workspace</div>
      </div>
    </div>
  );
}

function NavSection({
  label,
  items,
  pathname
}: {
  label: string;
  items: NavItem[];
  pathname: string;
}) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="px-3 pb-1.5 pt-3 text-[11px] uppercase tracking-[0.16em] text-sky-300/70">
        {label}
      </span>
      {items.map((item) => (
        <NavLink key={item.href} {...item} pathname={pathname} />
      ))}
    </div>
  );
}

function NavLink({
  href,
  label,
  icon: Icon,
  badge,
  pathname
}: NavItem & { pathname: string }) {
  const isActive = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium",
        "text-sky-200 transition hover:bg-white/[0.06] hover:text-white",
        isActive &&
          "bg-gradient-to-b from-sky-300/[0.18] to-sky-300/[0.08] text-white shadow-[inset_0_0_0_1px_rgba(155,191,216,0.18)]"
      )}
    >
      {isActive && (
        <span className="absolute -left-[14px] top-3 bottom-3 w-[3px] rounded-r bg-brass" />
      )}
      <Icon className="h-4 w-4 opacity-90" />
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="rounded-full bg-brass px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy-900">
          {badge}
        </span>
      )}
    </Link>
  );
}
