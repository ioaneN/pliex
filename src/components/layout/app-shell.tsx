"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sparkles, X } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { AssistantChat } from "@/components/assistant/assistant-chat";
import { cn } from "@/lib/utils/cn";
import type { ConversationRole } from "@/types/database";

interface AppShellProps {
  businessName: string;
  ownerName: string | null;
  ownerEmail: string;
  children: React.ReactNode;
}

type AssistantBootstrap = { role: ConversationRole; content: string };

const MD_UP = "(min-width: 768px)";

function AssistantPanelContent({
  assistantStatus,
  assistantError,
  assistantHistory,
  assistantMountKey
}: {
  assistantStatus: "idle" | "loading" | "ready" | "error";
  assistantError: string | null;
  assistantHistory: AssistantBootstrap[];
  assistantMountKey: number;
}) {
  if (assistantStatus === "idle" || assistantStatus === "loading") {
    return <p className="px-1 py-8 text-center text-sm text-muted">Loading conversation…</p>;
  }
  if (assistantStatus === "error") {
    return <p className="px-1 py-8 text-center text-sm text-bad">{assistantError}</p>;
  }
  if (assistantStatus === "ready") {
    return <AssistantChat key={assistantMountKey} initialHistory={assistantHistory} />;
  }
  return null;
}

/**
 * Layout chrome shared by all authenticated pages.
 * Renders the dark sidebar + cream top bar + scrollable main column.
 * — md+: assistant dock is **off** until opened (FAB or future triggers); third column when open. Dock hidden on /assistant (full page).
 * — max-md: assistant off until FAB opens slide-over. Nav uses off-canvas + backdrop.
 */
export function AppShell({ businessName, ownerName, ownerEmail, children }: AppShellProps) {
  const ownerInitial = (ownerName ?? ownerEmail).trim().charAt(0).toUpperCase() || "P";
  const pathname = usePathname();

  const [navOpen, setNavOpen] = useState(false);
  /** Dock / sheet open; default closed on first visit (all breakpoints). */
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [isMdUp, setIsMdUp] = useState(false);
  const [assistantStatus, setAssistantStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [assistantHistory, setAssistantHistory] = useState<AssistantBootstrap[]>([]);
  const [assistantError, setAssistantError] = useState<string | null>(null);
  const [assistantMountKey, setAssistantMountKey] = useState(0);

  const isAssistantRoute = pathname === "/assistant" || pathname.startsWith("/assistant/");
  const showDockedAssistant = assistantOpen && isMdUp && !isAssistantRoute;
  const showMobileAssistantSheet = assistantOpen && !isMdUp;

  useLayoutEffect(() => {
    const m = window.matchMedia(MD_UP);
    const apply = () => {
      const up = m.matches;
      setIsMdUp(up);
      // Going to mobile: close sheet/dock so layout matches viewport.
      if (!up) setAssistantOpen(false);
    };
    apply();
    m.addEventListener("change", apply);
    return () => m.removeEventListener("change", apply);
  }, []);

  const openNav = () => {
    setNavOpen(true);
    setAssistantOpen(false);
  };

  const closeNav = () => setNavOpen(false);

  const openAssistantPanel = () => {
    setAssistantMountKey((k) => k + 1);
    setAssistantOpen(true);
    setNavOpen(false);
  };

  const closeAssistantPanel = () => setAssistantOpen(false);

  const lockScroll = navOpen || showMobileAssistantSheet;

  useEffect(() => {
    if (!lockScroll) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev;
    };
  }, [lockScroll]);

  const shouldFetchAssistant = assistantOpen && !(isMdUp && isAssistantRoute);

  useEffect(() => {
    if (!shouldFetchAssistant) return;
    let cancelled = false;
    setAssistantStatus("loading");
    setAssistantError(null);

    fetch("/api/assistant")
      .then(async (res) => {
        const json = (await res.json()) as { messages?: AssistantBootstrap[]; error?: string };
        if (!res.ok) throw new Error(json.error ?? "Could not load assistant");
        if (cancelled) return;
        setAssistantHistory(Array.isArray(json.messages) ? json.messages : []);
        setAssistantStatus("ready");
      })
      .catch((e: unknown) => {
        if (cancelled) return;
        setAssistantError(e instanceof Error ? e.message : "Could not load assistant");
        setAssistantStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [shouldFetchAssistant]);

  /** Sparkles FAB when assistant is closed (mobile + desktop); hidden on full assistant page. */
  const showAssistantFab = !isAssistantRoute && !assistantOpen;

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col md:grid",
        showDockedAssistant
          ? "md:grid-cols-[240px_minmax(0,1fr)_min(380px,34vw)]"
          : "md:grid-cols-[240px_1fr]"
      )}
    >
      {navOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-[50] bg-navy-900/50 md:hidden"
          onClick={closeNav}
        />
      )}

      <Sidebar
        businessName={businessName}
        onNavigate={closeNav}
        onMobileClose={closeNav}
        className={cn(
          "max-md:fixed max-md:inset-y-0 max-md:left-0 max-md:z-[60] max-md:shadow-2xl max-md:transition-transform max-md:duration-200 max-md:ease-out",
          navOpen
            ? "max-md:translate-x-0 max-md:pointer-events-auto"
            : "max-md:pointer-events-none max-md:-translate-x-full",
          "md:translate-x-0 md:pointer-events-auto"
        )}
      />

      <main className="flex min-w-0 flex-1 flex-col md:min-h-screen">
        <Topbar
          ownerName={ownerName}
          ownerEmail={ownerEmail}
          ownerInitial={ownerInitial}
          onMenuClick={openNav}
        />
        <div className="flex w-full max-w-[1500px] flex-col gap-4 px-3 pb-9 pt-5 sm:px-5">{children}</div>
      </main>

      {showMobileAssistantSheet && (
        <>
          <button
            type="button"
            aria-label="Close assistant"
            className="fixed inset-0 z-[70] bg-navy-900/25 md:hidden"
            onClick={closeAssistantPanel}
          />
          <div
            className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-md flex-col border-l border-line bg-paper shadow-2xl md:hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="pliex-assistant-sheet-title"
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line-soft px-4 py-3">
              <div className="min-w-0">
                <p id="pliex-assistant-sheet-title" className="font-serif text-lg font-semibold text-navy-900">
                  Assistant
                </p>
                <p className="truncate text-xs text-muted">Grounded in your latest numbers</p>
              </div>
              <button
                type="button"
                onClick={closeAssistantPanel}
                aria-label="Close assistant"
                className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line bg-white text-navy-700 transition hover:bg-sky-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              <AssistantPanelContent
                assistantStatus={assistantStatus}
                assistantError={assistantError}
                assistantHistory={assistantHistory}
                assistantMountKey={assistantMountKey}
              />
            </div>
          </div>
        </>
      )}

      {showDockedAssistant && (
        <aside
          className="hidden min-h-0 flex-col border-l border-line bg-paper md:flex md:h-screen md:min-h-screen md:max-h-screen md:sticky md:top-0"
          aria-label="Assistant"
        >
          <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line-soft px-4 py-3">
            <div className="min-w-0">
              <p className="font-serif text-lg font-semibold text-navy-900">Assistant</p>
              <p className="truncate text-xs text-muted">Grounded in your latest numbers</p>
            </div>
            <button
              type="button"
              onClick={closeAssistantPanel}
              aria-label="Hide assistant panel"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-md border border-line bg-white text-navy-700 transition hover:bg-sky-100"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden p-3">
            <AssistantPanelContent
              assistantStatus={assistantStatus}
              assistantError={assistantError}
              assistantHistory={assistantHistory}
              assistantMountKey={assistantMountKey}
            />
          </div>
        </aside>
      )}

      {showAssistantFab && (
        <button
          type="button"
          onClick={openAssistantPanel}
          aria-label="Open AI assistant"
          className="fixed bottom-5 right-5 z-[45] grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 text-white shadow-lg ring-2 ring-paper/90 transition hover:brightness-110"
        >
          <Sparkles className="h-6 w-6" />
        </button>
      )}
    </div>
  );
}
