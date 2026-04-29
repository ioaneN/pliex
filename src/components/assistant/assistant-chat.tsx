"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { Sparkles, ArrowUp } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { QuickPromptChips } from "@/components/assistant/quick-prompt-chips";
import type { ConversationRole } from "@/types/database";

const QUICK_PROMPTS = [
  "How were sales this week?",
  "What should I reorder?",
  "What is hurting profit?",
  "Which day is weakest?",
  "What should I do this week?"
];

interface ChatMessage {
  role: ConversationRole;
  content: string;
}

interface AssistantChatProps {
  initialHistory: ChatMessage[];
}

export function AssistantChat({ initialHistory }: AssistantChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialHistory);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, isPending]);

  function send(question: string) {
    const trimmed = question.trim();
    if (!trimmed || isPending) return;

    setError(null);
    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setDraft("");

    startTransition(async () => {
      try {
        const res = await fetch("/api/assistant", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ question: trimmed })
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Could not get an answer.");
        setMessages((prev) => [...prev, { role: "assistant", content: json.answer }]);
      } catch (err) {
        console.error("[assistant/chat] send failed", err);
        setError("Could not get an answer right now. Please try again.");
      }
    });
  }

  return (
    <Card>
      <CardBody className="flex flex-col gap-3 p-5">
        <div
          ref={scrollRef}
          className="flex h-[420px] flex-col gap-3 overflow-y-auto rounded-md bg-paper-deep/40 p-3"
        >
          {messages.length === 0 && (
            <EmptyHint />
          )}
          {messages.map((m, i) => (
            <MessageBubble key={i} role={m.role} content={m.content} />
          ))}
          {isPending && <MessageBubble role="assistant" content="Thinking…" pending />}
        </div>

        <QuickPromptChips prompts={QUICK_PROMPTS} onSelect={send} disabled={isPending} />

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(draft);
          }}
          className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5"
        >
          <Sparkles className="h-4 w-4 text-navy-600" />
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask about sales, expenses, profit, stock…"
            className="border-none p-0 focus:ring-0"
            disabled={isPending}
          />
          <Button type="submit" size="sm" disabled={isPending || draft.trim() === ""}>
            <ArrowUp className="h-4 w-4" />
          </Button>
        </form>

        {error && (
          <p className="rounded-md border border-bad/30 bg-bad-soft px-3 py-2 text-xs text-bad">
            {error}
          </p>
        )}
      </CardBody>
    </Card>
  );
}

function MessageBubble({
  role,
  content,
  pending
}: {
  role: ConversationRole;
  content: string;
  pending?: boolean;
}) {
  if (role === "user") {
    return (
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-sm bg-navy-700 px-3.5 py-2 text-sm text-paper">
          {content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2">
      <div className="grid h-8 w-8 flex-none place-items-center rounded-full bg-gradient-to-br from-navy-700 to-navy-900 font-serif text-xs font-bold text-paper">
        AI
      </div>
      <div
        className={`max-w-[85%] rounded-2xl rounded-tl-sm border border-line bg-white px-3.5 py-2 text-sm leading-relaxed text-ink-soft ${
          pending ? "italic text-muted" : ""
        }`}
      >
        {content}
      </div>
    </div>
  );
}

function EmptyHint() {
  return (
    <div className="m-auto max-w-md text-center">
      <div className="mx-auto grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-navy-700 to-navy-900 text-sky-200">
        <Sparkles className="h-5 w-5" />
      </div>
      <p className="mt-2 font-serif text-base font-semibold text-navy-900">
        Ask Pliex anything about your business.
      </p>
      <p className="mt-1 text-sm text-ink-soft">
        Try one of the quick prompts below — answers are grounded in your real numbers.
      </p>
    </div>
  );
}
