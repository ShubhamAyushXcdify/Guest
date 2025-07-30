import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from "@/utils/serverCookie";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Get the base URL from environment or use a default
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    
    // Get token from cookie
    const token = getJwtToken(request);
    
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized - No token provided' },
        { status: 401 }
      );
    }

    console.log('Barcode request for product ID:', id);
    console.log('API URL:', `${baseUrl}/api/Product/${id}/barcode`);
    
    const response = await fetch(`${baseUrl}/api/Product/${id}/barcode`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Barcode fetch error:', response.status, errorText);
      throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching barcode data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch barcode data' },
      { status: 500 }
    );
  }
} 