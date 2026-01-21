import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json(); // optional payload
    let token = getJwtToken(request);
    if (!token) token = testToken;

    const { id } = params;
    const response = await fetch(`${apiUrl}/api/Notification/${id}/read`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Failed to get error details");
      console.error("Error marking notification as read:", errorText);
      throw new Error("Failed to mark notification as read");
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error in notification read PUT route:", error);
    return NextResponse.json(
      { message: `Error marking notification as read: ${error.message}` },
      { status: 500 }
    );
  }
}
