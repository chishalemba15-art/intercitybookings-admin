import { db } from '@/lib/db';
import { agentProcessedTickets, agents, ticketRequests } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status'); // pending, verified, rejected

    const query = db
      .select()
      .from(agentProcessedTickets);

    const queryWithFilter = status && ['pending', 'verified', 'rejected'].includes(status)
      ? query.where(eq(agentProcessedTickets.receiptVerificationStatus, status as any))
      : query;

    const tickets = await queryWithFilter
      .orderBy(desc(agentProcessedTickets.createdAt));

    // Enrich with agent names and request details
    const enrichedTickets = await Promise.all(
      tickets.map(async (ticket) => {
        const agent = await db
          .select()
          .from(agents)
          .where(eq(agents.id, ticket.agentId))
          .limit(1);

        const request = await db
          .select()
          .from(ticketRequests)
          .where(eq(ticketRequests.id, ticket.ticketRequestId))
          .limit(1);

        return {
          ...ticket,
          agentName: agent?.[0] ? `${agent[0].firstName} ${agent[0].lastName}` : 'Unknown',
          requestDetails: request?.[0] || null,
        };
      })
    );

    return NextResponse.json(enrichedTickets);
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    );
  }
}
