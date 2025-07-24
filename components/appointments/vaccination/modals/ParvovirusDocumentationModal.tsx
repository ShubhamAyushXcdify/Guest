import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/datePicker";
import { Combobox } from "@/components/ui/combobox";
import { useGetUsers } from "@/queries/users/get-users";
import { useGetVisitByAppointmentId } from "@/queries/visit/get-visit-by-appointmentId";
import { useGetVaccinationJsonByIds } from "@/queries/vaccinationDetail/get-vaccination-json-by-ids";
import { useUpdateVaccinationJson } from "@/queries/vaccinationDetail/update-vaccination-json";
import { useState, useEffect } from "react";

interface ParvovirusDocumentationModalProps {
  open: boolean;
  onClose: () => void;
  vaccine: any;
  patientId: string;
  appointmentId: string;
  species: string;
  clinicId?: string;
}

export default function ParvovirusDocumentationModal({ open, onClose, vaccine, appointmentId, clinicId }: ParvovirusDocumentationModalProps) {
  const [dateGiven, setDateGiven] = useState<Date | null>(null);
  const [nextDueDate, setNextDueDate] = useState<Date | null>(null);
  const [batchNumber, setBatchNumber] = useState("");
  const [veterinarianId, setVeterinarianId] = useState("");
  const [adverseReactions, setAdverseReactions] = useState("");

  // Fetch veterinarians for the selected clinic
  const { data: usersResponse = { items: [] } } = useGetUsers(1, 100, '', clinicId || '');
  const veterinarianOptions = (usersResponse.items || [])
    .filter(user => user.roleName === "Veterinarian" && (user as any).clinicId === clinicId)
    .map(vet => ({
      value: vet.id,
      label: `Dr. ${vet.firstName} ${vet.lastName}`
    }));

  const { data: visitData } = useGetVisitByAppointmentId(appointmentId);
  const visitId = visitData?.id;
  const vaccinationMasterId = vaccine?.id;
  const { data: vaccinationJsonData } = useGetVaccinationJsonByIds(visitId || '', vaccinationMasterId || '');
  const updateVaccinationJson = useUpdateVaccinationJson();

  useEffect(() => {
    if (vaccinationJsonData?.vaccinationJson) {
      try {
        const parsed = JSON.parse(vaccinationJsonData.vaccinationJson);
        setDateGiven(parsed.dateGiven ? new Date(parsed.dateGiven) : null);
        setNextDueDate(parsed.nextDueDate ? new Date(parsed.nextDueDate) : null);
        setBatchNumber(parsed.batchNumber || "");
        setVeterinarianId(parsed.veterinarianId || "");
        setAdverseReactions(parsed.adverseReactions || "");
      } catch {}
    }
  }, [vaccinationJsonData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitId || !vaccinationMasterId) return;
    const payload = {
      visitId,
      vaccinationMasterId,
      vaccinationJson: JSON.stringify({
        dateGiven,
        nextDueDate,
        batchNumber,
        veterinarianId,
        adverseReactions,
      }),
    };
    updateVaccinationJson.mutate(payload, {
      onSuccess: onClose,
    });
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="right" className="w-full sm:!max-w-full md:!max-w-[50%] lg:!max-w-[50%] overflow-x-hidden overflow-y-auto">
        <SheetTitle asChild>
          <h2 className="text-2xl font-bold">Parvovirus Vaccination Record</h2>
        </SheetTitle>
        <form className="p-6 space-y-6" onSubmit={handleSubmit}>
          <p className="text-gray-600">Custom documentation for Parvovirus vaccination</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">Vaccine</label>
              <Input value={vaccine?.disease || ""} disabled />
            </div>
            <div>
              <label className="block font-medium mb-1">Date Given *</label>
              <DatePicker value={dateGiven} onChange={setDateGiven} className="w-full" />
            </div>
            <div>
              <label className="block font-medium mb-1">Next Due Date *</label>
              <DatePicker value={nextDueDate} onChange={setNextDueDate} className="w-full" />
            </div>
            <div>
              <label className="block font-medium mb-1">Batch Number *</label>
              <Input value={batchNumber} onChange={e => setBatchNumber(e.target.value)} placeholder="Enter batch number" required />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Veterinarian *</label>
              <Combobox
                options={veterinarianOptions}
                value={veterinarianId}
                onValueChange={setVeterinarianId}
                placeholder="Select veterinarian"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-medium mb-1">Adverse Reactions (if any)</label>
              <Textarea value={adverseReactions} onChange={e => setAdverseReactions(e.target.value)} placeholder="Note any adverse reactions or side effects" rows={4} className="resize-none" />
            </div>
          </div>
          <Button type="submit" className="w-full bg-black text-white">Add Vaccination Record</Button>
        </form>
      </SheetContent>
    </Sheet>
  );
} 