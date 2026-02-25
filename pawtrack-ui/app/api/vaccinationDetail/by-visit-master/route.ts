import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

export async function GET(request: NextRequest) {
  try {
    const token = getJwtToken(request);
    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }
    const { searchParams } = new URL(request.url);
    const visitId = searchParams.get("visitId");
    const vaccinationMasterId = searchParams.get("vaccinationMasterId");
    if (!visitId || !vaccinationMasterId) {
      return NextResponse.json(
        { message: "Missing visitId or vaccinationMasterId" },
        { status: 400 }
      );
    }
    const backendUrl = `${apiUrl}/api/VaccinationDetail/by-visit-master?visitId=${visitId}&vaccinationMasterId=${vaccinationMasterId}`;
    const response = await fetch(backendUrl, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // No data found yet – return null or an empty object
        return NextResponse.json(null, { status: 200 });
      }
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || 'Failed to fetch vaccination detail' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}