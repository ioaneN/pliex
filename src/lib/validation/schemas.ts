import { z } from "zod";

export const onboardingSchema = z.object({
  businessName: z.string().min(2, "Tell us your business name").max(80),
  businessType: z.enum(["cafe", "bakery", "food_shop"]),
  currency: z.string().min(3).max(4),
  salesTracking: z.string().min(1),
  expenseTracking: z.string().min(1)
});

export type OnboardingInput = z.infer<typeof onboardingSchema>;

export const addSaleSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category: z.string().max(60).optional().nullable(),
  saleDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date").optional(),
  notes: z.string().max(500).optional().nullable()
});

export const addExpenseSchema = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category: z.string().max(60).optional().nullable(),
  expenseDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Pick a valid date").optional(),
  vendorName: z.string().max(120).optional().nullable(),
  notes: z.string().max(500).optional().nullable()
});

export const assistantQuestionSchema = z.object({
  question: z.string().min(1).max(500)
});
