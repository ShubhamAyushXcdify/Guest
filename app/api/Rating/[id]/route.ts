import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
type UpdateRatingBody = {
  rating?: number; // 1–5
  feedback?: string;
};

export async function GET(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    let token = getJwtToken(request);
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const response = await fetch(`${apiUrl}/api/Rating/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json({ message: "Rating not found" }, { status: 404 });
      }
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || "Failed to fetch rating" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching rating:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const token = getJwtToken(request);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as UpdateRatingBody;

    if (body.rating !== undefined) {
      if (typeof body.rating !== "number" || body.rating < 1 || body.rating > 5) {
        return NextResponse.json(
          { error: "rating must be a number between 1 and 5" },
          { status: 400 }
        );
      }
    }

    const response = await fetch(`${apiUrl}/api/Rating/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      return NextResponse.json(
        { message: result.message || "Failed to update rating", errors: result.errors },
        { status: response.status }
      );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error updating rating:", error);
    return NextResponse.json(
      { message: "Error updating rating", error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> }
) {
  const { id } = await ctx.params;
  try {
    const token = getJwtToken(request);
    if (!token) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const response = await fetch(`${apiUrl}/api/Rating/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { message: errorData.message || "Failed to delete rating" },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: "Rating deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting rating:", error);
    return NextResponse.json({ message: "Error deleting rating" }, { status: 500 });
  }
}