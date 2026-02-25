import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: patientId } = await context.params;

    let token = getJwtToken(request);
    if (!token) token = testToken;

    // Call backend API
    const response = await fetch(
      `${apiUrl}/api/Patient/${patientId}/weight-history`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { message: "Failed to fetch weight history for patient" },
        { status: response.status }
      );
    }

    const backendData = await response.json();
    const transformed = {
      patientId: backendData.patientId,
      patientName: backendData.patientName,
      weightHistory: backendData.weightHistory?.map((item: any) => ({
        weightKg: item.weightKg,
        date: item.date,
        source: item.source ?? "Unknown",
        appointmentId: item.appointmentId ?? null,
        visitId: item.visitId ?? null,
        createdAt: item.createdAt,
      })) ?? [],
    };

    return NextResponse.json(transformed, { status: 200 });
  } catch (error) {
    console.error("Error fetching weight history:", error);
    return NextResponse.json(
      { message: "Error fetching weight history" },
      { status: 500 }
    );
  }
}
