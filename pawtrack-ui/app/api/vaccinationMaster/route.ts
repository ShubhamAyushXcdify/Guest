import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const species = searchParams.get('species') || '';
        const isCore = searchParams.get('isCore') || '';
        
        let token = getJwtToken(request);
        if (!token) {
            token = testToken;
        }
        
        let queryString = '';
        if (species) {
            queryString += `species=${species}`;
        }
        if (isCore) {
            queryString += queryString ? `&isCore=${isCore}` : `isCore=${isCore}`;
        }
        
        const endpoint = `${apiUrl}/api/VaccinationMaster${queryString ? `?${queryString}` : ''}`;
        
        const response = await fetch(endpoint, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to fetch vaccination master data');
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error fetching vaccination master data: ${error.message}` }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        let token = getJwtToken(request);
        
        if (!token) {
            token = testToken;
        }
        
        const response = await fetch(`${apiUrl}/api/VaccinationMaster`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(data),
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || 'Failed to create vaccination master');
        }
        
        const responseData = await response.json();
        return NextResponse.json(responseData, { status: 201 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error creating vaccination master: ${error.message}` }, { status: 500 });
    }
}
