// lib/serverCookie.ts
import { NextRequest } from 'next/server';

const parseCookieString = (cookieString: string): { [key: string]: string } => {
  const cookies: { [key: string]: string } = {};
  
  if (!cookieString) return cookies;
  
  cookieString.split(';').forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) {
      cookies[name] = decodeURIComponent(value);
    }
  });
  
  return cookies;
};

export const parseCookies = (req?: NextRequest): { [key: string]: string | undefined } => {
  let cookieString = '';
  
  if (req) {
    // Handle different types of request objects
    if (req.headers && typeof req.headers.get === 'function') {
      // Standard NextRequest
      cookieString = req.headers.get('cookie') || '';
    } else if (req.cookies && typeof req.cookies.get === 'function') {
      // Next.js App Router request with cookies property
      cookieString = req.cookies.get('cookie')?.value || '';
    } else if (typeof req === 'object' && req !== null) {
      // Try to access cookies directly if it's a different request format
      cookieString = (req as any).cookie || (req as any).cookies || '';
    }
  }
  
  return parseCookieString(cookieString);
};

export const getJwtToken = (req?: NextRequest): string | null => {
  const cookies = parseCookies(req);
  return cookies.jwtToken || null;
};

export const getWorkspaceId = (req?: NextRequest): string | null => {
  const cookies = parseCookies(req);
  return cookies.workspaceId || null;
};

export const getClientId = async (req?: NextRequest): Promise<string | null> => {
  const cookies = parseCookies(req);
  return cookies.clientId || null;
};
