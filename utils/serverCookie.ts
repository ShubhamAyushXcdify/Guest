// lib/serverCookie.ts
import { NextRequest } from 'next/server';
import cookie from 'cookie';

export const parseCookies = (req?: NextRequest): { [key: string]: string  | undefined} => {
  return cookie.parse(req ? req.headers.get('cookie') || '' : document.cookie);
};

export const getJwtToken = (req?: NextRequest): string | null => {
  const cookies = parseCookies(req);
  return cookies.jwtToken || null;
};

export const getWorkspaceId = (req?: NextRequest): string | null => {
  const cookies = parseCookies(req);
  return cookies.workspaceId || null;
};

