import { ClientForm } from "./client-form";
import { Client } from "@/queries/clients/get-client";

interface ClientDrawerContentProps {
  onClose: () => void;
  defaultValues?: Client;
}

export function ClientDrawerContent({ onClose, defaultValues }: ClientDrawerContentProps) {
  return (
    <div className="p-4">
      <ClientForm onSuccess={onClose} defaultValues={defaultValues} />
    </div>
  );
} 