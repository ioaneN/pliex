"use client";

import { cn } from "@/lib/utils/cn";

interface QuickPromptChipsProps {
  prompts: string[];
  onSelect: (prompt: string) => void;
  disabled?: boolean;
}

export function QuickPromptChips({ prompts, onSelect, disabled }: QuickPromptChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {prompts.map((p) => (
        <button
          key={p}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(p)}
          className={cn(
            "rounded-full border border-line bg-white px-3 py-1.5 text-xs font-medium text-navy-700",
            "transition hover:-translate-y-0.5 hover:border-sky-300 hover:bg-sky-100",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          )}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
