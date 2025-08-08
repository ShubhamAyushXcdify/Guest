import { useQuery } from "@tanstack/react-query";

// Use the updated interfaces from the types file
// Location of the clinic
export interface Location {
  lat: number;
  lng: number;
  address: string;
}

// Clinic details
export interface Clinic {
  id: string;
  name: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website?: string;
  taxId?: string;
  licenseNumber?: string;
  subscriptionStatus?: string;
  subscriptionExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  location: Location;
}

// Veterinarian available slots
export interface DoctorSlot {
  id: string;
  day: string; // e.g. "Monday"
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

// Veterinarian profile
export interface Veterinarian {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  roleName: string;
  roleId: string;
  clinicId: string;
  clinicName: string;
  clinic: Clinic;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  doctorSlots: DoctorSlot[];
}

// Pet/Patient info
export interface Patient {
  id: string;
  clientId: string;
  clientFirstName: string;
  clientLastName: string;
  clientEmail: string;
  clientPhonePrimary: string;
  clientPhoneSecondary?: string;
  clientAddressLine1: string;
  clientAddressLine2?: string;
  clientCity: string;
  clientState: string;
  clientPostalCode: string;
  clientEmergencyContactName: string;
  clientEmergencyContactPhone: string;
  clientNotes?: string;
  name: string;
  species: string;
  breed: string;
  color: string;
  gender: string;
  isNeutered: boolean;
  dateOfBirth: string;
  weightKg: number;
  microchipNumber?: string;
  registrationNumber?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  allergies?: string;
  medicalConditions?: string;
  behavioralNotes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Pet owner info
export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phonePrimary: string;
  phoneSecondary?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Room info in clinic
export interface Room {
  id: string;
  clinicId: string;
  name: string;
  roomType: string;
  isActive: boolean;
  createdAt: string;
}

// Type of appointment
export interface AppointmentType {
  appointmentTypeId: string;
  name: string;
  isActive: boolean;
}

// Appointment details
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
  reason?: string;
  status: string;
  notes?: string;
  isRegistered: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;

  // Nested objects
  clinic: Clinic;
  patient: Patient;
  client: Client;
  veterinarian: Veterinarian;
  room: Room;
  appointmentType: AppointmentType;
}

// Master data for vaccinations
export interface VaccinationMaster {
  id: string;
  species: string;
  isCore: boolean;
  disease: string;
  vaccineType: string;
  initialDose: string;
  booster: string;
  revaccinationInterval: string;
  notes?: string;
  vacCode: string;
  vaccinationJson: string;
  createdAt: string;
  updatedAt: string;
}

// Vaccination detail for a visit
export interface VaccinationDetail {
  id: string;
  visitId: string;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  vaccinationMasters: VaccinationMaster[];
}

// Vaccination discharge summary
export interface DischargeSummaryVaccination {
  visitId: string;
  appointmentId: string;
  patientId: string;
  visitCreatedAt: string;
  visitUpdatedAt: string;
  isVaccinationDetailCompleted: boolean;
  isVaccinationCompleted: boolean;

  appointment: Appointment;
  patient: Patient;
  client: Client;
  veterinarian: Veterinarian;
  clinic: Clinic;
  room: Room;
  vaccinationDetails: VaccinationDetail[];
}

export interface Data {
  data: DischargeSummaryVaccination;
}


export const getDischargeSummaryVaccination = async (
  visitId: string
): Promise<Data> => {
  console.log("Fetching vaccination data for visitId:", visitId);
  const response = await fetch(`/api/discharge-summary/vaccination/${visitId}`);
  console.log("Response status:", response.status);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to fetch vaccination data");
  }
  const data = await response.json();
  console.log("Response JSON:", data);
  return data;
};

export function useGetDischargeSummaryVaccination(visitId: string, enabled = true) {
  return useQuery<Data>({
    queryKey: ['DischargeSummaryVaccination', visitId],
    queryFn: () => getDischargeSummaryVaccination(visitId),
    enabled: enabled && !!visitId,
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
} 