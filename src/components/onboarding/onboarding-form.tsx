"use client";

import { useFormState, useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  completeOnboarding,
  type OnboardingFormState
} from "@/app/(auth)/onboarding/actions";

const INITIAL_STATE: OnboardingFormState = { fieldErrors: {} };

const BUSINESS_TYPES = [
  { value: "cafe", label: "Café" },
  { value: "bakery", label: "Bakery" },
  { value: "food_shop", label: "Food shop" }
];

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "GEL"];

const TRACKING_OPTIONS = [
  "Notebook",
  "Spreadsheet",
  "POS system",
  "Bank app",
  "Nothing yet"
];

export function OnboardingForm() {
  const [state, formAction] = useFormState(completeOnboarding, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <Field label="Business name" error={state.fieldErrors.businessName}>
        <Input name="businessName" placeholder="e.g. Northwind Bakery" required />
      </Field>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Business type" error={state.fieldErrors.businessType}>
          <Select name="businessType" defaultValue="cafe" required>
            {BUSINESS_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </Select>
        </Field>
        <Field label="Currency" error={state.fieldErrors.currency}>
          <Select name="currency" defaultValue="USD" required>
            {CURRENCIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="How do you currently track sales?" error={state.fieldErrors.salesTracking}>
        <Select name="salesTracking" defaultValue="Notebook" required>
          {TRACKING_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </Select>
      </Field>

      <Field label="How do you currently track expenses?" error={state.fieldErrors.expenseTracking}>
        <Select name="expenseTracking" defaultValue="Notebook" required>
          {TRACKING_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </Select>
      </Field>

      {state.formError && (
        <p className="rounded-md border border-bad/30 bg-bad-soft px-3 py-2 text-sm text-bad">
          {state.formError}
        </p>
      )}

      <SubmitButton />

      <p className="text-center text-xs text-muted">
        We&apos;ll seed your account with realistic sample data so you can explore right away.
      </p>
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
    <label className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold uppercase tracking-widest text-navy-700">{label}</span>
      {children}
      {error && <span className="text-xs text-bad">{error}</span>}
    </label>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Setting up your workspace…" : "Open my dashboard →"}
    </Button>
  );
}
