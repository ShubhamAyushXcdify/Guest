import { useState } from "react"
import { useDebounce } from "@/hooks/use-debounce"
import { useSearchPatients, Patient as ApiPatient } from "@/queries/patients/get-patients-by-search"

export interface Patient {
    id: string
    name: string
    email?: string
    phone?: string
    address?: string
    clientName?: string
}

export function usePatientSearch(query: string, searchType: string) {
    const debouncedQuery = useDebounce(query, 300)
    
    // Use the React Query hook we created
    const { data, isLoading, error } = useSearchPatients(debouncedQuery, searchType)
    
    // Transform the data to match the expected interface and filter out any invalid entries
    const transformedResults = data 
        ? data.map(transformPatient).filter(result => result !== null) as Patient[]
        : []
    
    // Log for debugging
    console.log("API Patient data:", data);
    console.log("Transformed results:", transformedResults);
    
    return { 
        results: transformedResults, 
        isLoading, 
        error: error ? (error instanceof Error ? error.message : "An error occurred") : null 
    }
}

// Helper function to transform API patient data to the component's expected format
function transformPatient(patient: any): Patient | null {
    // Skip invalid data
    if (!patient || typeof patient !== 'object' || !patient.id) {
        console.warn("Invalid patient data:", patient);
        return null;
    }

    // Determine the patient name based on what data is available
    let patientName = "";

    // Option 1: Name is directly available as a property
    if (patient.name && typeof patient.name === 'string') {
        patientName = patient.name;
        
        // Add species info if available for pet patients
        if (patient.species) {
            patientName += ` (${patient.species}`;
            if (patient.breed) {
                patientName += `, ${patient.breed}`;
            }
            patientName += ')';
        }
    } 
    // Option 2: PatientId might be used as name for animal patients
    else if (patient.patientId) {
        patientName = patient.patientId;
        // Add species info if available
        if (patient.species) {
            patientName += ` (${patient.species}`;
            if (patient.breed) {
                patientName += `, ${patient.breed}`;
            }
            patientName += ')';
        }
    }
    // Option 3: Name is in the format common for humans (first/last name)
    else if (patient.firstName || patient.lastName) {
        const first = patient.firstName || '';
        const last = patient.lastName || '';
        patientName = `${first} ${last}`.trim();
    }
    // Option 4: The patient object structure might include a nested 'patient' property
    else if (patient.patient && patient.patient.name) {
        patientName = patient.patient.name;
        // Add species info if available
        if (patient.patient.species) {
            patientName += ` (${patient.patient.species})`;
        }
    }
    // Option 5: If there's a client, use the client's name
    else if (patient.client && (patient.client.firstName || patient.client.lastName)) {
        const clientFirst = patient.client.firstName || '';
        const clientLast = patient.client.lastName || '';
        patientName = `${clientFirst} ${clientLast}'s Patient`.trim();
    }
    
    // If we still don't have a name, use a more informative default
    if (!patientName) {
        patientName = `Patient (ID: ${patient.id.substring(0, 8)}...)`;
    }

    // Create client display name if client data exists
    let clientName = '';
    if (patient.client && (patient.client.firstName || patient.client.lastName)) {
        clientName = `${patient.client.firstName || ''} ${patient.client.lastName || ''}`.trim();
    }

    return {
        id: patient.id,
        name: patientName,
        email: patient.client?.email || patient.email || '',
        phone: patient.client?.phoneNumber || patient.phone || '',
        clientName: clientName || undefined,
        // Add more fields as needed
    }
} 