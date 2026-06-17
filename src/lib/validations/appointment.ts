import { z } from "zod";

export const appointmentSchema = z.object({
  patientId: z.string().min(1, "Patient is required"),
  doctorId: z.string().min(1, "Doctor is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  reason: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export type AppointmentFormData = z.infer<typeof appointmentSchema>;

export const updateAppointmentSchema = appointmentSchema.partial();
export type UpdateAppointmentFormData = z.infer<typeof updateAppointmentSchema>;
