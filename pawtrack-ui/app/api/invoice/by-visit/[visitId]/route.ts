import { NextRequest, NextResponse } from "next/server"
import { getJwtToken } from "@/utils/serverCookie"

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ visitId: string }> }
) {
  try {
    let token = getJwtToken(request)
    if (!token) {
      token = testToken
    }

    const { visitId } = await params
    const response = await fetch(`${apiUrl}/api/VisitInvoice/visit/${visitId}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 404) {
        // No data found yet – return null or an empty object
        return NextResponse.json(null, { status: 200 });
      }
      return NextResponse.json(
        { message: 'Failed to fetch invoice' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error fetching invoice by visit:', error)
    return NextResponse.json(
      { message: 'Error fetching invoice data' },
      { status: 500 }
    )
  }
}