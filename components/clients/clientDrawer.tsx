import { ClientForm } from "./client-form";
import { Client } from "@/queries/clients/get-client";

interface ClientDrawerContentProps {
  onClose: () => void;
  defaultValues?: Client;
  isUpdate?: boolean;
}

export function ClientDrawerContent({ onClose, defaultValues, isUpdate }: ClientDrawerContentProps) {
  return (
    <div className="p-4">
      <ClientForm 
        onSuccess={onClose} 
        defaultValues={defaultValues} 
        isUpdate={isUpdate || !!defaultValues}
      />
    </div>
  );
} 