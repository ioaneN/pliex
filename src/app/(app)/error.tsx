"use client";

import { Button } from "@/components/ui/button";

export default function AppError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 px-5 text-center">
      <h1 className="font-serif text-2xl font-semibold text-navy-900">Something went sideways.</h1>
      <p className="max-w-md text-sm text-ink-soft">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
