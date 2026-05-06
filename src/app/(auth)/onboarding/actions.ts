"use server";

import { redirect } from "next/navigation";
import { onboardingSchema } from "@/lib/validation/schemas";
import { createBusiness } from "@/lib/services/businesses";
import { getCurrentUser } from "@/lib/supabase/get-current-user";

export interface OnboardingFormState {
  fieldErrors: Partial<Record<string, string>>;
  formError?: string;
}

export async function completeOnboarding(
  _prev: OnboardingFormState,
  formData: FormData
): Promise<OnboardingFormState> {
  const parsed = onboardingSchema.safeParse({
    businessName: formData.get("businessName"),
    businessType: formData.get("businessType"),
    currency: formData.get("currency"),
    salesTracking: formData.get("salesTracking"),
    expenseTracking: formData.get("expenseTracking")
  });

  if (!parsed.success) {
    return { fieldErrors: flatten(parsed.error.flatten().fieldErrors) };
  }

  const user = await getCurrentUser();
  if (!user) return { fieldErrors: {}, formError: "Sign in expired. Please sign in again." };

  try {
    await createBusiness({
      ownerUserId: user.id,
      name: parsed.data.businessName,
      businessType: parsed.data.businessType,
      currency: parsed.data.currency,
      posSystem: "square"
    });
  } catch (err) {
    console.error("[onboarding] createBusiness failed", err);
    return {
      fieldErrors: {},
      formError: "Could not create your workspace right now. Please try again."
    };
  }

  redirect("/dashboard");
}

function flatten(errors: Record<string, string[] | undefined>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(errors)) {
    if (value && value.length > 0) out[key] = value[0];
  }
  return out;
}
