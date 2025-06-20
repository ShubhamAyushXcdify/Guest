import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";


const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

// GET API Route
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const pageNumber = searchParams.get('pageNumber') || '1';
        const pageSize = searchParams.get('pageSize') || '10';
        const search = searchParams.get('search') || '';
        const clinicId = searchParams.get('clinicId') || '';
        const roleId = searchParams.get('roleId') || '';
        

        let token = getJwtToken(request);

        if(!token) {
            token = testToken;
        }
        

        const response = await fetch(
            `${apiUrl}/api/User?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}&clinicId=${clinicId}&roleId=${roleId}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            console.error('User API error:', response.status);
            throw new Error('Failed to fetch user from backend');
        }

        const data = await response.json();

        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
         console.error('Error fetching user:', error);
        return NextResponse.json({ message: `Error fetching user: ${error.message}` }, { status: 500 });
    }
}

// POST API Route
export async function POST(request: NextRequest) {
    try {
        const token = getJwtToken(request);

        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();

        const response = await fetch(`${apiUrl}/api/User`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ ...body, clinicId: body.clinicId }),
        });


        if (response.status === 401) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error('Create user error:', errorData);
            return NextResponse.json(
                { message: errorData?.message || 'Failed to create user' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
         console.error('Error creating user:', error);
        return NextResponse.json(
            { message: 'Error creating user' },
            { status: 500 }
        );
    }
}

// PUT API Route
export async function PUT(request: NextRequest) {
    try {
        const token = getJwtToken(request);

        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        
        // Ensure the ID is in the payload
        if (!body.id) {
            return NextResponse.json(
                { message: 'User ID is required in the request body' },
                { status: 400 }
            );
        }

        const response = await fetch(`${apiUrl}/api/User`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ ...body, clinicId: body.clinicId }),
        });

        if (response.status === 401) {
            return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
             console.error('Update user error:', errorData);
            return NextResponse.json(
                { message: errorData?.message || 'Failed to update user' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { message: 'Error updating user' },
            { status: 500 }
        );
    }
}

