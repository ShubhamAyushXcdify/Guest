import { useQuery } from "@tanstack/react-query"

export interface PatientFileAttachment {
  id: string
  fileName: string
  filePath: string
  fileType: string
  fileSize?: number
  createdAt?: string
  updatedAt?: string
}

export interface PatientFileItem {
  id: string
  patientId: string
  name: string
  createdBy: string
  createdByName?: string
  createdAt: string
  updatedAt: string
  attachments: PatientFileAttachment[]
}

export interface PatientFilesResponse {
  items: PatientFileItem[]
  totalCount?: number
}

const getPatientFiles = async (patientId: string): Promise<PatientFilesResponse> => {
  if (!patientId) {
    throw new Error("Patient ID is required")
  }

  const response = await fetch(`/api/patient/files/patient/${patientId}`)
  if (!response.ok) {
    const msg = await response.text().catch(() => "Failed to fetch patient files")
    throw new Error(msg)
  }
  const data = await response.json()

  // Normalize to { items: [...] } shape for table reuse
  return Array.isArray(data) ? { items: data } : (data as PatientFilesResponse)
}

export const useGetPatientFiles = (patientId: string) => {
  return useQuery({
    queryKey: ["patient-files", patientId],
    queryFn: () => getPatientFiles(patientId),
    enabled: !!patientId,
  })
}

export type { PatientFileItem as PatientFile }


