import { useQuery } from "@tanstack/react-query"

interface PatientInvoice {
  id: string
  visitId: string
  clientId: string
  patientId: string
  invoiceNumber: string
  itemsTotal: number
  consultationFee: number
  consultationDiscountPercentage: number
  consultationDiscount: number
  consultationFeeAfterDiscount: number
  notes: string
  total: number
  status: string
  createdAt: string
  updatedAt: string
  client: {
    id: string
    companyId: string
    firstName: string
    lastName: string
    email: string
    phonePrimary: string
    phoneSecondary: string
    addressLine1: string
    addressLine2: string
    city: string
    state: string
    postalCode: string
    emergencyContactName: string
    emergencyContactPhone: string
    notes: string
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  patient: {
    id: string
    clientId: string
    companyId: string
    clientFirstName: string
    clientLastName: string
    clientEmail: string
    clientPhonePrimary: string
    clientPhoneSecondary: string
    clientAddressLine1: string
    clientAddressLine2: string
    clientCity: string
    clientState: string
    clientPostalCode: string
    clientEmergencyContactName: string
    clientEmergencyContactPhone: string
    clientNotes: string
    name: string
    species: string
    breed: string
    secondaryBreed: string
    color: string
    gender: string
    isNeutered: boolean
    dateOfBirth: string
    weightKg: number
    microchipNumber: string
    registrationNumber: string
    insuranceProvider: string
    insurancePolicyNumber: string
    allergies: string
    medicalConditions: string
    behavioralNotes: string
    isActive: boolean
    createdAt: string
    updatedAt: string
  }
  prescriptionDetail: {
    id: string
    visitId: string
    notes: string
    createdAt: string
    updatedAt: string
    productMappings: Array<{
      id: string
      productId: string
      isChecked: boolean
      quantity: number
      frequency: string
      directions: string
      numberOfDays: number
      purchaseOrderReceivingHistoryId: string
      product: {
        id: string
        productNumber: string
        name: string
        genericName: string
        category: string
        manufacturer: string
        ndcNumber: string
        strength: string
        dosageForm: string
        unitOfMeasure: string
        requiresPrescription: boolean
        controlledSubstanceSchedule: string
        brandName: string
        storageRequirements: string
        isActive: boolean
        price: number
        sellingPrice: number
      }
    }>
  }
}

interface PatientInvoicesResponse {
  items: PatientInvoice[]
  totalCount: number
  pageNumber: number
  pageSize: number
  totalPages: number
  hasPreviousPage: boolean
  hasNextPage: boolean
}

interface GetPatientInvoicesParams {
  patientId: string
  pageNumber?: number
  pageSize?: number
  status?: string
  startDate?: string
  endDate?: string
}

const getPatientInvoices = async (params: GetPatientInvoicesParams): Promise<PatientInvoicesResponse> => {
  const searchParams = new URLSearchParams()
  searchParams.set('patientId', params.patientId)
  if (params.pageNumber) searchParams.set('pageNumber', params.pageNumber.toString())
  if (params.pageSize) searchParams.set('pageSize', params.pageSize.toString())
  if (params.status) searchParams.set('status', params.status)
  if (params.startDate) searchParams.set('createdAtFrom', params.startDate)
  if (params.endDate) searchParams.set('createdAtTo', params.endDate)

  const response = await fetch(`/api/invoice/filter?${searchParams.toString()}`)
  
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Failed to fetch patient invoices: ${response.status} - ${errorData}`)
  }

  return response.json()
}

export const useGetPatientInvoices = (params: GetPatientInvoicesParams) => {
  return useQuery({
    queryKey: ['patient-invoices', params],
    queryFn: () => getPatientInvoices(params),
    enabled: !!params.patientId,
  })
}

export type { PatientInvoice, PatientInvoicesResponse, GetPatientInvoicesParams }