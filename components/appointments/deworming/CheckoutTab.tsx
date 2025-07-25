import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateDewormingCheckout, useUpdateDewormingCheckout } from "@/queries/deworming/checkout/create-deworming-checkout";

interface CheckoutTabProps {
  patientId: string;
  appointmentId: string;
  onClose: () => void;
}

export default function CheckoutTab({ patientId, appointmentId, onClose }: CheckoutTabProps) {
  const [summary, setSummary] = useState("");
  const [nextDue, setNextDue] = useState("");
  const [instructions, setInstructions] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [clientAcknowledged, setClientAcknowledged] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("Paid");

  const createCheckout = useCreateDewormingCheckout();
  const updateCheckout = useUpdateDewormingCheckout();

  const handleSave = async () => {
    const payload = {
      visitId: appointmentId,
      summary: summary || undefined,
      nextDewormingDueDate: nextDue || undefined,
      homeCareInstructions: instructions || undefined,
      clientAcknowledged,
      isCompleted: false,
    };
    await createCheckout.mutateAsync(payload);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block font-medium mb-1">Summary</label>
        <Textarea
          value={summary}
          onChange={e => setSummary(e.target.value)}
          placeholder="Summary of visit and treatment"
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Next Deworming Due Date</label>
        <Input
          type="date"
          value={nextDue}
          onChange={e => setNextDue(e.target.value)}
        />
      </div>
      <div>
        <label className="block font-medium mb-1">Home Care Instructions</label>
        <Textarea
          value={instructions}
          onChange={e => setInstructions(e.target.value)}
          placeholder="Instructions for the client to follow at home"
        />
      </div>
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="client-acknowledgement"
          checked={clientAcknowledged}
          onChange={e => setClientAcknowledged(e.target.checked)}
        />
        <label htmlFor="client-acknowledgement" className="text-sm">Client has received and understood instructions</label>
      </div>
      <div className="flex justify-end">
        <button
          type="button"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          onClick={handleSave}
          disabled={createCheckout.isLoading}
        >
          Save Checkout
        </button>
      </div>
      {createCheckout.isError && (
        <div className="text-red-500 text-sm">Error saving checkout.</div>
      )}
      {createCheckout.isSuccess && (
        <div className="text-green-600 text-sm">Checkout saved successfully!</div>
      )}
      <button onClick={onClose} className="bg-black text-white px-4 py-2 rounded">Finish & Close</button>
    </div>
  );
} 