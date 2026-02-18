// utils/apiErrorHandler.ts
// Utility to handle API errors, especially 401 Unauthorized responses
// and to show backend error messages in frontend toasts

import { getJwtToken, removeJwtToken, removeUserId } from './clientCookie';
import { isTokenExpired } from './jwtToken';

/** Keys commonly used by backends for error message. */
const ERROR_KEYS = ['message', 'error', 'title', 'detail'] as const;

/**
 * Extract error message from parsed API error body (use in queries/mutations after response.json()).
 * Use this so the same backend message is thrown and shown in toast.
 */
export function getMessageFromErrorBody(body: unknown, fallback: string): string {
  if (body == null || typeof body !== 'object') return fallback;
  const obj = body as Record<string, unknown>;
  for (const key of ERROR_KEYS) {
    const val = obj[key];
    if (typeof val === 'string' && val.trim()) return val.trim();
  }
  return fallback;
}

/**
 * Get user-facing error message from any thrown value (Error or object with message).
 * Use in components: toast({ description: getToastErrorMessage(error, 'Operation failed') }).
 */
export function getToastErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message?.trim()) return error.message.trim();
  if (error && typeof error === 'object' && 'message' in error) {
    const msg = (error as { message?: string }).message;
    if (typeof msg === 'string' && msg.trim()) return msg.trim();
  }
  return fallback;
}

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

