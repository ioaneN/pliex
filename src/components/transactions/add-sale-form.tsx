"use client";

import { useEffect, useRef } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { addSaleAction, type TransactionFormState } from "@/app/(app)/transactions/actions";
import { today as todayIso } from "@/lib/utils/dates";

const INITIAL: TransactionFormState = { fieldErrors: {} };

export function AddSaleForm() {
  const [state, action] = useFormState(addSaleAction, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state.ok]);

  return (
    <form ref={formRef} action={action} className="grid gap-3 md:grid-cols-[1fr_1fr_1fr_auto]">
      <Field label="Amount" error={state.fieldErrors.amount}>
        <Input type="number" name="amount" step="0.01" min="0" placeholder="42.80" required />
      </Field>
      <Field label="Category">
        <Input name="category" placeholder="Coffee, Pastries…" />
      </Field>
      <Field label="Date">
        <Input type="date" name="saleDate" defaultValue={todayIso()} />
      </Field>
      <div className="flex items-end">
        <SubmitButton />
      </div>
      {state.formError && (
        <p className="md:col-span-4 text-sm text-bad">{state.formError}</p>
      )}
    </form>
  );
}

function Field({
  label,
  error,
  children
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11px] font-semibold uppercase tracking-widest text-navy-700">{label}</span>
      {children}
      {error && <span className="text-xs text-bad">{error}</span>}
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : "Add sale"}
    </Button>
  );
}
