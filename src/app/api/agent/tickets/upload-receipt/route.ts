import { db } from '@/lib/db';
import { agentProcessedTickets, ticketRequests, buses, operators } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

function generateBookingReference(): string {
  const prefix = 'ICB';
  const date = new Date().toISOString().slice(2, 10).replace(/-/g, '');
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `${prefix}${date}${random}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      agentId,
      ticketRequestId,
      passengerName,
      seatNumber,
      busId,
      receiptImageUrl,
    } = body;

    if (!agentId || !ticketRequestId || !passengerName || !receiptImageUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const parsedAgentId = parseInt(agentId);
    const parsedRequestId = parseInt(ticketRequestId);
    const parsedBusId = busId ? parseInt(busId) : null;

    // Validate ticket request
    const ticketRequest = await db
      .select()
      .from(ticketRequests)
      .where(eq(ticketRequests.id, parsedRequestId))
      .limit(1);

    if (!ticketRequest || ticketRequest.length === 0) {
      return NextResponse.json(
        { error: 'Ticket request not found' },
        { status: 404 }
      );
    }

    const req = ticketRequest[0];

    // Verify agent claimed this request
    if (req.agentId !== parsedAgentId || req.status !== 'claimed_by_agent') {
      return NextResponse.json(
        { error: 'Agent did not claim this request' },
        { status: 403 }
      );
    }

    // Create booking reference
    const bookingReference = generateBookingReference();

    // Create processed ticket record
    // Insert processed ticket
    const processedTicket = await db
      .insert(agentProcessedTickets)
      .values({
        ticketRequestId: parsedRequestId,
        agentId: parsedAgentId,
        passengerName,
        seatNumber: seatNumber || null,
        busId: parsedBusId,
        bookingReference,
        receiptImageUrl,
        receiptVerificationStatus: 'pending', // Awaits admin review
        userSmsSent: false,
      })
      .returning();

    // Update ticket request status
    await db
      .update(ticketRequests)
      .set({
        status: 'completed',
        updatedAt: new Date(),
      })
      .where(eq(ticketRequests.id, parsedRequestId));

    const result = processedTicket[0];

    return NextResponse.json({
      message: 'Receipt uploaded successfully',
      processedTicketId: result.id,
      bookingReference: result.bookingReference,
      status: 'pending_verification',
      nextSteps: 'Your receipt is under review. You will receive SMS confirmation once verified.',
    });
  } catch (error) {
    console.error('Error uploading receipt:', error);
    return NextResponse.json(
      { error: 'Failed to upload receipt' },
      { status: 500 }
    );
  }
}
