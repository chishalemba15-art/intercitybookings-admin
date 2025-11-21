import { db } from '@/lib/db';
import { agentProcessedTickets, ticketRequests } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const ticketId = parseInt(params.id);
    const body = await request.json();
    const { sendSMS } = body;

    if (isNaN(ticketId)) {
      return NextResponse.json(
        { error: 'Invalid ticket ID' },
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

    // Verify ticket
    // Update ticket verification status
    await db
      .update(agentProcessedTickets)
      .set({
        receiptVerificationStatus: 'verified',
        verifiedBy: 1, // Admin user ID - in production, get from session
        userSmsSent: sendSMS,
        userSmsSentAt: sendSMS ? new Date() : null,
        updatedAt: new Date(),
      })
      .where(eq(agentProcessedTickets.id, ticketId));

    // In production, send SMS to user here
    if (sendSMS) {
      const ticketDetail = ticket[0];
      console.log(`[SMS] Booking confirmed for user. Booking ref: ${ticketDetail.bookingReference}`);
    }

    return NextResponse.json({
      message: 'Ticket verified successfully',
      ticketId,
      smsSent: sendSMS,
    });
  } catch (error) {
    console.error('Error verifying ticket:', error);
    return NextResponse.json(
      { error: 'Failed to verify ticket' },
      { status: 500 }
    );
  }
}
