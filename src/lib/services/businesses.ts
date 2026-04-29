import { createSupabaseServerClient } from "@/lib/supabase/server-client";
import type { BusinessRow, BusinessType, PosSystem } from "@/types/database";

export interface CreateBusinessInput {
  ownerUserId: string;
  name: string;
  businessType: BusinessType;
  currency: string;
  posSystem?: PosSystem | null;
}

/**
 * Returns the single business owned by the authenticated user, or null
 * if they haven't completed onboarding yet.
 *
 * MVP: one owner ↔ one business.
 */
export async function getOwnedBusiness(): Promise<BusinessRow | null> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function createBusiness(input: CreateBusinessInput): Promise<BusinessRow> {
  const supabase = createSupabaseServerClient();
  const { data, error } = await supabase
    .from("businesses")
    .insert({
      owner_user_id: input.ownerUserId,
      name: input.name,
      business_type: input.businessType,
      currency: input.currency,
      pos_system: input.posSystem ?? null
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
