import { NextRequest, NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

// GET /api/screen/access?companyId=...&roleId=...
export async function GET(request: NextRequest) {
    try {
        const token = getJwtToken(request);
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const { searchParams } = new URL(request.url);
        const clinicId = searchParams.get("clinicId") ?? "";
        const roleId = searchParams.get("roleId");

        // Build upstream URL, include roleId only when provided
        let url = `${apiUrl}/api/Screen/access?clinicId=${encodeURIComponent(clinicId)}`;
        if (roleId) {
            url += `&roleId=${encodeURIComponent(roleId)}`;
        }
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        if (!response.ok) {
            return NextResponse.json(
                { message: "Failed to fetch screen access" },
                { status: response.status }
            );
        }
        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error fetching screen access" },
            { status: 500 }
        );
    }
}

// PUT /api/screen/access -> { roleId, companyId, screenIds: string[], isAccessEnable: boolean }
export async function PUT(request: NextRequest) {
    try {
        const token = getJwtToken(request);
        if (!token) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const body = await request.json();
        const response = await fetch(`${apiUrl}/api/Screen/access`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(body),
        });
        if (!response.ok) {
            const err = await response.json().catch(() => null);
            return NextResponse.json(
                { message: err?.message || "Failed to update screen access" },
                { status: response.status }
            );
        }
        const data = await response.json().catch(() => ({}));
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: "Error updating screen access" },
            { status: 500 }
        );
    }
}


