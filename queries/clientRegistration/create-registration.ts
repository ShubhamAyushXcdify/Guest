import { useMutation } from "@tanstack/react-query";
import { toast } from "@/components/ui/use-toast";

export interface PetRegistration {
  name: string;
  species: string;
  breed?: string;
  secondaryBreed?: string;
  color?: string;
  gender?: string;
  isNeutered?: boolean;
  dateOfBirth?: string;
  weightKg?: number;
  microchipNumber?: string;
  registrationNumber?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  allergies?: string;
  medicalConditions?: string;
  behavioralNotes?: string;
  isActive?: boolean;
}

export interface ClientRegistrationPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phonePrimary: string;
  phoneSecondary?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  companyId: string;
  includePetsInRegistration?: boolean;
  pets?: PetRegistration[];
}

export interface ClientRegistration {
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
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  status: string;
  rejectionReason?: string;
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

const createClientRegistration = async (registrationData: ClientRegistrationPayload): Promise<ClientRegistration> => {
  try {
    const response = await fetch('/api/clientRegistration', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Client Registration API error response:", errorData);
      throw new Error(errorData.message || 'Failed to create client registration');
    }

    const data = await response.json();
    return data as ClientRegistration;
  } catch (error) {
    console.error("Error in createClientRegistration function:", error);
    throw error;
  }
};

export function useCreateClientRegistration() {
  return useMutation({
    mutationFn: createClientRegistration,
    onSuccess: () => {
      toast({
        title: "Registration Submitted",
        description: "Your registration has been submitted successfully.",
        variant: "default",
      });
    },
    onError: (error: Error) => {
      console.error("Client registration error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit registration",
        variant: "destructive",
      });
    },
  });
}
