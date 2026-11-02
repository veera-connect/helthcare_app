export type Role = "admin" | "doctor" | "patient" | "receptionist";

export interface User {
  id: string;
  email: string;
  role: Role;
  is_active: boolean;
}

export interface AuthTokens {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface Patient {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  address?: string;
  blood_group?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  email?: string;
}

export interface Specialization {
  id: string;
  name: string;
  description?: string;
}

export interface Doctor {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  license_number: string;
  phone?: string;
  bio?: string;
  years_of_experience?: number;
  consultation_fee?: number;
  is_available: boolean;
  specializations: Specialization[];
}

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "no_show";

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  cancellation_reason?: string;
}

export interface Prescription {
  id: string;
  medical_record_id: string;
  medication_name: string;
  dosage: string;
  frequency: string;
  duration?: string;
  instructions?: string;
  start_date?: string;
  end_date?: string;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id?: string;
  appointment_id?: string;
  record_type: string;
  title: string;
  description?: string;
  diagnosis?: string;
  treatment?: string;
  record_date: string;
  prescriptions: Prescription[];
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}

export interface AIMessage {
  message: string;
  session_id: string;
  is_emergency_redirect: boolean;
  disclaimer?: string;
  suggested_actions: string[];
}
