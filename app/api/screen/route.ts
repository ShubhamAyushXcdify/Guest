import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

// GET /api/screen -> proxies to backend /api/Screen
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const token = getJwtToken(request);

        // Keep pagination/search params consistent with other modules (optional for backend)
        const pageNumber = searchParams.get("pageNumber") || "1";
        const pageSize = searchParams.get("pageSize") || "10";
        const search = searchParams.get("search") || "";

        const response = await fetch(
            `${apiUrl}/api/Screen?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error("Failed to fetch screens from backend");
        }

        const data = await response.json();
        return NextResponse.json({ data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json(
            { message: `Error fetching screens: ${error.message}` },
            { status: 500 }
        );
    }
}

// POST /api/screen -> proxies to backend /api/Screen
export async function POST(request: NextRequest) {
    try {
        const token = getJwtToken(request);
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const response = await fetch(`${apiUrl}/api/Screen`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            return NextResponse.json(
                { message: errorData?.message || "Failed to create screen" },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error creating screen" },
            { status: 500 }
        );
    }
}


