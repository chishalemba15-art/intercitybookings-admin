import { db } from '@/lib/db';
import { ticketRequests, agentFloat } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { Decimal } from 'decimal.js';

const COST_PER_REQUEST = 2; // 2 ZMW to view full details

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId || isNaN(requestId)) {
      return NextResponse.json(
        { error: 'Invalid request or agent ID' },
        { status: 400 }
      );
    }

    const parsedAgentId = parseInt(agentId);

    // Get ticket request
    const ticketRequest = await db
      .select()
      .from(ticketRequests)
      .where(eq(ticketRequests.id, requestId))
      .limit(1);

    if (!ticketRequest || ticketRequest.length === 0) {
      return NextResponse.json(
        { error: 'Request not found' },
        { status: 404 }
      );
    }

    const req = ticketRequest[0];

    // Check if request is still open
    if (req.status !== 'open' || (req.requestExpiresAt && new Date(req.requestExpiresAt) < new Date())) {
      return NextResponse.json(
        { error: 'This request is no longer available' },
        { status: 410 }
      );
    }

    // Check agent's float
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
    const balance = new Decimal(account.currentBalance.toString());

    if (balance.lessThan(COST_PER_REQUEST) || account.dailyQuotaRemaining <= 0) {
      return NextResponse.json(
        {
          error: 'Insufficient float or daily quota',
          balance: balance.toNumber(),
          quotaRemaining: account.dailyQuotaRemaining,
          costPerRequest: COST_PER_REQUEST,
        },
        { status: 402 }
      );
    }

    // Deduct float cost (transaction will happen when claiming)
    return NextResponse.json({
      id: req.id,
      fromCity: req.fromCity,
      toCity: req.toCity,
      travelDate: req.travelDate,
      passengerCount: req.passengerCount,
      passengerNames: req.passengerNames ? JSON.parse(req.passengerNames) : [],
      contactPhone: req.contactPhone, // Now visible after deducting float
      contactEmail: req.contactEmail,
      preferredOperator: req.preferredOperator,
      status: req.status,
      createdAt: req.createdAt,
      expiresAt: req.requestExpiresAt,
      costPerRequest: COST_PER_REQUEST,
      message: 'You can now view full contact details. Click "Claim Request" to proceed.',
    });
  } catch (error) {
    console.error('Error fetching request details:', error);
    return NextResponse.json(
      { error: 'Failed to fetch request details' },
      { status: 500 }
    );
  }
}
