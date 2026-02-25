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
        const status = searchParams.get('status') || '';

        const response = await fetch(
            `${apiUrl}/api/ClientRegistration?pageNumber=${pageNumber}&pageSize=${pageSize}&status=${status}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            console.error('ClientRegistration API error:', response.status);
            throw new Error('Failed to fetch client registrations from backend');
        }

        const data = await response.json();
        return NextResponse.json(data, { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          }
        });
    } catch (error: any) {
        console.error('Error in client registration GET route:', error);
        return NextResponse.json({ message: `Error fetching client registrations: ${error.message}` }, { status: 500 });
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
            `${apiUrl}/api/ClientRegistration/register`,
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
            // Try to parse backend error as JSON and forward the message
            let errorMessage = 'Failed to create client registration';
            try {
                const errorJson = await response.json();
                if (errorJson && errorJson.message) {
                    errorMessage = errorJson.message;
                }
            } catch {
                // fallback to text if not JSON
                const errorText = await response.text().catch(() => '');
                if (errorText) errorMessage = errorText;
            }
            console.error("Error response from backend:", errorMessage);
            return NextResponse.json({ message: errorMessage }, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error("Error in client registration POST route:", error);
        return NextResponse.json({ message: `Error creating client registration: ${error.message}` }, { status: 500 });
    }
}
