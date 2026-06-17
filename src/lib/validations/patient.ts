import { z } from "zod";

export const patientSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  dateOfBirth: z.string().optional().nullable(),
  gender: z.string().optional().nullable(),
  bloodGroup: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  emergencyContact: z.string().optional().nullable(),
  medicalHistory: z.string().optional().nullable(),
});

export type PatientFormData = z.infer<typeof patientSchema>;

export const updatePatientSchema = patientSchema.partial().omit({ password: true });
export type UpdatePatientFormData = z.infer<typeof updatePatientSchema>;
