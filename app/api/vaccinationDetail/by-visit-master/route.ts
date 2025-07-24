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