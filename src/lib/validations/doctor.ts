import { z } from "zod";

export const doctorSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  specialization: z.string().min(1, "Specialization is required"),
  licenseNumber: z.string().min(1, "License number is required"),
  experience: z.coerce.number().min(0, "Experience must be a non-negative number"),
  consultationFee: z.coerce.number().min(0, "Consultation fee must be a non-negative number"),
  schedule: z
    .object({
      monday: z.string().optional(),
      tuesday: z.string().optional(),
      wednesday: z.string().optional(),
      thursday: z.string().optional(),
      friday: z.string().optional(),
      saturday: z.string().optional(),
      sunday: z.string().optional(),
    })
    .optional()
    .nullable(),
});

export type DoctorFormData = z.infer<typeof doctorSchema>;

export const updateDoctorSchema = doctorSchema.partial().omit({ password: true });
export type UpdateDoctorFormData = z.infer<typeof updateDoctorSchema>;
