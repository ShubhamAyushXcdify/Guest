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

export interface File {
  id: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
  updatedAt: string;
}

export interface IntakeDetail {
  id: string;
  visitId: string;
  weightKg: number;
  notes: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  files: File[];
}

export interface Symptom {
  id: string;
  name: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface ComplaintDetail {
  id: string;
  visitId: string;
  notes: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  symptoms: Symptom[];
}

export interface MedicalHistoryDetail {
  id: string;
  visitId: string;
  chronicConditionsNotes: string;
  surgeriesNotes: string;
  currentMedicationsNotes: string;
  generalNotes: string;
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
}

export interface VitalDetail {
  id: string;
  visitId: string;
  temperatureC: number;
  heartRateBpm: number;
  respiratoryRateBpm: number;
  mucousMembraneColor: string;
  capillaryRefillTimeSec: number;
  hydrationStatus: string;
  notes: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export interface PlanDetail {
  id: string;
  visitId: string;
  notes: string;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
  plans: Plan[];
}

export interface Procedure {
  id: string;
  name: string;
  notes: string;
  type: string;
  procCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProcedureDetail {
  id: string;
  visitId: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  isCompleted: boolean;
  procedures: Procedure[];
}

export interface Product {
  id: string;
  productNumber: string;
  name: string;
  genericName: string;
  category: string;
  productType: string;
  manufacturer: string;
  ndcNumber: string;
  strength: string;
  dosageForm: string;
  unitOfMeasure: string;
  requiresPrescription: boolean;
  controlledSubstanceSchedule: string;
  brandName: string;
  storageRequirements: string;
  isActive: boolean;
  price: number;
}

export interface ProductMapping {
  id: string;
  productId: string;
  dosage: string;
  frequency: string;
  quantity: number;
  product: Product;
}

export interface PrescriptionDetail {
  id: string;
  visitId: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  productMappings: ProductMapping[];
}

export interface DischargeSummaryConsultation {
  visitId: string;
  appointmentId: string;
  patientId: string;
  visitCreatedAt: string;
  visitUpdatedAt: string;
  isIntakeCompleted: boolean;
  isComplaintsCompleted: boolean;
  isMedicalHistoryCompleted: boolean;
  isVitalsCompleted: boolean;
  isPlanCompleted: boolean;
  isProceduresCompleted: boolean;
  isPrescriptionCompleted: boolean;
  isVaccinationDetailCompleted: boolean;
  appointment: Appointment;
  patient: Patient;
  client: Client;
  veterinarian: Veterinarian;
  clinic: Clinic;
  room: Room;
  intakeDetail: IntakeDetail;
  complaintDetail: ComplaintDetail;
  medicalHistoryDetail: MedicalHistoryDetail;
  vitalDetail: VitalDetail;
  planDetail: PlanDetail;
  procedureDetail: ProcedureDetail;
  prescriptionDetail: PrescriptionDetail;
}

export const getDischargeSummaryConsultation = async (visitId: string) => {
  try {
    const response = await fetch(`/api/discharge-summary/consultation/${visitId}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to fetch discharge summary consultation');
    }
    
    const data = await response.json();
    return data.data as DischargeSummaryConsultation;
  } catch (error) {
    console.error("Error fetching discharge summary consultation:", error);
    throw error;
  }
};

export function useGetDischargeSummaryConsultation(visitId: string, enabled = true) {
  return useQuery({
    queryKey: ['dischargeSummaryConsultation', visitId],
    queryFn: () => getDischargeSummaryConsultation(visitId),
    enabled: enabled && !!visitId,
    retry: 1,
    staleTime: 30000,
    refetchOnWindowFocus: false,
  });
} 