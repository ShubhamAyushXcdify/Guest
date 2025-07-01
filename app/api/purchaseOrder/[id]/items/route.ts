import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    let token = getJwtToken(request);

    if (!token) {
      token = testToken;
    }

    const response = await fetch(
      `${apiUrl}/api/PurchaseOrder/${params.id}/items`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      console.error('PurchaseOrder items API error:', response.status);
      return NextResponse.json(
        { message: 'Failed to fetch purchase order items' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error('Error in purchase order items GET route:', error);
    return NextResponse.json(
      { message: `Error fetching purchase order items: ${error.message}` },
      { status: 500 }
    );
  }
} 