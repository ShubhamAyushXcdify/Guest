import { getJwtToken } from '@/utils/serverCookie';
import { NextRequest } from 'next/server';
import { AiAnalysis } from '@/services/AI/ai-analysis';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  const { path, messages = [] }: { path: string, messages?: any[] } = await request.json();

  const token = getJwtToken(request);
  if (!token) {
    return new Response("Unauthorized", { status: 401 })
  }

  const apiBase = process.env.NEXT_PUBLIC_API_URL
  if (!apiBase) {
    return new Response("API base URL is not configured", { status: 500 })
  }

  // Extract filename from path
  const fileName = path.split("/").pop() || path
  const targetUrl = `${apiBase}/Uploads/${encodeURIComponent(fileName)}`

  // Fetch the file from the backend
  const fileResponse = await fetch(targetUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  })

  if (!fileResponse.ok) {
    return new Response("Failed to fetch file", { status: fileResponse.status })
  }

  // Get file data as ArrayBuffer and convert to base64
  const fileBuffer = await fileResponse.arrayBuffer()
  const fileBase64 = Buffer.from(fileBuffer).toString('base64')
  const contentType = fileResponse.headers.get("content-type") || "application/octet-stream"

  try {
    // Initialize AI Analysis service and analyze the file
    const aiAnalysis = new AiAnalysis()
    const result = await aiAnalysis.analyzeFile({
      fileBase64,
      fileName,
      contentType,
      fileBuffer,
      messages,
    })

    return result.toTextStreamResponse()
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze file'
    return new Response(errorMessage, { status: 500 })
  }
}                                             