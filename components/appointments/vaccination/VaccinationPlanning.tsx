"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs-new"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, AlertTriangle } from "lucide-react"
import { useGetVaccinationMasters } from "@/queries/vaccinationMaster/get-vaccinationMaster"
import VaccinationRecord from "./VaccinationRecord"
import FpvDocumentationModal from "./modals/FpvDocumentationModal"
import CdvDocumentationModal from "./modals/CdvDocumentationModal";
import CavDocumentationModal from "./modals/CavDocumentationModal";
import CpvDocumentationModal from "./modals/CpvDocumentationModal";
import RabiesDocumentationModal from "./modals/RabiesDocumentationModal";
import DncBordetellaDocumentationModal from "./modals/DncBordetellaDocumentationModal";
import DncPivDocumentationModal from "./modals/DncPivDocumentationModal";
import DncLeptoDocumentationModal from "./modals/DncLeptoDocumentationModal";
import FelineLeukemiaDocumentationModal from "./modals/FelineLeukemiaDocumentationModal";
import FIVDocumentationModal from "./modals/FIVDocumentationModal";
import FelinePanleukopeniaDocumentationModal from "./modals/FelinePanleukopeniaDocumentationModal";
import FelineRhinotracheitisDocumentationModal from "./modals/FelineRhinotracheitisDocumentationModal";
import FelineCalicivirusDocumentationModal from "./modals/FelineCalicivirusDocumentationModal";
import LymeDocumentationModal from "./modals/LymeDocumentationModal";
import ParvovirusDocumentationModal from "./modals/ParvovirusDocumentationModal";
import HepatitisDocumentationModal from "./modals/HepatitisDocumentationModal";
import CanineInfluenzaDocumentationModal from "./modals/CanineInfluenzaDocumentationModal";
import KennelCoughDocumentationModal from "./modals/KennelCoughDocumentationModal";
import { useRootContext } from "@/context/RootContext";
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId";
import { useUpdateAppointment } from "@/queries/appointment/update-appointment";
import { useCreateVaccinationDetail } from "@/queries/vaccinationDetail/create-vaccinationDetail";
import { useUpdateVaccinationDetail } from "@/queries/vaccinationDetail/update-vaccinationDetail";
import { toast } from "sonner";
import ChlamydiaFelisDocumentationModal from "./modals/ChlamydiaFelisDocumentationModal";
import FelineInfectiousPeritonitisDocumentationModal from "./modals/FelineInfectiousPeritonitisDocumentationModal";
import { useGetVaccinationDetailsByVisitId } from "@/queries/vaccinationDetail/get-vaccinationDetail-by-visitId";

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
  clinicId?: string; // add this line
}

export default function VaccinationPlanning({ 
  patientId, 
  appointmentId, 
  species, 
  onNext, 
  onClose, 
  clinicId // add this line
}: VaccinationPlanningProps) {
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([]);
  const [documentVaccineId, setDocumentVaccineId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [vaccinationDetailId, setVaccinationDetailId] = useState<string | null>(null);
  
  // Convert species to lowercase for API call
  const speciesLowerCase = species.toLowerCase();
  
  // Fetch vaccination data from API
  const { data: vaccinations = [], isLoading, error } = useGetVaccinationMasters({
    species: speciesLowerCase
  });
  const typedVaccinations: Vaccination[] = vaccinations;
  
  // Separate core and non-core vaccines
  const coreVaccines = typedVaccinations.filter((vaccine) => vaccine.isCore);
  const nonCoreVaccines = typedVaccinations.filter((vaccine) => !vaccine.isCore);

  const handleVaccineSelection = async (id: string) => {
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

  // Format species name for display (capitalize first letter)
  const displaySpecies = species.charAt(0).toUpperCase() + species.slice(1).toLowerCase();

  // Find the vaccine object for the currently documented vaccine
  const documentVaccine = typedVaccinations.find((v) => v.id === documentVaccineId);

  // Fetch visit data for this appointment
  const { data: visitData, isLoading: visitLoading } = useGetVisitByAppointmentId(appointmentId);

  // Fetch existing vaccination details for this visit
  const { data: vaccinationDetails, isLoading: vaccinationDetailsLoading, refetch: refetchVaccinationDetails } = useGetVaccinationDetailsByVisitId(visitData?.id || "");

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
    if (!visitData || !visitData.id) {
      toast.error("No visit data found for this appointment");
      return;
    }
    if (selectedVaccines.length === 0) {
      toast.error("Please select at least one vaccine before checkout.");
      return;
    }
    setIsProcessing(true);
    try {
      // TODO: Collect actual vaccination details from documentation modals or next step
      const batchSubmission = {
        visitId: visitData.id,
        notes: "", // or collect notes from user input
        isCompleted: true,
        vaccinationMasterIds: selectedVaccines,
      };
      await createVaccinationDetail.mutateAsync(batchSubmission);
      await updateAppointment.mutateAsync({
        id: appointmentId,
        data: { status: "completed" }
      });
    } catch (error) {
      setIsProcessing(false);
      toast.error("Checkout failed. Please try again.");
    }
  };

  if (isLoading || visitLoading || vaccinationDetailsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[80%] lg:!max-w-[80%] overflow-x-hidden overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Vaccination Planning</SheetTitle>
        </SheetHeader>

        <div className="w-full">
          <div className="p-6">

            {error ? (
              <div className="text-center py-10 text-red-500">Error loading vaccination data</div>
            ) : (
              <div className="space-y-6">
                {/* Core Vaccines Section */}
                {coreVaccines.length > 0 && (
                  <div>
                    <h3 className="flex items-center text-lg font-medium mb-2">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                      Core Vaccines (Recommended for all {displaySpecies}s)
                    </h3>
                    <div className="space-y-2">
                      {coreVaccines.map((vaccine: Vaccination) => (
                        <div 
                          key={vaccine.id}
                          className="flex items-center justify-between p-4 bg-green-50 rounded-md"
                        >
                          <div className="flex items-center">
                            <Checkbox 
                              id={vaccine.id}
                              checked={selectedVaccines.includes(vaccine.id)}
                              onCheckedChange={() => handleVaccineSelection(vaccine.id)}
                              className="mr-3"
                            />
                            <div>
                              <label htmlFor={vaccine.id} className="font-medium cursor-pointer">
                                {vaccine.disease}
                              </label>
                              <p className="text-sm text-gray-600">
                                Frequency: {getFrequency(vaccine)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Core
                            </span>
                            {selectedVaccines.includes(vaccine.id) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDocumentVaccineId(vaccine.id)}
                              >
                                Document
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Non-Core Vaccines Section */}
                {nonCoreVaccines.length > 0 && (
                  <div>
                    <h3 className="flex items-center text-lg font-medium mb-2">
                      <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
                      Non-Core Vaccines (Based on lifestyle and risk factors)
                    </h3>
                    <div className="space-y-2">
                      {nonCoreVaccines.map((vaccine: Vaccination) => (
                        <div 
                          key={vaccine.id}
                          className="flex items-center justify-between p-4 bg-amber-50 rounded-md"
                        >
                          <div className="flex items-center">
                            <Checkbox 
                              id={vaccine.id}
                              checked={selectedVaccines.includes(vaccine.id)}
                              onCheckedChange={() => handleVaccineSelection(vaccine.id)}
                              className="mr-3"
                            />
                            <div>
                              <label htmlFor={vaccine.id} className="font-medium cursor-pointer">
                                {vaccine.disease}
                              </label>
                              <p className="text-sm text-gray-600">
                                Frequency: {getFrequency(vaccine)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                              Non-Core
                            </span>
                            {selectedVaccines.includes(vaccine.id) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Add debugging to check the vaccine data
                                  console.log("Selected vaccine:", vaccine);
                                  setDocumentVaccineId(vaccine.id);
                                }}
                              >
                                Document
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {coreVaccines.length === 0 && nonCoreVaccines.length === 0 && (
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
                    disabled={isLoading || visitLoading || selectedVaccines.length === 0 || isProcessing}
                  >
                    {isProcessing ? "Processing..." : "Checkout"}
                </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Vaccine-specific documentation modals */}
        {documentVaccineId && documentVaccine && (() => {
          // Log the exact vaccine data when opening a modal
          console.log("Opening modal for vaccine:", documentVaccine);
          
          // First check for exact disease name matches from the screenshot
          switch (documentVaccine.disease) {
            // Core vaccines
            case "Feline Panleukopenia Virus (FPV)":
              return (
                <FpvDocumentationModal
                  open={true}
                  onClose={() => setDocumentVaccineId(null)}
                  vaccine={documentVaccine}
                  patientId={patientId}
                  appointmentId={appointmentId}
                  species={species}
                  clinicId={clinicId}
                />
              );
            case "Feline Herpesvirus-1 (FHV-1)":
              return (
                <FelineRhinotracheitisDocumentationModal
                  open={true}
                  onClose={() => setDocumentVaccineId(null)}
                  vaccine={documentVaccine}
                  patientId={patientId}
                  appointmentId={appointmentId}
                  species={species}
                  clinicId={clinicId}
                />
              );
            case "Feline Calicivirus (FCV)":
              return (
                <FelineCalicivirusDocumentationModal
                  open={true}
                  onClose={() => setDocumentVaccineId(null)}
                  vaccine={documentVaccine}
                  patientId={patientId}
                  appointmentId={appointmentId}
                  species={species}
                  clinicId={clinicId}
                />
              );
            case "Rabies":
              return (
                <RabiesDocumentationModal
                  open={true}
                  onClose={() => setDocumentVaccineId(null)}
                  vaccine={documentVaccine}
                  patientId={patientId}
                  appointmentId={appointmentId}
                  species={species}
                  clinicId={clinicId}
                />
              );
              
            // Non-core vaccines
            case "Feline Leukemia Virus (FeLV)":
              return (
                <FelineLeukemiaDocumentationModal
                  open={true}
                  onClose={() => setDocumentVaccineId(null)}
                  vaccine={documentVaccine}
                  patientId={patientId}
                  appointmentId={appointmentId}
                  species={species}
                  clinicId={clinicId}
                />
              );
            case "Chlamydia felis":
              return (
                <ChlamydiaFelisDocumentationModal
                  open={true}
                  onClose={() => setDocumentVaccineId(null)}
                  vaccine={documentVaccine}
                  patientId={patientId}
                  appointmentId={appointmentId}
                  species={species}
                  clinicId={clinicId}
                />
              );
            case "Bordetella bronchiseptica":
              return (
                <DncBordetellaDocumentationModal
                  open={true}
                  onClose={() => setDocumentVaccineId(null)}
                  vaccine={documentVaccine}
                  patientId={patientId}
                  appointmentId={appointmentId}
                  species={species}
                  clinicId={clinicId}
                />
              );
            case "Feline Immunodeficiency Virus (FIV)":
              return (
                <FIVDocumentationModal
                  open={true}
                  onClose={() => setDocumentVaccineId(null)}
                  vaccine={documentVaccine}
                  patientId={patientId}
                  appointmentId={appointmentId}
                  species={species}
                  clinicId={clinicId}
                />
              );
            case "Feline Infectious Peritonitis (FIP)":
              return (
                <FelineInfectiousPeritonitisDocumentationModal
                  open={true}
                  onClose={() => setDocumentVaccineId(null)}
                  vaccine={documentVaccine}
                  patientId={patientId}
                  appointmentId={appointmentId}
                  species={species}
                  clinicId={clinicId}
                />
              );

            // Then fall back to vacCode if needed
            default:
              switch (documentVaccine.vacCode) {
                case "ccoFpv":
                  return (
                    <FpvDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                // Preserve other vacCode cases...
                case "dcoCdv":
                  return (
                    <CdvDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                case "dcoCav":
                  return (
                    <CavDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                case "dcoCpv":
                  return (
                    <CpvDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                case "dcoRabies":
                case "ccoRabies":
                  return (
                    <RabiesDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                case "dncBordetella":
                  return (
                    <DncBordetellaDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                case "dncPiv":
                  return (
                    <DncPivDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                case "dncLepto":
                  return (
                    <DncLeptoDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                case "felineLeukemia":
                  return (
                    <FelineLeukemiaDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                case "fiv":
                  return (
                    <FIVDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                case "felinePanleukopenia":
                  return (
                    <FelinePanleukopeniaDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                case "felineRhinotracheitis":
                  return (
                    <FelineRhinotracheitisDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                case "felineCalicivirus":
                  return (
                    <FelineCalicivirusDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                case "lyme":
                  return (
                    <LymeDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                case "parvovirus":
                  return (
                    <ParvovirusDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                case "hepatitis":
                  return (
                    <HepatitisDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                case "canineInfluenza":
                  return (
                    <CanineInfluenzaDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                case "kennelCough":
                  return (
                    <KennelCoughDocumentationModal
                      open={true}
                      onClose={() => setDocumentVaccineId(null)}
                      vaccine={documentVaccine}
                      patientId={patientId}
                      appointmentId={appointmentId}
                      species={species}
                      clinicId={clinicId}
                    />
                  );
                default:
                  // Final fallback - show alert and return null
                  console.error(`No modal found for vaccine: ${JSON.stringify(documentVaccine)}`);
                  alert(`No documentation modal available for ${documentVaccine.disease || 'this vaccine'}`);
                  return null;
              }
          }
        })()}
      </SheetContent>
    </Sheet>
  );
} 