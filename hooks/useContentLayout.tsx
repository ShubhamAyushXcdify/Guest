"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useStoreLocalStorage from "./useLocalStorage";
import { useQueryClient } from "@tanstack/react-query";
import { useGetRoleById } from "@/queries/roles/get-role-by-id";

import {
    getUserId,
    removeUserId,
    removeJwtToken,
    removeProjectName,
    removeProjectId,
    removeClinicId,
    setUserId,
    setClinicId,
    setClinicName,
    removeClinicName
} from "../utils/clientCookie";


export type User = {
    id: string;
    email: string;
    passwordHash: string;
    firstName: string;
    lastName: string;
    role: string;
    roleId: string;
    roleName: string;
    clinicId: string | null;
    clinicName: string | null;
    clinic: string | null;
    isActive: boolean;
    lastLogin: string | null;
    createdAt: string;
    updatedAt: string;
}

export type UserType = {
    isAdmin: boolean;
    isSuperAdmin: boolean;
    isClinicAdmin: boolean;
    isReceptionist: boolean;
    isPatient: boolean;
    isClient: boolean;
    isProvider: boolean;
}

const userRolesObject: UserType = {
    isAdmin: false,
    isSuperAdmin: false,
    isClinicAdmin: false,
    isReceptionist: false,
    isPatient: false,
    isClient: false,
    isProvider: false,
}

type workspace = {
    id: number | null;
    name: string | null;
}
export const useContentLayout = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [clinic, setClinic] = useState<{ id: string | null, name: string | null }>({
        id: null,
        name: null
    });
    const [collapsed, setCollapsed] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [roles, setRoles] = useState<string[] | null>(null);
    const [IsAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [userType, setUserType] = useState<typeof userRolesObject>(userRolesObject);
    const [authorized, setAuthorized] = useState(false);
    const [, setRoleToLocal] = useStoreLocalStorage('role', '');
    const [, setUserToLocal] = useStoreLocalStorage<any>('user', '');
    const queryClient = useQueryClient();

    // Initial user fetch
    useEffect(() => {
        if (!user) {
            fetchUser();
        }
    }, []);

    const fetchUser = async (data?: any, role?: any) => {
        if (role === "Client"){
            return ;
        }
        setLoading(true);
        let userid = getUserId() || data?.user?.id;
        if (!userid && data?.user?.id) {
            userid = data.user.id;
        }
        if (!userid && (pathname !== '/login' && pathname !== '/register')) {
            setLoading(false);
            handleLogout();
            return;
        }
        if (!userid) {
            return;
        }


        try {
                const response = await fetch(`/api/user/${userid}`);
                const userData = await response.json();


            if (!userData || userData.status === 400) {
                console.error("userData not found");
                setLoading(false);
                setAuthorized(false);
                return;
            }
            setUserId(userData.id)
            setUser(userData);
            setClinicId(userData.clinicId)
            setClinicName(userData.clinicName)
            setClinic({
                id: userData.clinicId,
                name: userData.clinicName
            });
            setAuthorized(true);
            registerUser(userData);
        } catch (error) {
            console.error("Error fetching user:", error);
            setAuthorized(false);
            setLoading(false);
        }
    };

    const registerUser = (userData: User) => {
        // setWorkspace(prev => ({
        //     ...prev,
        //     id: userData.workspaceId,
        //     name: userData.workspaceName
        // }))
        if (userData) {
            const types = {
                isAdmin: userData.roleName === 'Administrator',
                isSuperAdmin: userData.roleName === 'Super Admin',
                isClinicAdmin: userData.roleName === 'Clinic Admin',
                isReceptionist: userData.roleName === 'Receptionist',
                isPatient: userData.roleName === 'Patient',
                isClient: userData.roleName === 'Client',
                isProvider: (userData.roleName === 'Provider' || userData?.roleName?.toLocaleLowerCase() === 'veterinarian'),
            }
            setUserType((prev) => ({ ...userRolesObject, ...types }));
        }
        setIsAdmin(userData.roleName === 'Administrator' || userData.roleName === 'Super Admin');
        setRoles([userData.roleName]);
        setRoleToLocal(userData.roleName);
        setUserToLocal(JSON.stringify(userData));
        setLoading(false);
    };

    const handleLogout = async () => {
        // Clear local storage
        router.push("/");

        setRoles(null)
        setUser(null);
        queryClient.removeQueries();
        queryClient.removeQueries({ queryKey: ["projects"] });
        localStorage.removeItem('user');
        localStorage.removeItem('role');
        localStorage.removeItem('lastVisitedUrls');
        removeUserId();
        removeJwtToken();

        //setActiveProject(null);
        removeProjectId();
        removeProjectName();
        removeJwtToken();
        removeUserId();
        removeClinicId();
        removeClinicName();
        setTimeout(() => {
            setAuthorized(false);
            //window.location.reload();
        }, 1000)
    };

    return {
        clinic,
        loading,
        setLoading,
        collapsed,
        setCollapsed,
        user,
        setUser,
        roles,
        setRoles,
        authorized,
        handleLogout,
        fetchUser,
        IsAdmin,
        userType
    };
};


