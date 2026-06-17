import { z } from "zod";

export const billingSchema = z.object({
  appointmentId: z.string().min(1, "Appointment is required"),
  patientId: z.string().min(1, "Patient is required"),
  amount: z.coerce.number().min(0, "Amount must be a non-negative number"),
  tax: z.coerce.number().min(0).max(100).default(13),
  paymentMethod: z.string().optional().nullable(),
});

export type BillingFormData = z.infer<typeof billingSchema>;

export const updateBillingSchema = billingSchema.partial();
export type UpdateBillingFormData = z.infer<typeof updateBillingSchema>;
