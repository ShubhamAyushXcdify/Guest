import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(request: NextRequest) {
    try {
        let token = getJwtToken(request);
        if (!token) {
            token = testToken;
        }
        const response = await fetch(
            `${apiUrl}/api/EmergencyVisit/procedures`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch emergency visit procedures');
        }
        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error fetching emergency visit procedures: ${error.message}` }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        let token = getJwtToken(request);
        if(!token) {
            token = testToken;
        }
        const response = await fetch(
            `${apiUrl}/api/EmergencyVisit/procedures`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            }
        );
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to create emergency visit procedure');
        }
        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error creating emergency visit procedure: ${error.message}` }, { status: 500 });
    }
} 