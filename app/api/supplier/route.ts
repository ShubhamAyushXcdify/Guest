import { NextResponse } from "next/server";

import { getJwtToken, getWorkspaceId } from "@/utils/serverCookie";
import { NextRequest } from "next/server";


const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

// GET API Route
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        let token = getJwtToken(request);
        const pageNumber = searchParams.get('pageNumber') || '1';
        const pageSize = searchParams.get('pageSize') || '10';
        const name = searchParams.get('name') || '';
        const clinicId = searchParams.get('clinicId') || '';
        const companyId = searchParams.get('companyId') || '';
        const clinicName = searchParams.get('clinicName') || '';
        const contactPerson = searchParams.get('contactPerson') || '';
        const email = searchParams.get('email') || '';
        const city = searchParams.get('city') || '';
        const state = searchParams.get('state') || '';
        const country = searchParams.get('country') || '';
         const phone = searchParams.get('phone') || '';

        // Build query parameters
        const params = new URLSearchParams({
            pageNumber,
            pageSize,
            ...(name && { name }),
            ...(clinicId && { clinicId }),
            ...(companyId && { companyId }),
            ...(clinicName && { clinicName }),
            ...(contactPerson && { contactPerson }),
            ...(email && { email }),
            ...(city && { city }),
            ...(state && { state }),
            ...(country && { country }),
            ...(phone && { phone })
        });

        const queryString = params.toString();
        console.log(queryString);

        const response = await fetch(
            `${apiUrl}/api/Supplier?${queryString}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch suppliers from backend');
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error fetching suppliers: ${error.message}` }, { status: 500 });
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

        const response = await fetch(`${apiUrl}/api/Supplier`, {
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
                { message: errorData?.message || 'Failed to create Supplier' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error creating Supplier:', error);
        return NextResponse.json(
            { message: 'Error creating Supplier' },
            { status: 500 }
        );
    }
}

