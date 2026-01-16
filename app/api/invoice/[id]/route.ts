import { NextRequest, NextResponse } from "next/server"
import { getJwtToken } from "@/utils/serverCookie"

const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}`
const testToken = `${process.env.NEXT_PUBLIC_TEST_TOKEN}`

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let token = getJwtToken(request)
    if (!token) {
      token = testToken
    }

    const { id } = await params
    const response = await fetch(`${apiUrl}/api/VisitInvoice/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to fetch invoice' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    return NextResponse.json(
      { message: 'Error fetching invoice data' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json()
    
    let token = getJwtToken(request)
    if (!token) {
      token = testToken
    }

    const { id } = await params
    const response = await fetch(`${apiUrl}/api/VisitInvoice/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Failed to get error details")
      console.error("Error response from backend:", errorText)
      throw new Error('Failed to update invoice')
    }

    const data = await response.json()
    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error("Error in invoice PUT route:", error)
    return NextResponse.json({ message: `Error updating invoice: ${error.message}` }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let token = getJwtToken(request)
    if (!token) {
      token = testToken
    }

    const { id } = await params
    const response = await fetch(`${apiUrl}/api/VisitInvoice/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Failed to get error details")
      console.error("Error response from backend:", errorText)
      throw new Error('Failed to delete invoice')
    }

    return NextResponse.json({ message: "Invoice deleted successfully" }, { status: 200 })
  } catch (error: any) {
    console.error("Error in invoice DELETE route:", error)
    return NextResponse.json({ message: `Error deleting invoice: ${error.message}` }, { status: 500 })
  }
}