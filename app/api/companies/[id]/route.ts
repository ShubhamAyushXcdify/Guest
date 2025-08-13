import { NextRequest, NextResponse } from 'next/server'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

// GET /api/companies/[id] - Get company by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const response = await fetch(`${API_BASE_URL}/api/company/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        )
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching company:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company' },
      { status: 500 }
    )
  }
}

// PUT /api/companies/[id] - Update company by ID
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()

    const response = await fetch(`${API_BASE_URL}/api/company/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        )
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating company:', error)
    return NextResponse.json(
      { error: 'Failed to update company' },
      { status: 500 }
    )
  }
}

// DELETE /api/companies/[id] - Delete company by ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    const response = await fetch(`${API_BASE_URL}/api/company/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        )
      }
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // DELETE typically returns 204 No Content
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting company:', error)
    return NextResponse.json(
      { error: 'Failed to delete company' },
      { status: 500 }
    )
  }
}