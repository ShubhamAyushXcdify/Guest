import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(
  request: NextRequest,
  { params }: { params: { clinicId: string } }
) {
  try {
    let token = getJwtToken(request);
    if (!token) {
      token = testToken;
    }
    const clinicId = params.clinicId;
    // Parse query parameters from the request URL
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get('searchTerm') || '';

    const queryParams = new URLSearchParams();
    if (searchTerm) queryParams.append('searchTerm', searchTerm);
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';

    const response = await fetch(
      `${apiUrl}/api/Inventory/search/${clinicId}/all${queryString}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search all inventory from backend');
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
    return NextResponse.json({ message: `Error searching all inventory: ${error.message}` }, { status: 500 });
  }
}
