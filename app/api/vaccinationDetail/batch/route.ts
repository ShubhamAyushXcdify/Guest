import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

export async function PUT(request: NextRequest) {
  try {
    const token = getJwtToken(request);

    if (!token) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Proxy the request to the backend batch endpoint
    const response = await fetch(`${apiUrl}/api/VaccinationDetail/batch`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const status = response.status;
    if (status === 204) {
      return NextResponse.json({}, { status: 200 });
    }

    // Safely handle empty or invalid JSON responses
    const text = await response.text();
    let data;
    try {
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      data = { message: "Invalid JSON from backend" };
    }

    return NextResponse.json(data, { status });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
} 