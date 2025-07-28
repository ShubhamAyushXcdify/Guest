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

export interface DewormingIntake {
  id: string;
  visitId: string;
  weightKg: number;
  lastDewormingDate: string;
  symptomsNotes: string;
  temperatureC: number;
  appetiteFeedingNotes: string;
  currentMedications: string;
  isStoolSampleCollected: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DewormingMedication {
  id: string;
  visitId: string;
  productName: string;
  batchNumber: string;
  dose: string;
  route: string;
  dateTimeGiven: string;
  veterinarianName: string;
  manufacturer: string;
  expiryDate: string;
  administeredBy: string;
  remarks: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DewormingNote {
  id: string;
  visitId: string;
  adverseReactions: string;
  additionalNotes: string;
  ownerConcerns: string;
  followUpRequired: boolean;
  resolutionStatus: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DewormingCheckout {
  id: string;
  visitId: string;
  summary: string;
  nextDewormingDueDate: string;
  homeCareInstructions: string;
  clientAcknowledged: boolean;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DischargeSummaryDeworming {
  visitId: string;
  appointmentId: string;
  patientId: string;
  visitCreatedAt: string;
  visitUpdatedAt: string;
  isDewormingIntakeCompleted: boolean;
  isDewormingMedicationCompleted: boolean;
  isDewormingNotesCompleted: boolean;
  isDewormingCheckoutCompleted: boolean;
  appointment: Appointment;
  patient: Patient;
  client: Client;
  veterinarian: Veterinarian;
  clinic: Clinic;
  room: Room;
  dewormingIntake: DewormingIntake;
  dewormingMedication: DewormingMedication;
  dewormingNote: DewormingNote;
  dewormingCheckout: DewormingCheckout;
}

export const getDischargeSummaryDeworming = async (visitId: string) => {
  try {
    const response = await fetch(`/api/discharge-summary/deworming/${visitId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch discharge summary deworming');
    }
    
    const data = await response.json();
    return data.data as DischargeSummaryDeworming;
  } catch (error) {
    console.error("Error fetching discharge summary deworming:", error);
    throw error;
  }
};

export function useGetDischargeSummaryDeworming(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ['dischargeSummaryDeworming', visitId],
    queryFn: () => getDischargeSummaryDeworming(visitId),
    enabled: enabled && !!visitId,
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
} 