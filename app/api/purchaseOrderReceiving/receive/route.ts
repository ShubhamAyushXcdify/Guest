import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    let token = getJwtToken(req);
    if (!token) {
      token = testToken;
    }

    const response = await fetch(
      `${apiUrl}/api/PurchaseOrderReceiving/receive`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Failed to get error details");
      console.error("Error response from backend:", errorText);
      throw new Error('Failed to receive purchase order items');
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error in purchase order receiving POST route:", error);
    return NextResponse.json({ message: `Error receiving purchase order items: ${error.message}` }, { status: 500 });
  }
} 