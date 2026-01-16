import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const testToken = process.env.NEXT_PUBLIC_TEST_TOKEN || '';

// GET API Route
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const pageNumber = searchParams.get('pageNumber') || '1';
        const pageSize = searchParams.get('pageSize') || '10';
        const search = searchParams.get('searchByname') || '';
        const category = searchParams.get('category') || '';
        const companyId = searchParams.get('companyId') || '';
        
        // Get token from cookie or use test token as fallback
        let token = getJwtToken(request);
        if(!token) {
            token = testToken;
        }


        const response = await fetch(
            `${apiUrl}/api/Product?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}&category=${category}&companyId=${companyId}`,
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
            throw new Error(`Failed to fetch products from backend: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        console.error('Error in products GET route:', error);
        return NextResponse.json({ message: `Error fetching products: ${error.message}` }, { status: 500 });
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

        const response = await fetch(`${apiUrl}/api/Product`, {
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
            console.error('Create product error:', errorData);
            return NextResponse.json(
                { message: errorData?.message || 'Failed to create product' },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { message: 'Error creating product' },
            { status: 500 }
        );
    }
}
