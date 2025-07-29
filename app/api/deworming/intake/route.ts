import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        let token = getJwtToken(request);
        const pageNumber = searchParams.get('pageNumber') || '1';
        const pageSize = searchParams.get('pageSize') || '10';
        const paginationRequired = searchParams.get('paginationRequired') || 'true';

        const response = await fetch(
            `${apiUrl}/api/DewormingVisit?pageNumber=${pageNumber}&pageSize=${pageSize}&paginationRequired=${paginationRequired}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch deworming visits from backend');
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error fetching deworming visits: ${error.message}` }, { status: 500 });
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
            `${apiUrl}/api/DewormingVisit`,
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
            throw new Error('Failed to create deworming visit');
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error creating deworming visit: ${error.message}` }, { status: 500 });
    }
} 