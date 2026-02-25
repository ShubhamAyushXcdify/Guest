// utils/jwtToken.ts
// Utility functions for JWT token validation

/**
 * Decodes a JWT token without verification (client-side only)
 * Note: This does NOT verify the signature - it only decodes the payload
 */
export const decodeJwtToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }
    
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT token:', error);
    return null;
  }
};

/**
 * Checks if a JWT token is expired
 * @param token - The JWT token string
 * @returns true if token is expired or invalid, false if valid and not expired
 */
export const isTokenExpired = (token: string | undefined): boolean => {
  if (!token) {
    return true;
  }

  try {
    const decoded = decodeJwtToken(token);
    
    if (!decoded || !decoded.exp) {
      // If token doesn't have expiration claim, consider it expired
      return true;
    }

    // exp is in seconds, Date.now() is in milliseconds
    const currentTime = Math.floor(Date.now() / 1000);
    const expirationTime = decoded.exp;

    return currentTime >= expirationTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // If we can't decode, consider it expired
  }
};

/**
 * Gets the expiration time of a JWT token in milliseconds
 * @param token - The JWT token string
 * @returns expiration timestamp in milliseconds, or null if invalid
 */
export const getTokenExpiration = (token: string | undefined): number | null => {
  if (!token) {
    return null;
  }

  try {
    const decoded = decodeJwtToken(token);
    
    if (!decoded || !decoded.exp) {
      return null;
    }

    // exp is in seconds, convert to milliseconds
    return decoded.exp * 1000;
  } catch (error) {
    console.error('Error getting token expiration:', error);
    return null;
  }
};

