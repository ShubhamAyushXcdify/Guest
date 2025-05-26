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
  const cookieString = req ? req.headers.get('cookie') || '' : document.cookie;
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

