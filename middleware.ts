import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = new URL(request.url);

  // Only handle /patients route with detailed search parameters
  if (pathname === '/patients' && (
    searchParams.has('firstName') || 
    searchParams.has('lastName') || 
    searchParams.has('email') || 
    searchParams.has('phoneNumber')
  )) {
    // Extract the search parameters we want to keep
    const search = searchParams.get('search') || '';
    const page = searchParams.get('page') || '1';
    const limit = searchParams.get('limit') || '10';
    
    // Create a new URL with only the allowed parameters
    const url = new URL(request.url);
    url.search = '';
    
    // Only add the parameters we want to allow
    if (search) url.searchParams.set('search', search);
    if (page) url.searchParams.set('page', page);
    if (limit) url.searchParams.set('limit', limit);
    
    // Redirect to the new URL
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configure the paths that this middleware should run on
export const config = {
  matcher: ['/patients'],
}; 