"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  hasCustomer: boolean;
  isEntitled: boolean;
}

export function BillingActions({ hasCustomer, isEntitled }: Props) {
  const [pending, setPending] = useState<"checkout" | "portal" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function openSession(kind: "checkout" | "portal") {
    setPending(kind);
    setError(null);
    try {
      const res = await fetch(kind === "checkout" ? "/api/billing/checkout" : "/api/billing/portal", {
        method: "POST"
      });
      const data = (await res.json().catch(() => ({}))) as { url?: string; error?: string };
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not open billing. Please try again.");
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not reach billing. Please try again.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        <Button type="button" size="lg" disabled={pending !== null} onClick={() => void openSession("checkout")}>
          {pending === "checkout" ? "Opening checkout…" : isEntitled ? "Change plan" : "Subscribe now"}
        </Button>
        {hasCustomer && (
          <Button
            type="button"
            variant="ghost"
            size="lg"
            disabled={pending !== null}
            onClick={() => void openSession("portal")}
          >
            {pending === "portal" ? "Opening portal…" : "Manage billing"}
          </Button>
        )}
      </div>
      {error && <p className="text-sm text-bad">{error}</p>}
    </div>
  );
}
