import { NextRequest, NextResponse } from "next/server"
import { getJwtToken } from "@/utils/serverCookie"

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    let token = getJwtToken(request)
    if (!token) {
      token = testToken
    }

    const response = await fetch(`${apiUrl}/api/VisitInvoice`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Failed to get error details")
      console.error("Error response from backend:", errorText)
      throw new Error('Failed to create invoice')
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 201 })
  } catch (error: any) {
    console.error("Error in invoice POST route:", error)
    return NextResponse.json({ message: `Error creating invoice: ${error.message}` }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const clinicId = searchParams.get("clinicId")
    const status = searchParams.get("status")
    const pageNumber = searchParams.get("pageNumber") || "1"
    const pageSize = searchParams.get("pageSize") || "10"

    let token = getJwtToken(request)
    if (!token) {
      token = testToken
    }

    let url = `${apiUrl}/api/VisitInvoice?pageNumber=${pageNumber}&pageSize=${pageSize}`
    if (clinicId) url += `&clinicId=${clinicId}`
    if (status) url += `&status=${status}`

    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      console.error('Invoice API error:', response.status)
      throw new Error('Failed to fetch invoices from backend')
    }

    const data = await response.json()
    return NextResponse.json(data, { 
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      }
    })
  } catch (error: any) {
    console.error('Error in invoices GET route:', error)
    return NextResponse.json({ message: `Error fetching invoices: ${error.message}` }, { status: 500 })
  }
}