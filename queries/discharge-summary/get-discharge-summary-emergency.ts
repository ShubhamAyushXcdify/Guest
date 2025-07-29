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

export interface EmergencyTriage {
  id: string;
  arrivalTime: string;
  triageNurseDoctor: string;
  triageCategory: string;
  painScore: number;
  allergies: string;
  immediateInterventionRequired: boolean;
  reasonForEmergency: string;
  triageLevel: string;
  presentingComplaint: string;
  initialNotes: string;
  isComplete: boolean;
  createdAt: string;
  updatedAt: string;
  visitId: string;
}

export interface EmergencyVitals {
  id: string;
  visitId: string;
  weightKg: number;
  capillaryRefillTimeSec: number;
  mucousMembraneColor: string;
  oxygenSaturationSpo2: number;
  bloodGlucoseMgDl: number;
  temperatureC: number;
  heartRhythm: string;
  heartRateBpm: number;
  respiratoryRateBpm: number;
  bloodPressure: string;
  supplementalOxygenGiven: boolean;
  notes: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyMedication {
  id: string;
  name: string;
  dose: string;
  route: string;
  time: string;
}

export interface EmergencyProcedures {
  id: string;
  visitId: string;
  procedureTime: string;
  ivCatheterPlacement: boolean;
  oxygenTherapy: boolean;
  cpr: boolean;
  woundCare: boolean;
  bandaging: boolean;
  defibrillation: boolean;
  bloodTransfusion: boolean;
  intubation: boolean;
  otherProcedure: boolean;
  otherProcedurePerformed: string;
  performedBy: string;
  medications: EmergencyMedication[];
  fluidsType: string;
  fluidsVolumeMl: number;
  fluidsRateMlHr: number;
  responseToTreatment: string;
  notes: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyPrescription {
  id: string;
  emergencyDischargeId: string;
  visitId: string;
  medicationName: string;
  dose: string;
  frequency: string;
  duration: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyDischarges {
  id: string;
  visitId: string;
  dischargeStatus: string;
  dischargeTime: string;
  responsibleClinician: string;
  dischargeSummary: string;
  homeCareInstructions: string;
  followupInstructions: string;
  reviewedWithClient: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  prescriptions: EmergencyPrescription[];
}

export interface DischargeSummaryEmergency {
  visitId: string;
  appointmentId: string;
  patientId: string;
  visitCreatedAt: string;
  visitUpdatedAt: string;
  isEmergencyTriageCompleted: boolean;
  isEmergencyVitalCompleted: boolean;
  isEmergencyProcedureCompleted: boolean;
  isEmergencyDischargeCompleted: boolean;
  appointment: Appointment;
  patient: Patient;
  client: Client;
  veterinarian: Veterinarian;
  clinic: Clinic;
  room: Room;
  emergencyTriage: EmergencyTriage;
  emergencyVitals: EmergencyVitals;
  emergencyProcedures: EmergencyProcedures;
  emergencyDischarges: EmergencyDischarges;
}

export const getDischargeSummaryEmergency = async (visitId: string) => {
  try {
    const response = await fetch(`/api/discharge-summary/emergency/${visitId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch discharge summary emergency');
    }
    
    const data = await response.json();
    return data.data as DischargeSummaryEmergency;
  } catch (error) {
    console.error("Error fetching discharge summary emergency:", error);
    throw error;
  }
};

export function useGetDischargeSummaryEmergency(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ['dischargeSummaryEmergency', visitId],
    queryFn: () => getDischargeSummaryEmergency(visitId),
    enabled: enabled && !!visitId,
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
} 