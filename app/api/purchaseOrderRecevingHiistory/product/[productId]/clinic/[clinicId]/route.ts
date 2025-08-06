import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

// GET endpoint to fetch purchase order receiving history by product ID and clinic ID
export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ productId: string; clinicId: string }> }
) {
  const { productId, clinicId } = await ctx.params;
  try {
    let token = getJwtToken(request);

    if (!token) {
      token = testToken;
    }

    // Call the API
    const response = await fetch(`${apiUrl}/api/PurchaseOrderReceivingHistory/product/${productId}/clinic/${clinicId}`, {
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
