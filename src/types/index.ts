export enum Role {
  ADMIN = "ADMIN",
  DOCTOR = "DOCTOR",
  RECEPTIONIST = "RECEPTIONIST",
  PATIENT = "PATIENT",
}

export enum AppointmentStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
  COMPLETED = "COMPLETED",
}

export enum InvoiceStatus {
  PAID = "PAID",
  PENDING = "PENDING",
  CANCELLED = "CANCELLED",
}

export interface IUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
  createdAt: Date;
  doctor?: IDoctor;
  patient?: IPatient;
}

export interface IPatient {
  id: string;
  userId: string;
  user?: IUser;
  dateOfBirth?: Date | null;
  gender?: string | null;
  bloodGroup?: string | null;
  phone?: string | null;
  address?: string | null;
  emergencyContact?: string | null;
  medicalHistory?: string | null;
  appointments?: IAppointment[];
  medicalRecords?: IMedicalRecord[];
  invoices?: IInvoice[];
  beds?: IBed[];
}

export interface IDoctor {
  id: string;
  userId: string;
  user?: IUser;
  specialization: string;
  licenseNumber: string;
  experience: number;
  consultationFee: number;
  schedule?: Record<string, unknown> | null;
  appointments?: IAppointment[];
  medicalRecords?: IMedicalRecord[];
}

export interface IAppointment {
  id: string;
  patientId: string;
  patient?: IPatient;
  doctorId: string;
  doctor?: IDoctor;
  date: Date;
  time: string;
  status: AppointmentStatus;
  reason?: string | null;
  notes?: string | null;
  createdAt: Date;
  medicalRecord?: IMedicalRecord | null;
  invoice?: IInvoice | null;
}

export interface IMedicalRecord {
  id: string;
  patientId: string;
  patient?: IPatient;
  doctorId: string;
  doctor?: IDoctor;
  appointmentId: string;
  appointment?: IAppointment;
  diagnosis: string;
  prescription?: string | null;
  labResults?: string | null;
  followUpDate?: Date | null;
  createdAt: Date;
  prescriptions?: IPrescription[];
}

export interface IPrescription {
  id: string;
  medicalRecordId: string;
  medicalRecord?: IMedicalRecord;
  medicineName: string;
  dosage: string;
  duration: string;
  instructions?: string | null;
}

export interface IInvoice {
  id: string;
  appointmentId: string;
  appointment?: IAppointment;
  patientId: string;
  patient?: IPatient;
  amount: number;
  tax: number;
  total: number;
  status: InvoiceStatus;
  paymentMethod?: string | null;
  issuedAt: Date;
}

export interface IInventory {
  id: string;
  itemName: string;
  category: string;
  quantity: number;
  unit: string;
  reorderLevel: number;
  expiryDate?: Date | null;
  supplier?: string | null;
  costPerUnit: number;
  updatedAt: Date;
}

export interface IWard {
  id: string;
  name: string;
  floor: number;
  totalBeds: number;
  availableBeds: number;
  type: string;
  beds?: IBed[];
}

export interface IBed {
  id: string;
  wardId: string;
  ward?: IWard;
  bedNumber: string;
  isOccupied: boolean;
  patientId?: string | null;
  patient?: IPatient | null;
}
