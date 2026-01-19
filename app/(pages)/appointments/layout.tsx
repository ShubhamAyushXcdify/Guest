"use client";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRootContext } from "@/context/RootContext";
import { useGetClinic } from "@/queries/clinic/get-clinic";
import { useQueryStates, parseAsString } from "nuqs";

export default function AppointmentsLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { user, userType, clinic } = useRootContext();
    const [qp, setQp] = useQueryStates({
        clinicId: parseAsString
    });
    
    const { data: clinicsData } = useGetClinic(1, 100, clinic?.companyId ?? null, Boolean(!userType?.isVeterinarian && clinic?.companyId), userType?.isVeterinarian ? user?.id : null);
    const clinics = clinicsData?.items || [];

    // Sync URL clinicId -> context when available; otherwise reflect context into URL
    useEffect(() => {
        if (!clinics || clinics.length === 0) return;
        
        // If URL has clinicId and differs from context, update context from URL
        if (qp.clinicId && qp.clinicId !== clinic?.id) {
            const selected = clinics.find(c => String(c.id) === qp.clinicId);
            if (selected) {
                clinic?.setClinic?.({ 
                    id: String(selected.id), 
                    name: selected.name, 
                    companyId: selected.companyId ?? clinic?.companyId ?? null 
                });
            }
            return;
        }
        
        // If URL is missing clinicId but context has one, update URL
        if (!qp.clinicId && clinic?.id) {
            setQp({ clinicId: clinic.id });
            return;
        }
        
        // If neither has a clinic ID, set default
        if (!qp.clinicId && !clinic?.id && clinics[0]?.id) {
            const defaultClinic = clinics[0];
            setQp({ clinicId: String(defaultClinic.id) });
            clinic?.setClinic?.({ 
                id: String(defaultClinic.id), 
                name: defaultClinic.name, 
                companyId: defaultClinic.companyId ?? null 
            });
        }
    }, [qp.clinicId, clinic?.id, clinics, userType?.isClinicAdmin, user?.clinicId, setQp]);

    // Show dropdown only for company admins (not for clinic admins or vets)
    // Show dropdown only for company admins; hide for receptionist
    const isCompanyAdmin = !!(
        !userType?.isClinicAdmin &&
        !userType?.isVeterinarian &&
        !userType?.isReceptionist
    );
    const isReceptionist = !!userType?.isReceptionist;
    const canChangeClinic = isCompanyAdmin; // functionality unchanged
    const showClinicSelect = !isReceptionist && isCompanyAdmin; // only hide for receptionist

    return (
        <div className="w-full">
            {showClinicSelect && (
                <div className="flex w-full items-center justify-start pb-3">
                    <Select
                        disabled={!canChangeClinic}
                        value={clinic?.id ?? ""}
                        onValueChange={(value) => {
                            const found = clinics.find(c => String(c.id) === value);
                            if (found) {
                                setQp({ clinicId: value });
                            }
                        }}
                    >
                        <SelectTrigger className="w-64">
                            <SelectValue placeholder="Select clinic" />
                        </SelectTrigger>
                        <SelectContent>
                            {clinics.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {c.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            {children}
        </div>
    );
}
   