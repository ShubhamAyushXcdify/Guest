import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinicId');

    if (!clinicId) {
      return NextResponse.json({ message: 'Clinic ID is required' }, { status: 400 });
    }

    const baseApiUrl = `${apiUrl}/api/Dashboard/clinic-weekly-profit`;
    const formattedParams = new URLSearchParams();

    formattedParams.set('clinicId', clinicId);

    if (searchParams.has('fromDate')) {
      formattedParams.set('fromDate', searchParams.get('fromDate')!);
    }
    if (searchParams.has('toDate')) {
      formattedParams.set('toDate', searchParams.get('toDate')!);
    }

    searchParams.forEach((value, key) => {
      if (!formattedParams.has(key)) {
        formattedParams.set(key, value);
      }
    });

    const apiEndpoint = `${baseApiUrl}?${formattedParams.toString()}`;
    const token = getJwtToken(request);

    const response = await fetch(apiEndpoint, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to fetch weekly profit: ${response.status} ${text}`);
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { message: `Error fetching clinic weekly profit: ${error.message}` },
      { status: 500 }
    );
  }
}