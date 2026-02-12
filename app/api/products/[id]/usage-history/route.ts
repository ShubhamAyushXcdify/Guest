import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const testToken = process.env.NEXT_PUBLIC_TEST_TOKEN || '';

// GET API Route for product usage history
export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { searchParams } = new URL(request.url);
        const pageNumber = searchParams.get('pageNumber') || '1';
        const pageSize = searchParams.get('pageSize') || '10';
        const { id } = params;
        
        if (!id) {
            return NextResponse.json(
                { message: 'Product ID is required' },
                { status: 400 }
            );
        }

        // Get token from cookie or use test token as fallback
        let token = getJwtToken(request);
        if(!token) {
            token = testToken;
        }

        const response = await fetch(
            `${apiUrl}/api/Product/${id}/usage-history?pageNumber=${pageNumber}&pageSize=${pageSize}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Backend response error:', response.status, errorText);
            throw new Error(`Failed to fetch product usage history from backend: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error('Error in product usage history GET route:', error);
        return NextResponse.json({ message: `Error fetching product usage history: ${error.message}` }, { status: 500 });
    }
}
