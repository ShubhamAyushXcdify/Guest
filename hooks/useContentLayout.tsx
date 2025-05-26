"use client";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import useStoreLocalStorage from "./useLocalStorage";
import { useQueryClient } from "@tanstack/react-query";

import {
    getUserId,
    removeUserId,
    removeJwtToken,
    removeProjectName,
    removeProjectId,
    removeWorkspaceId
} from "../utils/clientCookie";


export type User = {
    id: number;
    email: string;
    createdAt: string;
    updatedAt: string;
    avatar: string | null;
    username: string;
    name: string;
    firstName: string;
    lastName: string;
    gender: string;
    mobileNumber: string;
    role: string;
    isActive: boolean;
    companyIds: number[];
    projectIds: number[];
    roleIds: number;
    workspaceId: number;
    workspaceName: string;
}

export type UserType = {
    isAdmin: boolean;
    isClient: boolean;
    isSuperAdmin: boolean;
    isManager: boolean;
    isMember: boolean;
    isHR: boolean;
    isGuest: boolean;
    isFinanceManager: boolean;
}

const userRolesObject: UserType = {
    isAdmin: false,
    isClient: false,
    isSuperAdmin: false,
    isManager: false,
    isMember: false,
    isHR: false,
    isGuest: false,
    isFinanceManager: false
}

type workspace = {
    id: number | null;
    name: string | null;
}
export const useContentLayout = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [loading, setLoading] = useState(true);
    const [collapsed, setCollapsed] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [roles, setRoles] = useState<string[] | null>(null);
    const [IsAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [userType, setUserType] = useState<typeof userRolesObject>(userRolesObject);
    const [authorized, setAuthorized] = useState(false);
    const [, setRoleToLocal] = useStoreLocalStorage('role', '');
    const [, setUserToLocal] = useStoreLocalStorage<any>('user', '');
    const queryClient = useQueryClient();
    const [workspace, setWorkspace] = useState<workspace>({
        id: null,
        name: null
    })

    // Initial user fetch
    useEffect(() => {

        if (!user) {
            fetchUser();
        }
    }, []);

    const fetchUser = async (data?: any) => {
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

            setUser(userData);
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
        // const types = {
        //     isAdmin: userData.role === 'Admin',
        //     isClient: userData.role === 'Client',
        //     isSuperAdmin: userData.role === 'Super Admin',
        //     isManager: userData.role === 'Manager',
        //     isMember: userData.role === 'Member',
        //     isHR: userData.role === 'HR',
        //     isGuest: userData.role === 'Guest',
        //     isFinanceManager: userData.role === 'Finance Manager'
        // }
        setUserType((prev) => ({ ...userRolesObject }));
        setIsAdmin(userData.role === 'Admin' || userData.role === 'Super Admin');
        setRoles([userData.role]);
        setRoleToLocal(userData.role);
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
        removeWorkspaceId();
        setTimeout(() => {
            setAuthorized(false);
            //window.location.reload();
        }, 1000)
    };

    return {
        workspace,
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


