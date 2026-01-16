import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// GET /api/companies - Get companies with optional pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pageNumber = searchParams.get('pageNumber');
    const pageSize = searchParams.get('pageSize');
    const paginationRequired = searchParams.get('paginationRequired');
    const search = searchParams.get('search');
    const params = new URLSearchParams();
    if (pageNumber) params.set('pageNumber', pageNumber);
    if (pageSize) params.set('pageSize', pageSize);
    // Always enforce pagination on the backend
    params.set('paginationRequired', 'true');
    if (search && search !== "undefined" && search !== "null") {
      params.set("search", search);  // Use set instead of append to avoid duplicates
    }
    const qs = params.toString();
    const response = await fetch(`${API_BASE_URL}/api/company${qs ? `?${qs}` : ''}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch companies' },
      { status: 500 }
    )
  }
}

// POST /api/companies - Create a new company
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_BASE_URL}/api/company`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error creating company:', error)
    return NextResponse.json(
      { error: 'Failed to create company' },
      { status: 500 }
    )
  }
}