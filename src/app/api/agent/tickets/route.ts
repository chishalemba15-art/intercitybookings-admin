import { db } from '@/lib/db';
import { agentProcessedTickets, buses, operators } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const status = searchParams.get('status'); // pending, verified, rejected, all
    const limit = parseInt(searchParams.get('limit') || '50');

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

    // Build query
    const conditions = status && ['pending', 'verified', 'rejected'].includes(status)
      ? and(
          eq(agentProcessedTickets.agentId, parsedAgentId),
          eq(agentProcessedTickets.receiptVerificationStatus, status as any)
        )
      : eq(agentProcessedTickets.agentId, parsedAgentId);

    const tickets = await db
      .select()
      .from(agentProcessedTickets)
      .where(conditions)
      .orderBy(desc(agentProcessedTickets.createdAt))
      .limit(limit);

    return NextResponse.json({
      agentId: parsedAgentId,
      tickets: tickets.map((t) => ({
        id: t.id,
        bookingReference: t.bookingReference,
        passengerName: t.passengerName,
        seatNumber: t.seatNumber,
        receiptImageUrl: t.receiptImageUrl,
        status: t.receiptVerificationStatus,
        userSmsSent: t.userSmsSent,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
      total: tickets.length,
    });
  } catch (error) {
    console.error('Error fetching processed tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch processed tickets' },
      { status: 500 }
    );
  }
}
