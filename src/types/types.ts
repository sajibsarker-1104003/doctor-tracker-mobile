export type Role = "ADMIN" | "USER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

export interface Paginated<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  updatedAt: string;
  patientCount?: number;
}

export type Gender = "MALE" | "FEMALE" | "OTHER";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: Gender;
  phone: string;
  email?: string | null;
  condition: string;
  notes?: string | null;
  doctorId: string;
  createdAt: string;
  updatedAt: string;
  doctor?: Pick<Doctor, "id" | "name" | "specialization">;
}

export interface DashboardSummary {
  totalDoctors: number;
  totalPatients: number;
  avgPatientsPerDoctor: number;
  doctorsGrowth: number | null;
  patientsGrowth: number | null;
  newDoctorsLast30Days: number;
  newPatientsLast30Days: number;
}

export interface PatientsPerDoctorRow {
  doctorId: string;
  doctorName: string;
  count: number;
}

export interface TimelineRow {
  bucket: string;
  patients: number;
  doctors: number;
}

export interface ConditionRow {
  condition: string;
  count: number;
}

export interface SpecializationRow {
  specialization: string;
  count: number;
}