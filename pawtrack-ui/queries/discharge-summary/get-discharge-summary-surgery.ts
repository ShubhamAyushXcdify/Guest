import { useQuery } from "@tanstack/react-query";

export interface Location {
  lat: number;
  lng: number;
  address: string;
}

export interface Clinic {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  taxId: string;
  licenseNumber: string;
  subscriptionStatus: string;
  subscriptionExpiresAt: string;
  createdAt: string;
  updatedAt: string;
  location: Location;
}

export interface DoctorSlot {
  id: string;
  day: string;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Veterinarian {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  roleName: string;
  roleId: string;
  clinicId: string;
  clinicName: string;
  clinic: Clinic;
  isActive: boolean;
  lastLogin: string;
  createdAt: string;
  updatedAt: string;
  doctorSlots: DoctorSlot[];
}

export interface Patient {
  id: string;
  clientId: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhonePrimary: string;
  clientPhoneSecondary: string;
  clientAddressLine1: string;
  clientAddressLine2: string;
  clientCity: string;
  clientState: string;
  clientPostalCode: string;
  clientEmergencyContactName: string;
  clientEmergencyContactPhone: string;
  clientNotes: string;
  name: string;
  species: string;
  breed: string;
  color: string;
  gender: string;
  isNeutered: boolean;
  dateOfBirth: string;
  weightKg: number;
  microchipNumber: string;
  registrationNumber: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;
  allergies: string;
  medicalConditions: string;
  behavioralNotes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phonePrimary: string;
  phoneSecondary: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  clinicId: string;
  name: string;
  roomType: string;
  isActive: boolean;
  createdAt: string;
}

export interface AppointmentType {
  appointmentTypeId: string;
  name: string;
  isActive: boolean;
}

export interface Appointment {
  id: string;
  clinicId: string;
  patientId: string;
  clientId: string;
  veterinarianId: string;
  roomId: string;
  appointmentDate: string;
  appointmentTimeFrom: string;
  appointmentTimeTo: string;
  roomSlotId: string;
  appointmentTypeId: string;
  reason: string;
  status: string;
  notes: string;
  isRegistered: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  clinic: Clinic;
  patient: Patient;
  client: Client;
  veterinarian: Veterinarian;
  room: Room;
  appointmentType: AppointmentType;
}

export interface SurgeryPreOp {
  id: string;
  visitId: string;
  weightKg: number;
  preOpBloodworkResults: string;
  anesthesiaRiskAssessment: string;
  fastingStatus: string;
  preOpMedications: string;
  notes: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SurgeryDetail {
  id: string;
  visitId: string;
  surgeryType: string;
  surgeon: string;
  anesthesiologist: string;
  surgeryStartTime: string;
  surgeryEndTime: string;
  anesthesiaProtocol: string;
  surgicalFindings: string;
  complications: string;
  notes: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SurgeryPostOp {
  id: string;
  visitId: string;
  recoveryStatus: string;
  painAssessment: string;
  vitalSigns: string;
  postOpMedications: string;
  woundCare: string;
  notes: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SurgeryDischarge {
  id: string;
  visitId: string;
  dischargeStatus: string;
  dischargeDatetime: string;
  homeCareInstructions: string;
  medicationsToGoHome: string;
  followUpInstructions: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DischargeSummarySurgery {
  visitId: string;
  appointmentId: string;
  patientId: string;
  visitCreatedAt: string;
  visitUpdatedAt: string;
  isSurgeryPreOpCompleted: boolean;
  isSurgeryDetailsCompleted: boolean;
  isSurgeryPostOpCompleted: boolean;
  isSurgeryDischargeCompleted: boolean;
  appointment: Appointment;
  patient: Patient;
  client: Client;
  veterinarian: Veterinarian;
  clinic: Clinic;
  room: Room;
  surgeryPreOp: SurgeryPreOp;
  surgeryDetail: SurgeryDetail;
  surgeryPostOp: SurgeryPostOp;
  surgeryDischarge: SurgeryDischarge;
}

export const getDischargeSummarySurgery = async (visitId: string) => {
  try {
    const response = await fetch(`/api/discharge-summary/surgery/${visitId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch discharge summary surgery');
    }
    
    const data = await response.json();
    return data.data as DischargeSummarySurgery;
  } catch (error) {
    console.error("Error fetching discharge summary surgery:", error);
    throw error;
  }
};

export function useGetDischargeSummarySurgery(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ['dischargeSummarySurgery', visitId],
    queryFn: () => getDischargeSummarySurgery(visitId),
    enabled: enabled && !!visitId,
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
} 