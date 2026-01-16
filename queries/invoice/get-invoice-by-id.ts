import { useQuery } from "@tanstack/react-query"

interface InvoiceDetail {
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
  overallProductDiscount: number
  overallProductDiscountPercentage: number
  paymentMethod: string
  clinicId: string
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
  prescriptionDetail?: {
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
      productName: string
      purchaseOrderReceivingHistoryId: string
      product: {
        id: string
        productNumber: string
        name: string
        genericName: string
        category: string
        productType: string
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
      purchaseOrderReceivingHistory: {
        id: string
        purchaseOrderId: string
        purchaseOrderItemId: string
        productId: string
        clinicId: string
        quantityReceived: number
        batchNumber: string
        expiryDate: string
        dateOfManufacture: string
        receivedDate: string
        receivedBy: string
        notes: string
        unitCost: number
        lotNumber: string
        supplierId: string
        createdAt: string
        updatedAt: string
        productName: string
        clinicName: string
        supplierName: string
        receivedByName: string
        orderNumber: string
        quantityInHand: number
        barcode: string
        shelf: string
        bin: string
        barcodeNumber: string
        productDetails: {
          id: string
          productNumber: string
          name: string
          genericName: string
          category: string
          productType: string
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
        supplierDetails: {
          id: string
          clinicId: string
          name: string
          contactPerson: string
          email: string
          phone: string
          addressLine1: string
          addressLine2: string
          city: string
          state: string
          postalCode: string
          accountNumber: string
          paymentTerms: string
          isActive: boolean
          createdAt: string
          updatedAt: string
        }
      }
    }>
  }
  products?: Array<{
    id: string
    purchaseOrderReceivingHistoryId: string
    quantity: number
    isGiven: boolean
    discount: number
    discountPercentage: number
    receivingHistory: {
      id: string
      purchaseOrderId: string
      purchaseOrderItemId: string
      productId: string
      clinicId: string
      quantityReceived: number
      batchNumber: string
      expiryDate: string
      dateOfManufacture: string
      receivedDate: string
      receivedBy: string
      notes: string
      unitCost: number
      lotNumber: string
      supplierId: string
      createdAt: string
      updatedAt: string
      productName: string
      clinicName: string
      supplierName: string
      receivedByName: string
      orderNumber: string
      quantityInHand: number
      barcode: string
      shelf: string
      bin: string
      barcodeNumber: string
      productDetails: {
        id: string
        productNumber: string
        name: string
        genericName: string
        category: string
        productType: string
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
      supplierDetails: {
        id: string
        clinicId: string
        name: string
        contactPerson: string
        email: string
        phone: string
        addressLine1: string
        addressLine2: string
        city: string
        state: string
        postalCode: string
        accountNumber: string
        paymentTerms: string
        isActive: boolean
        createdAt: string
        updatedAt: string
      }
    }
    product: {
      id: string
      companyId: string
      productNumber: string
      name: string
      genericName: string
      category: string
      ndcNumber: string
      dosageForm: string
      unitOfMeasure: string
      requiresPrescription: boolean
      controlledSubstanceSchedule: string
      brandName: string
      storageRequirements: string
      isActive: boolean
      price: number
      sellingPrice: number
      createdAt: string
      updatedAt: string
      reorderThreshold: number
    }
  }>
}

const getInvoiceById = async (id: string): Promise<InvoiceDetail> => {
  const response = await fetch(`/api/invoice/${id}`)
  
  if (!response.ok) {
    const errorData = await response.text()
    throw new Error(`Failed to fetch invoice: ${response.status} - ${errorData}`)
  }

  return response.json()
}

export const useGetInvoiceById = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['invoice', id],
    queryFn: () => getInvoiceById(id),
    enabled: enabled && !!id,
  })
}

export type { InvoiceDetail }