import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clinicId: string }> }
) {
  try {
    let token = getJwtToken(request);

    if (!token) {
      token = testToken;
    }

    const { clinicId } = await params;
    
    // Parse query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('searchTerm') || '';
    const limit = searchParams.get('limit') || '10';
    // Add searchBy parameter, defaulting to "both" if not specified
    const searchBy = searchParams.get('searchBy') || 'both'; 

    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.append('searchTerm', searchTerm);
    if (limit) queryParams.append('limit', limit);
    if (searchBy) queryParams.append('searchBy', searchBy);
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const response = await fetch(
      `${apiUrl}/api/Inventory/search/${clinicId}${queryString}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search inventory from backend');
    }

    const data = await response.json();
    
    // Ensure data has the expected structure with 'items' array
    const formattedData = {
      items: Array.isArray(data) ? data : (data.items || []),
      totalCount: Array.isArray(data) ? data.length : (data.totalCount || data.items?.length || 0)
    };
    
    return NextResponse.json(formattedData, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: any) {
    return NextResponse.json({ message: `Error searching inventory: ${error.message}` }, { status: 500 });
  }
}
