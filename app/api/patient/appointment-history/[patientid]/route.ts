import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(request: NextRequest,
    {params}: { params: Promise<{ patientid: string }> }) {
  try {
    const { patientid } = await params;
    if (!patientid) {
      return NextResponse.json({ message: "Patient id is required" }, { status: 400 });
    }

    let token = getJwtToken(request);
    if (!token) token = testToken;

    const response = await fetch(`${apiUrl}/api/Patient/${patientid}/appointment-history`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ message: "Failed to fetch appointment history", details: text }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: `Error fetching appointment history: ${error.message}` }, { status: 500 });
  }
}


