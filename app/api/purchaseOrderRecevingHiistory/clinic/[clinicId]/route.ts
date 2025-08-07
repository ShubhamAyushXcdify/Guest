import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

// GET endpoint to fetch purchase order receiving history by clinic ID
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ clinicId: string }> }
) {
  const { clinicId } = await ctx.params;
  const { searchParams } = new URL(request.url);
  const productName = searchParams.get('productName');

  try {
    let token = getJwtToken(request);

    if (!token) {
      token = testToken;
    }

    // Build the API URL with optional productName query parameter
    let apiEndpoint = `${apiUrl}/api/PurchaseOrderReceivingHistory/clinic/${clinicId}`;
    if (productName) {
      apiEndpoint += `?productName=${encodeURIComponent(productName)}`;
    }

    // Call the API
    const response = await fetch(apiEndpoint, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      console.error('PurchaseOrderReceivingHistory API error:', response.status);
      return NextResponse.json(
        { message: 'Failed to fetch purchase order receiving history' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Error fetching purchase order receiving history:', error);
    return NextResponse.json(
      { message: 'Error fetching purchase order receiving history data' },
      { status: 500 }
    );
  }
}
