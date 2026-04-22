import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

interface AppShellProps {
  businessName: string;
  ownerName: string | null;
  ownerEmail: string;
  children: React.ReactNode;
}

/**
 * Layout chrome shared by all authenticated pages.
 * Renders the dark sidebar + cream top bar + scrollable main column.
 */
export function AppShell({ businessName, ownerName, ownerEmail, children }: AppShellProps) {
  const ownerInitial = (ownerName ?? ownerEmail).trim().charAt(0).toUpperCase() || "P";

  return (
    <div className="grid min-h-screen grid-cols-[240px_1fr]">
      <Sidebar businessName={businessName} />
      <main className="flex min-w-0 flex-col">
        <Topbar ownerName={ownerName} ownerEmail={ownerEmail} ownerInitial={ownerInitial} />
        <div className="flex w-full max-w-[1500px] flex-col gap-4 px-5 pb-9 pt-5">{children}</div>
      </main>
    </div>
  );
}
