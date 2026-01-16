import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
type CreateRatingBody = {
  appointmentId: string;
  rating: number; // 1–5
  feedback?: string;
};

export async function GET(request: NextRequest) {
  try {
    let token = getJwtToken(request);
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(`${apiUrl}/api/Rating`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch ratings" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching ratings:", error);
    return NextResponse.json(
      {
        message: "Error fetching ratings",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
export async function POST(request: NextRequest) {
  try {
    let token = getJwtToken(request);
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = (await request.json()) as CreateRatingBody;
    const { appointmentId, rating, feedback } = body;

    if (!appointmentId) {
      return NextResponse.json(
        { error: "appointmentId is required" },
        { status: 400 }
      );
    }
    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "rating must be a number between 1 and 5" },
        { status: 400 }
      );
    }

    const requestBody: CreateRatingBody = {
      appointmentId,
      rating,
      feedback,
    };

    const response = await fetch(`${apiUrl}/api/Rating`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(requestBody),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        {
          message: result.message || "Failed to create rating",
          errors: result.errors,
        },
        { status: response.status }
      );
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error("Error creating rating:", error);
    return NextResponse.json(
      {
        message: "Failed to create rating",
        error: error.message,
        stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}