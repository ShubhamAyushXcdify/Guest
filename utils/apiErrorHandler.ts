// utils/apiErrorHandler.ts
// Utility to handle API errors, especially 401 Unauthorized responses

import { getJwtToken, removeJwtToken, removeUserId } from './clientCookie';
import { isTokenExpired } from './jwtToken';

/**
 * Checks if an error response indicates an unauthorized/expired token
 * and handles logout if needed
 * @param response - The fetch Response object
 * @param handleLogout - Optional logout function to call
 * @returns true if error was handled (401), false otherwise
 */
export const handleApiError = async (
  response: Response,
  handleLogout?: () => void
): Promise<boolean> => {
  if (response.status === 401) {
    console.warn('Received 401 Unauthorized response, token may be expired');
    
    // Check if token is actually expired
    const token = getJwtToken();
    if (token && isTokenExpired(token)) {
      console.warn('Token is expired, logging out...');
    } else {
      console.warn('Token exists but server returned 401, logging out...');
    }
    
    // Call logout handler if provided
    if (handleLogout) {
      handleLogout();
    } else {
      // Fallback: clear tokens and redirect
      removeJwtToken();
      removeUserId();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    return true;
  }
  
  return false;
};

/**
 * Wraps a fetch call to automatically handle 401 responses
 * @param fetchFn - The fetch function to wrap
 * @param handleLogout - Optional logout function to call on 401
 * @returns The fetch response
 */
export const fetchWithAuth = async (
  url: string | URL | Request,
  init?: RequestInit,
  handleLogout?: () => void
): Promise<Response> => {
  // Check token expiration before making request
  const token = getJwtToken();
  if (token && isTokenExpired(token)) {
    console.warn('Token expired before fetch, logging out...');
    if (handleLogout) {
      handleLogout();
    } else {
      removeJwtToken();
      removeUserId();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    throw new Error('Token expired');
  }

  const response = await fetch(url, init);
  
  // Handle 401 responses
  if (response.status === 401) {
    await handleApiError(response, handleLogout);
    throw new Error('Unauthorized');
  }
  
  return response;
};

