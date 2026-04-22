"use server";

import { redirect } from "next/navigation";
import { onboardingSchema } from "@/lib/validation/schemas";
import { createBusiness } from "@/lib/services/businesses";
import { seedDemoDataForBusiness } from "@/lib/services/seed-demo-data";
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
    const business = await createBusiness({
      ownerUserId: user.id,
      name: parsed.data.businessName,
      businessType: parsed.data.businessType,
      currency: parsed.data.currency
    });
    await seedDemoDataForBusiness(business.id, parsed.data.businessType);
  } catch (err) {
    return {
      fieldErrors: {},
      formError: err instanceof Error ? err.message : "Could not create your business."
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
