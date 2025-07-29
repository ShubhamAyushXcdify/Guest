import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useCreateDewormingCheckout } from "@/queries/deworming/checkout/create-deworming-checkout";
import { useUpdateDewormingCheckout } from "@/queries/deworming/checkout/update-deworming-checkout";
import { useGetDewormingCheckoutByVisitId } from "@/queries/deworming/checkout/get-deworming-checkout-by-visit-id";
import { Card, CardContent } from "@/components/ui/card";
import { DatePicker } from "@/components/ui/datePicker";

interface CheckoutTabProps {
  patientId: string;
  appointmentId: string;
  visitId?: string;
  onClose: () => void;
  onComplete?: (completed: boolean) => void;
  allTabsCompleted: boolean;
  isCompleted?: boolean;
}

export default function CheckoutTab({ 
  patientId, 
  appointmentId, 
  visitId,
  onClose, 
  onComplete,
  allTabsCompleted,
  isCompleted = false 
}: CheckoutTabProps) {
  const [summary, setSummary] = useState("");
  const [nextDue, setNextDue] = useState<Date | null>(null);
  const [instructions, setInstructions] = useState("");
  const [followUpDate, setFollowUpDate] = useState("");
  const [clientAcknowledged, setClientAcknowledged] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("Paid");
  const [isSaving, setIsSaving] = useState(false);

  // Use visitId if available, otherwise fall back to appointmentId
  const effectiveVisitId = visitId || appointmentId;
  // Using the correct hook for checkout data, similar to the IntakeTab
  const { data: checkoutData, isLoading, isError, refetch } = useGetDewormingCheckoutByVisitId(effectiveVisitId);
  const createCheckout = useCreateDewormingCheckout();
  const updateCheckout = useUpdateDewormingCheckout();
  
  // Extract the first checkout if data is an array
  const data = Array.isArray(checkoutData) ? checkoutData[0] : checkoutData;

  // Notify parent component when data is loaded
  useEffect(() => {
    if (data && onComplete) {
      onComplete(!!data.isCompleted);
    }
  }, [data, onComplete]);

  // Load data when it becomes available
  useEffect(() => {
    if (data) {
      setSummary(data.summary || "");
      if (data.nextDewormingDueDate) {
        setNextDue(new Date(data.nextDewormingDueDate));
      }
      setInstructions(data.homeCareInstructions || "");
      setClientAcknowledged(!!data.clientAcknowledged);
    }
  }, [data]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        visitId: effectiveVisitId,
        summary: summary || undefined,
        nextDewormingDueDate: nextDue ? nextDue.toISOString().split('T')[0] : undefined,
        homeCareInstructions: instructions || undefined,
        clientAcknowledged,
        isCompleted: true, // Mark as completed
      };

      if (data && data.id) {
        await updateCheckout.mutateAsync({ id: data.id, ...payload });
      } else {
        await createCheckout.mutateAsync(payload);
      }
      
      await refetch();
      
      if (onComplete) {
        onComplete(true);
      }
    } catch (error) {
      console.error("Error saving checkout:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const hasExistingData = !!data?.id;

  // Show loading indicator while data is being fetched
  if (isLoading) return <div>Loading...</div>;

  return (
    <Card className="relative">
      <CardContent className="p-6">
        <div className="space-y-4">
          {isError && (
            <div className="p-2 bg-red-50 text-red-600 rounded mb-4">
              Error loading checkout data. You can still create a new checkout.
            </div>
          )}
          
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
            <DatePicker
              value={nextDue}
              onChange={setNextDue}
              placeholder="Select next due date"
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
          <div className="flex justify-between mt-6">
            <button
              type="button"
              className="bg-black text-white px-4 py-2 rounded"
              onClick={handleSave}
              disabled={isSaving || createCheckout.isPending || updateCheckout.isPending}
            >
              {hasExistingData ? "Update" : "Save"}
            </button>
            
            <button 
              onClick={onClose} 
              className={`px-4 py-2 rounded ${allTabsCompleted 
                ? "bg-green-600 hover:bg-green-700 text-white" 
                : "bg-gray-300 text-gray-600 cursor-not-allowed"}`}
              disabled={!allTabsCompleted}
              title={!allTabsCompleted ? "Complete all previous tabs first" : ""}
            >
              Finish & Close
            </button>
          </div>
          
          {(createCheckout.isError || updateCheckout.isError) && (
            <div className="text-red-500 text-sm">Error saving checkout.</div>
          )}
          {(createCheckout.isSuccess || updateCheckout.isSuccess) && (
            <div className="text-green-600 text-sm">Checkout saved successfully!</div>
          )}
        </div>
      </CardContent>

      {/* Show status indicator if completed */}
      {isCompleted && (
        <div className="absolute top-2 right-2">
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      )}
    </Card>
  );
} 