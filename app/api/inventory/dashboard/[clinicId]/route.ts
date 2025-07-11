import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(request: NextRequest, { params }: { params: { clinicId: string } }) {
  try {
    let token = getJwtToken(request);
    if (!token) {
      token = testToken;
    }

    const { clinicId } = params;
    if (!clinicId) {
      return NextResponse.json({ message: "clinicId is required" }, { status: 400 });
    }

    const response = await fetch(
      `${apiUrl}/api/Inventory/dashboard/${clinicId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Failed to get error details");
      console.error('Dashboard API error:', errorText);
      throw new Error('Failed to fetch inventory dashboard from backend');
    }

    const data = await response.json();
    return NextResponse.json(data, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    });
  } catch (error: any) {
    console.error('Error in inventory dashboard GET route:', error);
    return NextResponse.json({ message: `Error fetching inventory dashboard: ${error.message}` }, { status: 500 });
  }
}
