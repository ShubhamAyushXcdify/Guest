"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs-new"
import { Checkbox } from "@/components/ui/checkbox"
import { CheckCircle, AlertTriangle, ChevronLeft } from "lucide-react"
import { useGetVaccinationMasters } from "@/queries/vaccinationMaster/get-vaccinationMaster"
import VaccinationRecord from "./VaccinationRecord"

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
}

interface VaccinationPlanningProps {
  patientId: string;
  appointmentId: string;
  species: string;
  onNext: (selectedVaccines: string[]) => void;
  onClose: () => void;
}

export default function VaccinationPlanning({ 
  patientId, 
  appointmentId, 
  species, 
  onNext, 
  onClose 
}: VaccinationPlanningProps) {
  // Update the active tab state
  const [activeTab, setActiveTab] = useState("vaccination-planning");
  const [selectedVaccines, setSelectedVaccines] = useState<string[]>([]);
  
  // Convert species to lowercase for API call
  const speciesLowerCase = species.toLowerCase();
  
  // Fetch vaccination data from API
  const { data: vaccinations = [], isLoading, error } = useGetVaccinationMasters({
    species: speciesLowerCase
  });
  
  // Separate core and non-core vaccines
  const coreVaccines = vaccinations.filter((vaccine: Vaccination) => vaccine.isCore);
  const nonCoreVaccines = vaccinations.filter((vaccine: Vaccination) => !vaccine.isCore);

  const handleVaccineSelection = (id: string) => {
    setSelectedVaccines(prev => {
      if (prev.includes(id)) {
        return prev.filter(vaccineId => vaccineId !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // Handle next button click
  const handleNext = () => {
    if (selectedVaccines.length === 0) {
      // Show message or tooltip indicating vaccines need to be selected
      return;
    }
    setActiveTab("record-keeping");
  };

  // Handle record submission - this is no longer used directly
  // Since we're now navigating to the VaccinationRecord component separately
  const handleRecordSubmit = (data: any) => {
    console.log("Vaccination record submitted:", data);
    onNext(selectedVaccines);
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

  return (
    <Sheet open={true} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[50%] lg:!max-w-[50%] overflow-x-hidden overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Vaccination Planning</SheetTitle>
        </SheetHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="vaccination-planning">
              Vaccination Planning
            </TabsTrigger>
            <TabsTrigger value="record-keeping">
              Record Keeping
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vaccination-planning">
            <div className="p-6">
              <h2 className="text-2xl font-bold">Vaccination Schedule Planning</h2>
              <p className="text-gray-600 mb-4">Select appropriate vaccines based on pet species and risk factors</p>

              {isLoading ? (
                <div className="text-center py-10">Loading vaccination data...</div>
              ) : error ? (
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
                            <span className="px-3 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                              Core
                            </span>
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
                            <span className="px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full">
                              Non-Core
                            </span>
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
                    <span>Please select at least one vaccine to continue to the record keeping step.</span>
                  </div>
                )}
                
                <div className="flex justify-between">
                <Button 
                  onClick={onClose}
                  variant="outline"
                  className="px-5"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleNext}
                    className={`text-white px-5 ${selectedVaccines.length === 0 ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed" : "bg-gray-500 hover:bg-gray-600"}`}
                  disabled={isLoading || selectedVaccines.length === 0}
                >
                  Next: Record Keeping
                </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="record-keeping">
            {selectedVaccines.length === 0 ? (
              <div className="p-6">
                <div className="rounded-lg border border-amber-200 bg-amber-50 p-6 text-center">
                  <div className="flex flex-col items-center space-y-4">
                    <AlertTriangle className="h-12 w-12 text-amber-500" />
                    <h3 className="text-lg font-medium">No Vaccinations Selected</h3>
                    <p className="text-gray-600 max-w-md">
                      Please go back and select at least one vaccination before proceeding to record keeping.
                    </p>
                    <Button 
                      onClick={() => setActiveTab("vaccination-planning")}
                      className="mt-4"
                      variant="outline"
                    >
                      <ChevronLeft className="mr-2 h-4 w-4" />
                      Back to Vaccination Selection
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
            <VaccinationRecord
              patientId={patientId}
              appointmentId={appointmentId}
              species={species}
              selectedVaccines={selectedVaccines}
              onBack={() => setActiveTab("vaccination-planning")}
              onSubmit={handleRecordSubmit}
            />
            )}
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
} 