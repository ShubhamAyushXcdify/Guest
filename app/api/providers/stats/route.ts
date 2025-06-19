import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

// GET API Route
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        let token = getJwtToken(request);
        const pageNumber = searchParams.get('pageNumber') || '1';
        const pageSize = searchParams.get('pageSize') || '10';
        const search = searchParams.get('search') || '';

        const response = await fetch(
            `${apiUrl}/api/Appointment/provider-dashboard?pageNumber=${pageNumber}&pageSize=${pageSize}&search=${search}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch roles from backend');
        }

        const data = await response.json();
        const mapped = data.map((item: any) => ({
            id: item.id,
            name: item.name,
            role: item.role,
            specialty: item.specialty,
            appointments: item.appointments || [],
            total: Number(item.total) || 0,
            done: Number(item.done) || 0,
            pending: Number(item.pending) || 0,
            scheduled: 0, // or calculate if you have info
            initials: `${item.name?.split(' ')[0]?.[0] || ''}${item.name?.split(' ')[1]?.[0] || ''}`
        }));
        return NextResponse.json({ data: mapped }, { status: 200 });
    } catch (error: any) {
        return NextResponse.json({ message: `Error fetching roles: ${error.message}` }, { status: 500 });
    }
}
