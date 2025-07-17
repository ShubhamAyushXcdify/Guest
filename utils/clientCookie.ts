// lib/clientCookie.ts
import Cookies from 'js-cookie';

// Helper function to check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof document !== 'undefined';

export const setJwtToken = (token: string): void => {
  if (!isBrowser) return;
  Cookies.set('jwtToken', token, { expires: 1 }); // Set cookie to expire in 1 day
};

export const getJwtToken = (): string | undefined => {
  if (!isBrowser) return undefined;
  return Cookies.get('jwtToken');
};

export const removeJwtToken = (): void => {
  if (!isBrowser) return;
  Cookies.remove('jwtToken');
};

export const setUserId = (id: any): void => {
  if (!isBrowser) return;
  Cookies.set('userId', id, { expires: 1 }); // Set cookie to expire in 1 day
}

export const setClientId = (id: string) => {
  if (!isBrowser) return;
  Cookies.set('clientId', id, { expires: 1 }); 
}

export const getUserId = (): string | undefined => {
  if (!isBrowser) return undefined;
  return Cookies.get('userId') || undefined;
};

export const removeUserId = (): void => {
  if (!isBrowser) return;
  Cookies.remove('userId');
};

export const setProjectId = (id: string): void => {
  if (!isBrowser) return;
  Cookies.set('projectId', id); // Set cookie to no expiration
};

export const getProjectId = (): string | undefined => {
  if (!isBrowser) return undefined;
  return Cookies.get('projectId');
};

export const removeProjectId = (): void => {
  if (!isBrowser) return;
  Cookies.remove('projectId');
};

export const setProjectName = (name: string): void => {
  if (!isBrowser) return;
  Cookies.set('projectName', name); // Set cookie to no expiration
};

export const getProjectName = (): string | undefined => {
  if (!isBrowser) return undefined;
  return Cookies.get('projectName');
};

export const removeProjectName = (): void => {
  if (!isBrowser) return;
  Cookies.remove('projectName');
};

export const setClinicId = (id: string): void => {
  if (!isBrowser) return;
  Cookies.set('clinicId', id); // Set cookie to no expiration
};

export const getClinicId = (): string | undefined => {
  if (!isBrowser) return undefined;
  return Cookies.get('clinicId');
};

export const removeClinicId = () => {
  if (!isBrowser) return;
  Cookies.remove('clinicId');
};

export const setClinicName = (name: string): void => {
  if (!isBrowser) return;
  Cookies.set('clinicName', name); // Set cookie to no expiration
};

export const getClinicName = (): string | undefined => {
  if (!isBrowser) return undefined;
  return Cookies.get('clinicName');
};

export const removeClinicName = (): void => {
  if (!isBrowser) return;
  Cookies.remove('clinicName');
};

export const getClientId = (): string | undefined => {
  if (!isBrowser) return undefined;
  return Cookies.get('clientId');
};


