
export const getSubdomain = (): string | null => {
  if (typeof window === 'undefined') return null;

  const hostname = window.location.hostname;

  // Check for subdomain in URL parameters first (for testing)
  const urlParams = new URLSearchParams(window.location.search);
  const urlSubdomain = urlParams.get('subdomain');
  if (urlSubdomain) {
    return urlSubdomain;
  }

  // Handle localhost for development
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // For development, you can set a custom subdomain
    // You can also use URL parameters or localStorage for testing
    return 'dev'; // Default demo subdomain for development
  }

  // Handle IP addresses (development/testing)
  if (/^\d+\.\d+\.\d+\.\d+/.test(hostname)) {
    // For IP addresses, use a default subdomain or check localStorage
    const devSubdomain = getDevelopmentSubdomain();
    return devSubdomain || 'dev';
  }

  // Handle your specific domain structure: subdomain.xcdify.com
  if (hostname.endsWith('.xcdify.com')) {
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts[0]; // Extract subdomain from subdomain.xcdify.com
    }
  }

  // Extract subdomain from other hostnames (fallback)
  const parts = hostname.split('.');

  // If we have more than 2 parts, the first part is the subdomain
  if (parts.length > 2) {
    return parts[0];
  }

  // If no subdomain, return null (main domain)
  return null;
};  

export const getCompanySubdomain = (): string => {
  const subdomain = getSubdomain();

  // If no subdomain, use a default for development/testing
  if (!subdomain) {
    // For development/testing, use 'dev' as default
    // In production, you might want to handle this differently
    return 'dev';
  }

  return subdomain;
};

export const getSubdomainFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname;

    // Handle localhost for development
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return 'dev';
    }

    // Handle your specific domain structure: subdomain.xcdify.com
    if (hostname.endsWith('.xcdify.com')) {
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        return parts[0]; // Extract subdomain from subdomain.xcdify.com
      }
    }

    // Extract subdomain from other hostnames (fallback)
    const parts = hostname.split('.');

    // If we have more than 2 parts, the first part is the subdomain
    if (parts.length > 2) {
      return parts[0];
    }

    return null;
  } catch (error) {
    console.error('Error parsing URL for subdomain:', error);
    return null;
  }
};

// For development/testing purposes
export const setDevelopmentSubdomain = (subdomain: string): void => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    localStorage.setItem('dev-subdomain', subdomain);
  }
};

export const getDevelopmentSubdomain = (): string | null => {
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
    return localStorage.getItem('dev-subdomain');
  }
  return null;
}; 