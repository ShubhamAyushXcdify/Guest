import { NextResponse } from "next/server";
import { getJwtToken } from "@/utils/serverCookie";
import { NextRequest } from "next/server";

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`;
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`;

// GET API Route
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        
        // Extract all possible filter parameters
        const pageNumber = searchParams.get('pageNumber') || '1';
        const pageSize = searchParams.get('pageSize') || '10';
        const search = searchParams.get('search') || '';
        const category = searchParams.get('category') || '';
        const productType = searchParams.get('productType') || '';
        const dosageForm = searchParams.get('dosageForm') || '';
        const unitOfMeasure = searchParams.get('unitOfMeasure') || '';
        const requiresPrescription = searchParams.get('requiresPrescription') || '';
        const controlledSubstanceSchedule = searchParams.get('controlledSubstanceSchedule') || '';
        const isActive = searchParams.get('isActive') || '';
        const minPrice = searchParams.get('minPrice') || '';
        const maxPrice = searchParams.get('maxPrice') || '';
        const lowStock = searchParams.get('lowStock') || '';
        const createdFrom = searchParams.get('createdFrom') || '';
        const createdTo = searchParams.get('createdTo') || '';
        const sortBy = searchParams.get('sortBy') || '';
        const sortOrder = searchParams.get('sortOrder') || '';
        
        // Build query string with all parameters
        const queryParams = new URLSearchParams();
        queryParams.append('pageNumber', pageNumber);
        queryParams.append('pageSize', pageSize);
        
        if (search) queryParams.append('search', search);
        if (category) queryParams.append('category', category);
        if (productType) queryParams.append('productType', productType);
        if (dosageForm) queryParams.append('dosageForm', dosageForm);
        if (unitOfMeasure) queryParams.append('unitOfMeasure', unitOfMeasure);
        if (requiresPrescription) queryParams.append('requiresPrescription', requiresPrescription);
        if (controlledSubstanceSchedule) queryParams.append('controlledSubstanceSchedule', controlledSubstanceSchedule);
        if (isActive) queryParams.append('isActive', isActive);
        if (minPrice) queryParams.append('minPrice', minPrice);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);
        if (lowStock) queryParams.append('lowStock', lowStock);
        if (createdFrom) queryParams.append('createdFrom', createdFrom);
        if (createdTo) queryParams.append('createdTo', createdTo);
        if (sortBy) queryParams.append('sortBy', sortBy);
        if (sortOrder) queryParams.append('sortOrder', sortOrder);
        
        // Get token from cookie or use test token as fallback
        let token = getJwtToken(request);
        if(!token) {
            token = testToken;
        }

        const response = await fetch(
            `${apiUrl}/api/Product?${queryParams.toString()}`,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            }
        );

        if (!response.ok) {
            throw new Error('Failed to fetch products from backend');
        }

        const data = await response.json();
        return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
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
