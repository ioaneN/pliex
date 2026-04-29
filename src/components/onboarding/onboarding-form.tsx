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

const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "GEL"];

export function OnboardingForm() {
  const [state, formAction] = useFormState(completeOnboarding, INITIAL_STATE);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="businessType" value="internet_cafe" />
      <input type="hidden" name="salesTracking" value="Gizmo" />
      <input type="hidden" name="expenseTracking" value="Gizmo" />

      <Field label="Business name" error={state.fieldErrors.businessName}>
        <Input name="businessName" placeholder="e.g. Pixel LAN Lounge" required />
      </Field>

      <div className="rounded-md border border-line bg-white/60 px-3 py-2.5 text-sm text-ink-soft">
        <span className="font-semibold text-navy-800">Internet café</span>
        {" · "}
        <span className="font-semibold text-navy-800">Gizmo Suite</span>
        <p className="mt-1 text-xs text-muted">
          Pliex MVP is tuned for this setup. You&apos;ll connect Gizmo from the dashboard after signup.
        </p>
      </div>

      <Field label="Currency" error={state.fieldErrors.currency}>
        <Select name="currency" defaultValue="USD" required>
          {CURRENCIES.map((c) => (
            <option key={c} value={c}>{c}</option>
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
        We&apos;ll seed your account with sample data so you can explore; replace it with live Gizmo sync when you connect.
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
