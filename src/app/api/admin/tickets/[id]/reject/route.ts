import { db } from '@/lib/db';
import { agentProcessedTickets } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = parseInt(params.id);
    const body = await request.json();
    const { reason } = body;

    if (isNaN(ticketId)) {
      return NextResponse.json(
        { error: 'Invalid ticket ID' },
        { status: 400 }
      );
    }

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason required' },
        { status: 400 }
      );
    }

    // Get ticket
    const ticket = await db
      .select()
      .from(agentProcessedTickets)
      .where(eq(agentProcessedTickets.id, ticketId))
      .limit(1);

    if (!ticket || ticket.length === 0) {
      return NextResponse.json(
        { error: 'Ticket not found' },
        { status: 404 }
      );
    }

    // Reject ticket
    await db
      .update(agentProcessedTickets)
      .set({
        receiptVerificationStatus: 'rejected',
        notesToUser: reason,
        verifiedBy: 1, // Admin user ID - in production, get from session
        updatedAt: new Date(),
      })
      .where(eq(agentProcessedTickets.id, ticketId));

    // In production, send SMS to agent and user explaining rejection
    console.log(`[SMS] Receipt rejected. Reason: ${reason}`);

    return NextResponse.json({
      message: 'Ticket rejected',
      ticketId,
      reason,
    });
  } catch (error) {
    console.error('Error rejecting ticket:', error);
    return NextResponse.json(
      { error: 'Failed to reject ticket' },
      { status: 500 }
    );
  }
}
