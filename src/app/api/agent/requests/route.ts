import { db } from '@/lib/db';
import { ticketRequests, agentFloat } from '@/db/schema';
import { eq, and, gte, lte } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID required' },
        { status: 400 }
      );
    }

    const parsedAgentId = parseInt(agentId);
    if (isNaN(parsedAgentId)) {
      return NextResponse.json(
        { error: 'Invalid agent ID' },
        { status: 400 }
      );
    }

    // Check agent's float balance and daily quota
    const floatAccount = await db
      .select()
      .from(agentFloat)
      .where(eq(agentFloat.agentId, parsedAgentId))
      .limit(1);

    if (!floatAccount || floatAccount.length === 0) {
      return NextResponse.json(
        { error: 'Float account not found' },
        { status: 404 }
      );
    }

    const account = floatAccount[0];

    // Check if quota available
    if ((account.dailyQuotaRemaining || 0) <= 0) {
      return NextResponse.json({
        requests: [],
        total: 0,
        message: 'Daily quota exhausted. Buy more float to see more requests.',
        quotaRemaining: 0,
      });
    }

    // Get available requests (not claimed, not expired)
    const now = new Date();
    const offset = (page - 1) * limit;

    const requests = await db
      .select()
      .from(ticketRequests)
      .where(
        and(
          eq(ticketRequests.status, 'open'),
          gte(ticketRequests.requestExpiresAt, now)
        )
      )
      .orderBy(ticketRequests.travelDate)
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      requests: requests.map((r) => ({
        id: r.id,
        fromCity: r.fromCity,
        toCity: r.toCity,
        travelDate: r.travelDate,
        passengerCount: r.passengerCount,
        // Don't expose full contact details yet - they pay to see
        contactPhone: null,
        contactEmail: null,
        preferredOperator: r.preferredOperator,
        createdAt: r.createdAt,
        expiresAt: r.requestExpiresAt,
      })),
      total: requests.length,
      page,
      limit,
      quotaRemaining: account.dailyQuotaRemaining,
      costPerRequest: 2, // 2 ZMW per request view
    });
  } catch (error) {
    console.error('Error fetching requests:', error);
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    );
  }
}
