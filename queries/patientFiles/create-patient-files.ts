import { useMutation, useQueryClient } from "@tanstack/react-query"

export interface CreatePatientFilesInput {
  patientId: string
  name: string
  createdBy?: string
  files?: File[]
  // Optional metadata array if caller wants to send explicit fields, otherwise derived
  filesMetadata?: Array<{
    fileName: string
    filePath?: string
    fileType?: string
    fileSize?: number
    fileData?: string
  }>
}

const createPatientFiles = async (payload: CreatePatientFilesInput) => {
  if (!payload.patientId) throw new Error("Patient ID is required")
  if ((!payload.files || payload.files.length === 0) && (!payload.filesMetadata || payload.filesMetadata.length === 0)) {
    throw new Error("At least one file is required")
  }

  const formData = new FormData()
  formData.append("PatientId", payload.patientId)
  const effectiveName = payload.name && payload.name.trim().length > 0
    ? payload.name
    : (payload.files && payload.files[0]?.name) || "Attachment"
  formData.append("Name", effectiveName)
  const fallbackUserId = process.env.NEXT_PUBLIC_TEST_USER_ID
  const createdBy = payload.createdBy || (fallbackUserId ? String(fallbackUserId) : undefined)
  if (createdBy) formData.append("CreatedBy", createdBy)

  // If metadata provided, use it; otherwise derive minimal metadata from selected files
  if (payload.filesMetadata && payload.filesMetadata.length > 0) {
    // Use provided metadata
    formData.append("Files", JSON.stringify(payload.filesMetadata))
  } else if (payload.files && payload.files.length > 0) {
    // Auto-generate minimal metadata per file, to match Swagger schema
    const derived = payload.files.map((f) => ({
      fileName: f.name,
      filePath: "", // no path at upload time
      fileType: f.type || "application/octet-stream",
      fileSize: typeof f.size === "number" ? f.size : 0,
      fileData: "", // binary is carried via multipart 'files'
    }))
    formData.append("Files", JSON.stringify(derived))
  }

  // Optional actual file uploads (field name `files` per backend screenshot)
  if (payload.files) {
    for (const file of payload.files) {
      formData.append("files", file)
    }
  }

  const response = await fetch(`/api/patient/files`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const errorText = await response.text().catch(() => "Failed to upload files")
    throw new Error(errorText)
  }

  return response.json()
}

export const useCreatePatientFiles = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreatePatientFilesInput) => createPatientFiles(payload),
    onSuccess: (_data, variables) => {
      // Refresh files list for this patient
      queryClient.invalidateQueries({ queryKey: ["patient-files", variables.patientId] })
    },
  })
}


