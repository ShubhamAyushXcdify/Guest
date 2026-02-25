import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// GET /api/companies/by-subdomain - Get company by subdomain (using domain parameter)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const subdomain = searchParams.get('subdomain');

    if (!subdomain) {
      return NextResponse.json(
        { error: 'Subdomain parameter is required' },
        { status: 400 }
      )
    }

    // Construct the full domain from subdomain
    const fullDomain = `${subdomain}.xcdify.com`;

    // Call existing backend API with subdomain parameter
    let response = await fetch(`${API_BASE_URL}/api/company?domainName=${encodeURIComponent(subdomain)}&pageSize=1&paginationRequired=false`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // If subdomain search fails, try companyName as fallback
    if (!response.ok) {
      console.log(`Subdomain search failed for ${subdomain}, trying companyName fallback...`);
      
      // Try fallback with companyName
      response = await fetch(`${API_BASE_URL}/api/company?companyName=${encodeURIComponent(subdomain)}&pageSize=1&paginationRequired=false`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return NextResponse.json(
            { error: 'Company not found for this subdomain' },
            { status: 404 }
          )
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
    }

    const data = await response.json()

    // Handle both array and paginated responses
    let company = null;
    if (Array.isArray(data)) {
      company = data[0]; // Take first company if multiple found
    } else if (data.items && Array.isArray(data.items)) {
      company = data.items[0]; // Take first company from paginated response
    } else {
      company = data; // Single company object
    }

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found for this subdomain' },
        { status: 404 }
      )
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error('Error fetching company by subdomain:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company data' },
      { status: 500 }
    )
  }
} 
