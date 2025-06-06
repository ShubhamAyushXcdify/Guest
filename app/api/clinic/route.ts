import { NextResponse } from "next/server";

import { getJwtToken, getWorkspaceId } from "@/utils/serverCookie";
import { NextRequest } from "next/server";


const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

// GET API Route
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        let token = getJwtToken(request);
        const workspaceType = searchParams.get('workspacemode');
        const pageNumber = searchParams.get('pageNumber') || '1';
        const pageSize = searchParams.get('pageSize') || '10';
        const search = searchParams.get('search') || '';

        const response = await fetch(
            `${apiUrl}/api/Clinic?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch features from backend');
        }

        const data = await response.json();
        return NextResponse.json({ data: data }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error fetching features: ${error.message}` }, { status: 500 });
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

        const response = await fetch(`${apiUrl}/api/Clinic`, {
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
            console.error('Create clinic error:', errorData);
            return NextResponse.json(
                { message: errorData?.message || 'Failed to create clinic' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error creating clinic:', error);
        return NextResponse.json(
            { message: 'Error creating clinic' },
            { status: 500 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    ) {
    try {
        const token = getJwtToken(request);

        if (!token) {
            return NextResponse.json(
                { message: 'Unauthorized' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const response = await fetch(`${apiUrl}/api/Clinic`, {
            method: 'PUT',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to update clinic: ${response.status}`);
        }

        // Check if there's content before trying to parse JSON
        const contentType = response.headers.get("content-type");
        let data = null;

        if (contentType && contentType.includes("application/json")) {
            data = await response.json().catch(() => null);
        }

        return NextResponse.json({
            message: 'Clinic updated successfully',
            data: data || body
        }, { status: 200 });
    } catch (error) {
        console.error('Error updating clinic:', error);
        return NextResponse.json(
            { message: 'Error updating clinic', error: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}


