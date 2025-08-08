import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

// GET endpoint to fetch purchase order receiving history by product ID and clinic ID
export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string; clinicId: string } }
) {
  try {
    const token = getJwtToken(request);

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { productId, clinicId } = params;

    // Call the API
    const response = await fetch(`${apiUrl}/api/PurchaseOrderReceivingHistory/product/${productId}/clinic/${clinicId}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    const data = await response.text();

    return new NextResponse(data, {
      status: response.status,
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
} 