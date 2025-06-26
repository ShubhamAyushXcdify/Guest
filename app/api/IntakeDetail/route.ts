import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        let token = getJwtToken(request);
        
        if (!token) {
            token = testToken;
        }
        
        const response = await fetch(
            `${apiUrl}/api/IntakeDetail`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch intake details');
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error fetching intake details: ${error.message}` }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        let token = getJwtToken(request);

        if(!token) {
            token = testToken;
        }

        // Clone the request to avoid consuming it
        const clonedRequest = request.clone();
        
        // Forward the multipart/form-data request directly
        const formData = await clonedRequest.formData();
        
        const response = await fetch(
            `${apiUrl}/api/IntakeDetail`,
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    // Don't set Content-Type, it will be set automatically with the boundary
                },
                body: formData,
            }
        );

        if (!response.ok) {
            throw new Error('Failed to create intake detail');
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error creating intake detail: ${error.message}` }, { status: 500 });
    }
} 