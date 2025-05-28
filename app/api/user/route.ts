import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";


const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

// GET API Route
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        
        let token = getJwtToken(request);

        if(!token) {
            token = testToken;
        }
        
        // Log to debug token issues
        console.log('Using token:', token ? 'Valid token' : 'No token');

        const workspaceType = searchParams.get('workspacemode');

        const response = await fetch(
            `${apiUrl}/api/User`,
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
        return NextResponse.json({ data: data }, { status: 200 });
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
            body: JSON.stringify({ ...body}),
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

