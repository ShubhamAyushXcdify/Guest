import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        let token = getJwtToken(request);
        if(!token) {
            token = testToken;
        }
        const response = await fetch(
            `${apiUrl}/api/DewormingVisit/note`,
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
            throw new Error('Failed to create deworming note');
        }
        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error creating deworming note: ${error.message}` }, { status: 500 });
    }
} 