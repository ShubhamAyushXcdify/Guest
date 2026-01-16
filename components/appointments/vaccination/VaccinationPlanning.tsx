"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs-new"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, AlertTriangle, History } from "lucide-react"
import { useGetVaccinationMasters } from "@/queries/vaccinationMaster/get-vaccinationMaster"
import VaccinationRecord from "./VaccinationRecord"
import VaccinationDocumentationModal from "./modals/VaccinationDocumentationModal";
import { useRootContext } from "@/context/RootContext";
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId";
import { useUpdateAppointment } from "@/queries/appointment/update-appointment";
import { useCreateVaccinationDetail } from "@/queries/vaccinationDetail/create-vaccinationDetail";
import { useUpdateVaccinationDetail } from "@/queries/vaccinationDetail/update-vaccinationDetail";
import { toast } from "sonner";
import { useGetVaccinationDetailsByVisitId } from "@/queries/vaccinationDetail/get-vaccinationDetail-by-visitId";
import { useGetAppointmentById } from "@/queries/appointment/get-appointment-by-id";
import MedicalHistoryTab from "../MedicalHistoryTab";
import { TabCompletionProvider } from "@/context/TabCompletionContext";
import { cn } from "@/lib/utils"
import { useGetVaccinationJsonByIds } from "@/queries/vaccinationDetail/get-vaccination-json-by-ids";
import VaccineItemCertificate from "../certification/vaccine-item-certificate";

interface Vaccination {
  id: string;
  species: string;
  isCore: boolean;
  disease: string;
  vaccineType: string;
  initialDose: string;
  booster: string;
  revaccinationInterval: string;
  notes: string;
  vacCode?: string; // Add vacCode for type safety
}

interface VaccinationPlanningProps {
  patientId: string;
  appointmentId: string;
  species: string;
  onNext: (selectedVaccines: string[]) => void;
  onClose: () => void;
  clinicId?: string;
  isReadOnly?: boolean;
  embedded?: boolean; // When true, don't wrap in Sheet (used within tabs)
  hideMedicalHistoryButton?: boolean; // When true, hide the Medical History button
}

function VaccineGenerateButton({ visitId, vaccinationMasterId, onClick, selected }: { visitId: string; vaccinationMasterId: string; onClick: () => void; selected: boolean }) {
  const { data } = useGetVaccinationJsonByIds(visitId || "", vaccinationMasterId || "");
  if (!selected) return null;
  if (!data || !data.vaccinationJson) return null;
  return (
    <Button
      size="sm"
      variant="default"
      onClick={onClick}
    >
      Generate/Print
    </Button>
  );
}

export default function VaccinationPlanning({
  patientId,
  appointmentId,
  species,
  onNext,
  onClose,
  clinicId,
  isReadOnly,
  embedded = false,
  hideMedicalHistoryButton = false,
}: VaccinationPlanningProps) {
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([]);
  const [documentVaccineId, setDocumentVaccineId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vaccinationDetailId, setVaccinationDetailId] = useState<string | null>(null);
  const [showMedicalHistory, setShowMedicalHistory] = useState(false);
  const [certificateVaccineId, setCertificateVaccineId] = useState<string | null>(null);
  // Convert species to lowercase for API call
  const speciesLowerCase = species.toLowerCase();

  // Fetch vaccination data from API
  const { data: vaccinations = [], isLoading, error } = useGetVaccinationMasters({
    species: speciesLowerCase
  });
  const typedVaccinations: Vaccination[] = vaccinations;

  ;

  const handleVaccineSelection = async (id: string) => {

    if (isReadOnly) return;
    if (!visitData || !visitData.id) {
      toast.error("No visit data found for this appointment");
      return;
    }
    let newSelected: string[];
    if (selectedVaccines.includes(id)) {
      newSelected = selectedVaccines.filter(vaccineId => vaccineId !== id);
    } else {
      newSelected = [...selectedVaccines, id];
    }

    setSelectedVaccines(newSelected);

    if (!vaccinationDetails || vaccinationDetails.length === 0) {
      // First selection: create
      try {
        await createVaccinationDetail.mutateAsync({
          visitId: visitData.id,
          notes: "",
          isCompleted: false,
          vaccinationMasterIds: newSelected,
        });
        // Refetch to get the new id
        const { data: newDetails } = await refetchVaccinationDetails();
        if (newDetails && newDetails.length > 0) {
          setVaccinationDetailId(newDetails[0].id);
        }
      } catch (error) {
        toast.error("Failed to create vaccination detail");
      }
    } else {
      // Always use the latest id from backend
      const latestId = vaccinationDetails[0].id;
      try {
        await updateVaccinationDetail.mutateAsync({
          id: latestId,
          data: {
            id: latestId,
            notes: "",
            isCompleted: false,
            vaccinationMasterIds: newSelected,
          },
        });
        // Refetch to ensure state is up to date
        const { data: newDetails } = await refetchVaccinationDetails();
        if (newDetails && newDetails.length > 0) {
          setVaccinationDetailId(newDetails[0].id);
        }
      } catch (error) {
        toast.error("Failed to update vaccination detail");
      }
    }
  };

  // Get frequency from revaccinationInterval field
  const getFrequency = (vaccine: Vaccination) => {
    if (vaccine.revaccinationInterval.toLowerCase().includes("year")) {
      return vaccine.revaccinationInterval.split(" ").slice(0, 2).join(" ");
    }
    return "As needed";
  };
  const hasAnyDocumentation = () => {
    return selectedVaccines.length > 0 && vaccinationDetails && 
           vaccinationDetails.length > 0 && vaccinationDetails[0].isCompleted;
  };

  // Format species name for display (capitalize first letter)
  const displaySpecies = species.charAt(0).toUpperCase() + species.slice(1).toLowerCase();

  // Find the vaccine object for the currently documented vaccine
  const documentVaccine = typedVaccinations.find((v) => v.id === documentVaccineId);

  // Fetch visit data for this appointment
  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId);

  // Fetch existing vaccination details for this visit
  const { data: vaccinationDetails, isLoading: vaccinationDetailsLoading, refetch: refetchVaccinationDetails } = useGetVaccinationDetailsByVisitId(visitData?.id || "");

  // Fetch full appointment data for update
  const { data: appointmentData, isLoading: appointmentLoading } = useGetAppointmentById(appointmentId);

  // Initialize state from existing data if details exist
  useEffect(() => {
    if (vaccinationDetails && vaccinationDetails.length > 0) {
      // Assuming only one detail per visit, or use the first one
      setVaccinationDetailId(vaccinationDetails[0].id);
      setSelectedVaccines(vaccinationDetails[0].vaccinationMasterIds || []);
    }
  }, [vaccinationDetails]);

  // Mutations for checkout
  const createVaccinationDetail = useCreateVaccinationDetail();
  const updateAppointment = useUpdateAppointment({
    onSuccess: () => {
      setIsProcessing(false);
      toast.success("Vaccination checkout completed");
      onClose();
    },
    onError: (error) => {
      setIsProcessing(false);
      toast.error("Failed to update appointment status");
    }
  });
  const updateVaccinationDetail = useUpdateVaccinationDetail();

  // Checkout handler
  const handleCheckout = async () => {
    if (!visitData?.id) {
      toast.error("No visit data found for this appointment")
      return
    }
    if (selectedVaccines.length === 0) {
      toast.error("Please select at least one vaccine before checking out")
      return
    }
    if (!appointmentData) {
      toast.error("No appointment data found")
      return
    }
    setIsProcessing(true)
    try {
      // Mark vaccination detail as completed
      if (vaccinationDetailId) {
        await updateVaccinationDetail.mutateAsync({
          id: vaccinationDetailId,
          data: {
            id: vaccinationDetailId,
            notes: "",
            isCompleted: true,
            vaccinationMasterIds: selectedVaccines,
          },
        })
      } else {
        // If for some reason no vaccination detail exists, create it as completed
        await createVaccinationDetail.mutateAsync({
          visitId: visitData.id,
          notes: "",
          isCompleted: true,
          vaccinationMasterIds: selectedVaccines,
        })
      }
      // Update appointment status to completed, sending the full object
      await updateAppointment.mutateAsync({
        id: appointmentId,
        data: {
          ...appointmentData,
          status: "completed"
        }
      })
      toast.success("Vaccination checkout completed")
      if (onClose) {
        onClose()
      }
    } catch (error) {
      toast.error("Error during vaccination checkout")
      setIsProcessing(false)
    }
  }

  if (isLoading || visitLoading || vaccinationDetailsLoading) {
    return <div>Loading...</div>;
  }
  const hasCompletedDetail = vaccinationDetails && 
                           vaccinationDetails.length > 0 && 
                           vaccinationDetails[0].isCompleted;

  // Content to render (shared between embedded and non-embedded modes)
  const content = (
    <div className="w-full">
      <div className="">
        {error ? (
          <div className="text-center py-10 text-red-500">Error loading vaccination data</div>
        ) : (
          <div className="space-y-6 border p-4 rounded-md">
            {/* Unified Vaccines Section */}
            {typedVaccinations.length > 0 && (
              <div>
                <h3 className="flex items-center text-lg font-medium mb-2">
                  Available Vaccines
                </h3>
                <div className="space-y-2">
                  {typedVaccinations.map((vaccine: Vaccination) => (
                    <div
                      key={vaccine.id}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center">
                        <Checkbox
                          id={vaccine.id}
                          checked={selectedVaccines.includes(vaccine.id)}
                          onCheckedChange={() => !isReadOnly && handleVaccineSelection(vaccine.id)}
                          className="mr-3"
                          disabled={isReadOnly}
                        />

                        <div>
                          <label htmlFor={vaccine.id} className="font-medium cursor-pointer">
                            {vaccine.disease}
                          </label>
                          <p className="text-sm text-gray-600">
                            Type: {vaccine.vaccineType}
                          </p>
                          <p className="text-sm text-gray-600">
                            Frequency: {getFrequency(vaccine)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {selectedVaccines.includes(vaccine.id) && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setDocumentVaccineId(vaccine.id)}
                          >
                            Document
                          </Button>
                        )}
                        <VaccineGenerateButton
                          visitId={visitData?.id || ""}
                          vaccinationMasterId={vaccine.id}
                          selected={selectedVaccines.includes(vaccine.id)}
                          onClick={() => setCertificateVaccineId(vaccine.id)}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {typedVaccinations.length === 0 && (
              <div className="text-center py-10">
                No vaccination data available for {displaySpecies}
              </div>
            )}
          </div>
        )}

        <div className="mt-6">
          {selectedVaccines.length === 0 && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded text-amber-800 text-sm flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
              <span>Please select at least one vaccine to continue.</span>
            </div>
          )}

          <div className="flex justify-end">
            <div className="flex gap-2">
              <Button
                onClick={handleCheckout}
                className="text-white px-5 bg-green-600 hover:bg-green-700"
                disabled={isLoading || visitLoading || selectedVaccines.length === 0 || isProcessing || isReadOnly}
              >
                {isProcessing ? "Processing..." : "Checkout"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Vaccine-specific documentation modals */}
      {documentVaccineId && documentVaccine && (
        <VaccinationDocumentationModal
          open={true}
          onClose={() => setDocumentVaccineId(null)}
          vaccine={documentVaccine}
          patientId={patientId}
          appointmentId={appointmentId}
          species={species}
          clinicId={clinicId}
          isReadOnly={isReadOnly}
        />
      )}
    </div>
  );

  // When embedded, render content directly without Sheet wrapper
  if (embedded) {
    return (
      <>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Vaccination Planning</h2>
          {!hideMedicalHistoryButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowMedicalHistory(true)}
              className="flex items-center gap-2"
            >
              <History className="h-4 w-4" />
              Medical History
            </Button>
          )}
        </div>
        {content}
        {/* Medical History Sheet */}
        <Sheet open={showMedicalHistory} onOpenChange={setShowMedicalHistory}>
          <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[50%] lg:!max-w-[50%] overflow-x-hidden overflow-y-auto">
            <SheetHeader className="mb-6">
              <SheetTitle>Medical History</SheetTitle>
            </SheetHeader>
            <TabCompletionProvider>
              <MedicalHistoryTab
                patientId={patientId}
                appointmentId={appointmentId}
                onNext={() => setShowMedicalHistory(false)}
              />
            </TabCompletionProvider>
          </SheetContent>
        </Sheet>
        {certificateVaccineId && (
          <VaccineItemCertificate
            appointmentId={appointmentId}
            patientId={patientId}
            vaccinationMasterId={certificateVaccineId}
            onClose={() => setCertificateVaccineId(null)}
          />
        )}
      </>
    );
  }

  // Non-embedded mode: wrap in Sheet
  return (
    <>
      <Sheet open={true} onOpenChange={onClose}>
        <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[80%] lg:!max-w-[80%] overflow-x-hidden overflow-y-auto">
          <SheetHeader className="mb-6 mr-10">
            <div className="flex items-center justify-between">
              <SheetTitle>Vaccination Planning</SheetTitle>
              {!hideMedicalHistoryButton && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowMedicalHistory(true)}
                  className="flex items-center gap-2"
                >
                  <History className="h-4 w-4" />
                  Medical History
                </Button>
              )}
            </div>
          </SheetHeader>
          {content}
        </SheetContent>
      </Sheet>

      {/* Medical History Sheet */}
      <Sheet open={showMedicalHistory} onOpenChange={setShowMedicalHistory}>
        <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[50%] lg:!max-w-[50%] overflow-x-hidden overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Medical History</SheetTitle>
          </SheetHeader>
          <TabCompletionProvider>
            <MedicalHistoryTab
              patientId={patientId}
              appointmentId={appointmentId}
              onNext={() => setShowMedicalHistory(false)}
            />
          </TabCompletionProvider>
        </SheetContent>
      </Sheet>
      {certificateVaccineId && (
        <VaccineItemCertificate
          appointmentId={appointmentId}
          patientId={patientId}
          vaccinationMasterId={certificateVaccineId}
          onClose={() => setCertificateVaccineId(null)}
        />
      )}
    </>
  );
} 