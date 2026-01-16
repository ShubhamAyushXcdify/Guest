// app/api/dashboard/expiring-products/route.ts
import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');
    
    console.log('Request received for clinicId:', clinicId);
    
    if (!clinicId) {
      console.error('No clinicId provided in request');
      return NextResponse.json(
        { message: "Clinic ID is required" },
        { status: 400 }
      );
    }

    const token = getJwtToken(request);
    
    if (!token) {
      console.error('No JWT token found in request cookies');
      return NextResponse.json(
        { message: "Authentication required" },
        { status: 401 }
      );
    }
    
    if (!apiUrl) {
      console.error('NEXT_PUBLIC_API_URL is not defined');
      return NextResponse.json(
        { message: "Server configuration error" },
        { status: 500 }
      );
    }

    const apiEndpoint = `${apiUrl}/api/Dashboard/expiring-products?clinicId=${clinicId}`;
    console.log('Making request to:', apiEndpoint);

    const response = await fetch(apiEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`API Error (${response.status}):`, errorText);
      return NextResponse.json(
        { 
          message: `Failed to fetch expiring products: ${response.statusText}`,
          details: process.env.NODE_ENV === 'development' ? errorText : undefined
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Successfully fetched expiring products');
    return NextResponse.json({ data });
    
  } catch (error: any) {
    console.error('Error in expiring-products API route:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    return NextResponse.json(
      { 
        message: error.message || "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: error.status || 500 }
    );
  }
}