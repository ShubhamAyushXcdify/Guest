import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

// GET endpoint to fetch vaccination details by visit ID
export async function GET(
  request: NextRequest,
  { params }: { params: { visitId: string } }
) {
  try {
    const token = getJwtToken(request);

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { visitId } = params;

    // Call the API
    const response = await fetch(`${apiUrl}/api/VaccinationDetail/visit/${visitId}`, {
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