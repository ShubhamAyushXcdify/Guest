"use client";
import { RootContext } from "@/context/RootContext";
import { usePathname, useRouter } from "next/navigation";
import { useContext, useEffect } from "react";
import React from "react";
import { RootContextType } from "@/context/RootContext";
import { getJwtToken, getUserId, getWorkspaceId } from "./clientCookie";
// import { useHasPermission } from "./auth";
// import { Resource } from "../components/settings/rbac/rbac";


const getResource = (pathname: string) => {
  switch (pathname.split('/')[1]) {
    case 'projects':
      return 'projects';
    case 'users':
      return 'users';
    case 'companies':
      return 'companies';
    case 'modules':
      return 'modules';
    case 'issues':
      return 'issues';
    case 'sprints':
      return 'sprints';
    case 'dashboard':
      return 'dashboard';
    case 'account':
      return 'account';
    case 'feedback':
      return 'feedback';
  }
}

const withAuth = (WrappedComponent: any, Loader?: any) => {
  const AuthRequired = (props: any) => {
    const router = useRouter();
    const pathname = usePathname();
    const rootContext = useContext(
      RootContext as React.Context<RootContextType>
    );

    if (!rootContext) {
      throw new Error("RootContext must be used within a RootContext");
    }

    const { authorized, loading } = rootContext as RootContextType;

    // const canAccess = useHasPermission({
    //   resource: getResource(pathname) as Resource,
    //   action: 'view'
    // });

    useEffect(() => {
      // Only run authentication checks on the client side
      const jwtToken = getJwtToken();
      const userId = getUserId();
      const workspaceId = getWorkspaceId();

      if (!jwtToken || !userId || !workspaceId) {
        const timeout = setTimeout(() => {

          if (typeof window !== "undefined" && pathname !== "/login") {
            console.log(
              "redirecting to login from privateRouter because no jwtToken or userId or workspaceId"
            );
            router.push(`/?redirect=${encodeURIComponent(pathname)}`);
          }
        }, 1000);
        return () => clearTimeout(timeout);
      }
      //if (!loading && (!authorized || canAccess === false)) {
      if (!loading && !authorized) {
        const timeout = setTimeout(() => {
          if (pathname !== "/login") {
            console.log(`Redirecting to login from privateRouter because Authorized ${authorized}`);
            router.push(`/?redirect=${encodeURIComponent(pathname)}`);
          }
        }, 1000);

        return () => clearTimeout(timeout);
      }
    }, [authorized, pathname, router]);

    if (loading) {
      if (Loader) {
        return React.createElement(Loader, props);
      }
      return null;
    }

    return React.createElement(WrappedComponent, props);
  };

  return AuthRequired;
};

export default withAuth;
