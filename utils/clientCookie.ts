// lib/clientCookie.ts
import Cookies from 'js-cookie';

export const setJwtToken = (token: string): void => {
  Cookies.set('jwtToken', token, { expires: 1 }); // Set cookie to expire in 1 day
};

export const getJwtToken = (): string | undefined => {
  return Cookies.get('jwtToken');
};

export const removeJwtToken = (): void => {
  Cookies.remove('jwtToken');
};

export const setUserId = (id: any): void => {
  Cookies.set('userId', id, { expires: 1 }); // Set cookie to expire in 1 day
}

export const getUserId = (): string | undefined => {
  return Cookies.get('userId') || undefined;
};

export const removeUserId = (): void => {
  Cookies.remove('userId');
};

export const setProjectId = (id: string): void => {
  Cookies.set('projectId', id); // Set cookie to no expiration
};

export const getProjectId = (): string | undefined => {
  return Cookies.get('projectId');
};


export const removeProjectId = (): void => {
  Cookies.remove('projectId');
};


export const setProjectName = (name: string): void => {
  Cookies.set('projectName', name); // Set cookie to no expiration
};

export const getProjectName = (): string | undefined => {
  return Cookies.get('projectName');
};


export const removeProjectName = (): void => {
  Cookies.remove('projectName');
};

export const setClinicId = (id: string): void => {
  Cookies.set('clinicId', id); // Set cookie to no expiration
};

export const getClinicId = (): string | undefined => {
  return Cookies.get('clinicId');
};

export const removeClinicId = (): void => {
  Cookies.remove('clinicId');
};

export const setClinicName = (name: string): void => {
  Cookies.set('clinicName', name); // Set cookie to no expiration
};

export const getClinicName = (): string | undefined => {
  return Cookies.get('clinicName');
};

export const removeClinicName = (): void => {
  Cookies.remove('clinicName');
};


