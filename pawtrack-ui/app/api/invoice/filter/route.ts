import { NextRequest, NextResponse } from "next/server"
import { getJwtToken } from "@/utils/serverCookie"

const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.pawtrack.com"
const testToken = process.env.TEST_TOKEN || ""

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pageNumber = searchParams.get('pageNumber') || '1'
    const pageSize = searchParams.get('pageSize') || '10'
    const patientId = searchParams.get('patientId')
    const status = searchParams.get('status')
    const createdAtFrom = searchParams.get('createdAtFrom')
    const createdAtTo = searchParams.get('createdAtTo')

    let token = getJwtToken(request)
    if (!token) {
      token = testToken
    }

    let url = `${apiUrl}/api/VisitInvoice/filter?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (patientId) url += `&patientId=${patientId}`
    if (status) url += `&status=${status}`
    if (createdAtFrom) url += `&createdAtFrom=${createdAtFrom}`
    if (createdAtTo) url += `&createdAtTo=${createdAtTo}`

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorData = await response.text()
      return NextResponse.json(
        { error: `API Error: ${response.status} - ${errorData}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoices' },
      { status: 500 }
    )
  }
}