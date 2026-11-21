export type Role = "ADMIN" | "USER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Doctor {
  id: string;
  name: string;
  specialization: string;
  hospital: string;
  phone: string;
  email: string;
  createdAt: string;
  patientCount?: number;
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "MALE" | "FEMALE" | "OTHER";
  phone: string;
  email?: string;
  condition: string;
  notes?: string;
  doctorId: string;
  doctor?: Doctor;
  createdAt: string;
}

export interface DashboardSummary {
  totalDoctors: number;
  totalPatients: number;
  avgPatientsPerDoctor: number;
  newPatientsLast30Days: number;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}