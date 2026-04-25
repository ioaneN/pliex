"use client";

import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";

interface TopbarProps {
  ownerName: string | null;
  ownerEmail: string;
  ownerInitial: string;
  /** Opens the mobile navigation drawer (max-md). */
  onMenuClick?: () => void;
}

export function Topbar({ ownerName, ownerEmail, ownerInitial, onMenuClick }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-2 border-b border-line-soft bg-paper/85 px-3 py-2.5 backdrop-blur sm:gap-3 sm:px-5">
      {onMenuClick && (
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open menu"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line bg-white text-navy-700 transition hover:bg-sky-100 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}

      <div className="relative flex min-w-0 max-w-[480px] flex-1 items-center gap-2 rounded-md border border-line bg-white px-2 py-1.5 sm:px-3">
        <Search className="h-4 w-4 shrink-0 text-muted" />
        <Input
          aria-label="Search Pliex"
          placeholder="Search transactions, inventory, or ask Pliex…"
          className="min-w-0 border-none p-0 focus:ring-0"
        />
        <span className="hidden shrink-0 rounded border border-sky-200 bg-sky-100 px-1.5 py-0.5 text-[10px] font-semibold text-muted sm:inline">
          ⌘K
        </span>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          aria-label="Notifications"
          className="relative grid h-8 w-8 place-items-center rounded-md border border-line bg-white text-navy-700 transition hover:bg-sky-100"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full border-2 border-white bg-warn" />
        </button>

        <div className="flex items-center gap-2 rounded-full border border-line bg-white py-1 pl-1 pr-2.5">
          <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 text-[11px] font-bold text-paper">
            {ownerInitial}
          </div>
          <div className="hidden flex-col leading-tight sm:flex">
            <span className="text-[12px] font-semibold text-navy-900">{ownerName ?? "Owner"}</span>
            <span className="truncate text-[10px] text-muted">{ownerEmail}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
