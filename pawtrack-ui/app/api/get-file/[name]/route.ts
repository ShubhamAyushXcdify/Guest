import { getJwtToken } from "@/utils/serverCookie";
import type { NextRequest } from "next/server"

// Proxy by uploaded filename to the backend Uploads folder
export async function GET(request: NextRequest, context: { params: Promise<{ name: string }> }) {
  const { name } = await context.params
  if (!name) {
    return new Response("filename is required", { status: 400 })
  }
  const token = getJwtToken(request);   
  if (!token) {
    return new Response("Unauthorized", { status: 401 })
  }
  const apiBase = process.env.NEXT_PUBLIC_API_URL
  if (!apiBase) {
    return new Response("API base URL is not configured", { status: 500 })
  }

  const targetUrl = `${apiBase}/Uploads/${encodeURIComponent(name)}`

  try {
    const backendResponse = await fetch(targetUrl, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    })

    const headers = new Headers(backendResponse.headers)
    return new Response(backendResponse.body, { status: backendResponse.status, headers })
  } catch (error) {
    return new Response("Failed to fetch file", { status: 502 })
  }
}


