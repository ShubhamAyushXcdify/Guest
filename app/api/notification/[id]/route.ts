import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let token = getJwtToken(request);
    if (!token) token = testToken;

    const { id } = await params; 
    const response = await fetch(`${apiUrl}/api/Notification/${id}`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: "Failed to fetch notification" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching notification:", error);
    return NextResponse.json(
      { message: "Error fetching notification data" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const body = await request.json();
    let token = getJwtToken(request);
    if (!token) token = testToken;

    const { id } = await params; 
    const response = await fetch(`${apiUrl}/api/Notification/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Failed to get error details");
      console.error("Error response from backend:", errorText);
      throw new Error("Failed to update notification");
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    console.error("Error in notification PUT route:", error);
    return NextResponse.json({ message: `Error updating notification: ${error.message}` }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    let token = getJwtToken(request);
    if (!token) token = testToken;

    const { id } = await params; 
    const response = await fetch(`${apiUrl}/api/Notification/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Failed to get error details");
      console.error("Error response from backend:", errorText);
      throw new Error("Failed to delete notification");
    }

    return NextResponse.json({ message: "Notification deleted successfully" }, { status: 200 });
  } catch (error: any) {
    console.error("Error in notification DELETE route:", error);
    return NextResponse.json({ message: `Error deleting notification: ${error.message}` }, { status: 500 });
  }
}
