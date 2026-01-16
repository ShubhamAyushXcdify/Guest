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
        if (!token) token = testToken;

        // Support both camelCase and PascalCase from the UI
        const pageNumber = searchParams.get('PageNumber') || searchParams.get('pageNumber') || '1';
        const pageSize = searchParams.get('PageSize') || searchParams.get('pageSize') || '10';
        const type = searchParams.get('Type') || searchParams.get('type') || 'first_name';
        const search = searchParams.get('Query') || searchParams.get('query') || searchParams.get('search') || '';
        const companyId = searchParams.get('CompanyId') || searchParams.get('companyId') || '';

        const firstName = searchParams.get('FirstName') || searchParams.get('firstName') || '';
        const lastName = searchParams.get('LastName') || searchParams.get('lastName') || '';
        const email = searchParams.get('Email') || searchParams.get('email') || '';
        const phonePrimary = searchParams.get('PhonePrimary') || searchParams.get('phonePrimary') || '';

        const params = new URLSearchParams({
            PageNumber: String(pageNumber),
            PageSize: String(pageSize),
        });

        if (companyId) params.append('CompanyId', companyId);
        if (search && search.trim().length > 0) {
            params.append('Type', type);
            params.append('Query', search);
        }
        if (firstName) params.append('FirstName', firstName);
        if (lastName) params.append('LastName', lastName);
        if (email) params.append('Email', email);
        if (phonePrimary) params.append('PhonePrimary', phonePrimary);

        const response = await fetch(
            `${apiUrl}/api/Client?${params.toString()}`,
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
        return NextResponse.json(data, { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, max-age=0',
          }
        });
    } catch (error: any) {
        console.error('Error in clients GET route:', error);
        return NextResponse.json({ message: `Error fetching clients: ${error.message}` }, { status: 500 });
    }
}

// POST API Route - Create a new client
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        
        let token = getJwtToken(request);

        if(!token) {
            token = testToken;
        }

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

        if (!response.ok) {
            const errorText = await response.text().catch(() => "Failed to get error details");
            console.error("Error response from backend:", errorText);
            throw new Error('Failed to create client');
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error("Error in clients POST route:", error);
        return NextResponse.json({ message: `Error creating client: ${error.message}` }, { status: 500 });
    }
}
