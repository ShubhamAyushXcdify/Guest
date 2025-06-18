//here just want post and get all api endpoints

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
        const clinicId = searchParams.get('clinicId') || '';
        const type = searchParams.get('type') || 'first_name';
        const search = searchParams.get('query') || '';

        console.log('Fetching clients with params:', { pageNumber, pageSize, clinicId });
        console.log('Using token (masked):', token ? token.substring(0, 10) + '...' : 'No token');

        const response = await fetch(
            `${apiUrl}/api/Client?pageNumber=${pageNumber}&pageSize=${pageSize}&clinicId=${clinicId}&type=${type}&query=${encodeURIComponent(search)}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            console.error('Client API error:', response.status);
            throw new Error('Failed to fetch clients from backend');
        }

        const data = await response.json();
        console.log('Client API response:', data);
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error('Error in clients GET route:', error);
        return NextResponse.json({ message: `Error fetching clients: ${error.message}` }, { status: 500 });
    }
}

// POST API Route - Create a new client
export async function POST(request: NextRequest) {
    try {
        console.log("POST /api/clients route handler called");
        
        const body = await request.json();
        console.log("Request body:", body);
        
        let token = getJwtToken(request);

        if(!token) {
            token = testToken;
        }

        console.log("Using token (masked):", token.substring(0, 10) + "...");
        console.log("Sending POST request to:", `${apiUrl}/api/Client`);
        
        const response = await fetch(
            `${apiUrl}/api/Client`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            }
        );

        console.log("Backend API response status:", response.status);
        
        if (!response.ok) {
            const errorText = await response.text().catch(() => "Failed to get error details");
            console.error("Error response from backend:", errorText);
            throw new Error('Failed to create client');
        }

        const data = await response.json();
        console.log("Client created successfully, response data:", data);
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error("Error in clients POST route:", error);
        return NextResponse.json({ message: `Error creating client: ${error.message}` }, { status: 500 });
    }
}
