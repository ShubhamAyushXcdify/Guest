import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;


export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        let token = getJwtToken(request);
        const searchType = searchParams.get('type') || '';    
        const query = searchParams.get('query') || '';

        const response = await fetch(
            `${apiUrl}/api/Patient/search?query=${query}&type=${searchType}`,
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



        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error fetching patients: ${error.message}` }, { status: 500 });
    }
}
