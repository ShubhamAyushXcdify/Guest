import { NextRequest, NextResponse } from 'next/server';
import { getJwtToken } from '@/utils/serverCookie';

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const patientId = searchParams.get('patientId');

    if (!patientId) {
      return NextResponse.json(
        { error: 'patientId is required' },
        { status: 400 }
      );
    }

    const token = getJwtToken(req);
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!guidRegex.test(patientId)) {
      return NextResponse.json(
        { error: 'Invalid patientId format' },
        { status: 400 }
      );
    }

    let allMessages: any[] = [];
    let pageNumber = 1;
    const pageSize = 100; // Reasonable page size
    let hasMorePages = true;

    while (hasMorePages) {
      const url = new URL(`${apiUrl}/api/Conversation/patient/${patientId}/messages`);
      url.searchParams.append('pageNumber', pageNumber.toString());
      url.searchParams.append('pageSize', pageSize.toString());
      url.searchParams.append('paginationRequired', 'true');

      const messagesResponse = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        cache: 'no-store',
      });

      if (!messagesResponse.ok) {
        if (pageNumber === 1 && messagesResponse.status === 404) {
          return NextResponse.json({ success: true, deletedCount: 0 }, { status: 200 });
        }
        
        if (pageNumber === 1) {
          return NextResponse.json(
            { error: 'Failed to load messages for deletion' },
            { status: messagesResponse.status }
          );
        }
        // Otherwise, break and continue with what we have
        break;
      }

      const messagesData = await messagesResponse.json();
      let pageMessages: any[] = [];
      
      if (Array.isArray(messagesData)) {
        pageMessages = messagesData;
        hasMorePages = false;
      } else if (messagesData.items && Array.isArray(messagesData.items)) {
        pageMessages = messagesData.items;
        hasMorePages = messagesData.hasNextPage === true;
      } else if (messagesData.messages && Array.isArray(messagesData.messages)) {
        pageMessages = messagesData.messages;
        hasMorePages = false;
      }

      allMessages = allMessages.concat(pageMessages);
      
      if (pageMessages.length < pageSize) {
        hasMorePages = false;
      }
      
      if (hasMorePages) {
        pageNumber++;
      }
    }

    if (allMessages.length === 0) {
      return NextResponse.json({ success: true, deletedCount: 0 }, { status: 200 });
    }

    const deletePromises = allMessages.map(async (message: any) => {
      if (!message.id) return;
      
      try {
        const deleteResponse = await fetch(
          `${apiUrl}/api/Conversation/messages/${message.id}`,
          {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (!deleteResponse.ok && deleteResponse.status !== 404) {
          // Error handled silently - continue with other deletions
        }
      } catch (error) {
        // Error handled silently
      }
    });

    await Promise.all(deletePromises);

    return NextResponse.json({ success: true, deletedCount: allMessages.length }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

