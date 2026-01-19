import { useQuery } from "@tanstack/react-query";
import { useRootContext } from "@/context/RootContext";

export interface ScreenAccessItem {
  id: string;
  screenId: string;
  screenName: string;
  clinicId: string;
  clinicName: string;
  roleId: string;
  roleName: string;
  isAccessEnable: boolean;
  createdAt: string;
  updatedAt: string;
}

const getScreenAccess = async (clinicId: string | null, roleId?: string | null) => {
  if (!clinicId) {
    console.warn('clinicId is required for screen access check');
    return [];
  }
  
  const params = new URLSearchParams();
  params.set("clinicId", clinicId);
  if (roleId) params.set("roleId", roleId);
  
  const response = await fetch(`/api/screen/access?${params.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch screen access");
  }
  
  const result: ScreenAccessItem[] = await response.json();
  return result;
};

export const useGetScreenAccess = (
  clinicId: string | null,
  roleId?: string | null,
  enabled = true,
  skipForAdmin = true
) => {
  const { userType } = useRootContext();
  
  return useQuery({
    queryKey: ["screen-access", clinicId, roleId],
    queryFn: async () => {
      return getScreenAccess(clinicId, roleId ?? undefined);
    },
    // Only enable the query if we have a clinicId and explicitly enabled.
    // Optionally skip for admin users depending on caller needs.
    enabled: !!clinicId && (skipForAdmin ? !userType?.isAdmin : true) && enabled,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    staleTime: 0,
  });
};


