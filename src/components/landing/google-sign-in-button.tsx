"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Button } from "@/components/ui/button";
import { publicEnv } from "@/lib/utils/env";

export function GoogleSignInButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const params = useSearchParams();

  async function handleClick() {
    setIsLoading(true);
    setError(null);
    const supabase = createSupabaseBrowserClient();
    const redirectAfter = params.get("redirect") ?? "/dashboard";

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${publicEnv.siteUrl}/auth/callback?redirect=${encodeURIComponent(redirectAfter)}`,
        queryParams: { prompt: "select_account" }
      }
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <Button onClick={handleClick} disabled={isLoading} size="lg">
        <GoogleGlyph />
        {isLoading ? "Opening Google…" : "Continue with Google"}
      </Button>
      {error && <p className="text-xs text-bad">{error}</p>}
    </div>
  );
}

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 18 18" className="h-4 w-4" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M17.6 9.2c0-.6 0-1.2-.2-1.7H9v3.4h4.8c-.2 1.1-.8 2-1.8 2.6v2.2h2.9c1.7-1.6 2.7-3.9 2.7-6.5z"
      />
      <path
        fill="#FF3D00"
        d="M9 18c2.4 0 4.5-.8 6-2.2l-2.9-2.2c-.8.5-1.8.9-3.1.9-2.4 0-4.4-1.6-5.1-3.8H.9v2.4C2.4 15.9 5.5 18 9 18z"
      />
      <path
        fill="#4CAF50"
        d="M3.9 10.7C3.7 10.2 3.6 9.6 3.6 9s.1-1.2.3-1.7V4.9H.9C.3 6.1 0 7.5 0 9s.3 2.9.9 4.1l3-2.4z"
      />
      <path
        fill="#1976D2"
        d="M9 3.6c1.3 0 2.5.4 3.4 1.3l2.5-2.5C13.5.9 11.4 0 9 0 5.5 0 2.4 2.1.9 4.9l3 2.4C4.6 5.2 6.6 3.6 9 3.6z"
      />
    </svg>
  );
}
