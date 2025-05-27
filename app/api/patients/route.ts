import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

// GET API Route - Get all patients
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const pageNumber = searchParams.get('pageNumber') || '1';
        const pageSize = searchParams.get('pageSize') || '10';
        const search = searchParams.get('search') || '';

        let token = getJwtToken(request);

        if(!token) {
            token = testToken;
        }

        console.log(`Fetching patients with parameters: pageNumber=${pageNumber}, pageSize=${pageSize}, search=${search}`);

        // Only pass pagination and search parameters in the URL, not specific filter fields
        const response = await fetch(
            `${apiUrl}/api/Patient?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch patients from backend');
        }

        // Get the direct array of patients from the backend
        const data = await response.json();
        console.log('Backend response:', data);
        
        // Return the proper structure for the frontend
        return NextResponse.json({ 
            data: Array.isArray(data) ? data : [], 
            totalCount: data.length || 0,
            pageCount: Math.ceil((data.length || 0) / parseInt(pageSize))
        }, { status: 200 });
    } catch (error: any) {
        console.error('Error in patients API route:', error);
        return NextResponse.json({ message: `Error fetching patients: ${error.message}` }, { status: 500 });
    }
}

// POST API Route - Create a new patient
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        let token = getJwtToken(request);

        if(!token) {
            token = testToken;
        }

        const response = await fetch(
            `${apiUrl}/api/Patient`,
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
            throw new Error('Failed to create patient');
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error creating patient: ${error.message}` }, { status: 500 });
    }
}

// PUT API Route - Update a patient
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();
        let token = getJwtToken(request);

        if(!token) {
            token = testToken;
        }

        const response = await fetch(
            `${apiUrl}/api/Patient`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(body),
            }
        );

        if (!response.ok) {
            throw new Error('Failed to update patient');
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error updating patient: ${error.message}` }, { status: 500 });
    }
}
