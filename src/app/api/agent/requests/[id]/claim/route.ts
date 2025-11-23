import { db } from '@/lib/db';
import { ticketRequests, agentFloat, agentFloatTransactions, agentDailyQuotaLogs } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { Decimal } from 'decimal.js';

const COST_PER_REQUEST = 2; // 2 ZMW to claim request

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestId = parseInt(params.id);
    const body = await request.json();
    const { agentId } = body;

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

    // Validate request is still available
    if (req.status !== 'open') {
      return NextResponse.json(
        { error: 'This request has already been claimed' },
        { status: 410 }
      );
    }

    if (req.requestExpiresAt && new Date(req.requestExpiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'This request has expired' },
        { status: 410 }
      );
    }

    // Process claim
    // Get current float
    const floatAccount = await db
      .select()
      .from(agentFloat)
      .where(eq(agentFloat.agentId, parsedAgentId))
      .limit(1);

    if (!floatAccount || floatAccount.length === 0) {
      throw new Error('Float account not found');
    }

    const account = floatAccount[0];
    const balance = new Decimal(account.currentBalance?.toString() || '0');

    if (balance.lessThan(COST_PER_REQUEST)) {
      throw new Error('Insufficient float balance');
    }

    if ((account.dailyQuotaRemaining || 0) <= 0) {
      throw new Error('Daily quota exhausted');
    }

    const newBalance = balance.minus(COST_PER_REQUEST);

    // Update agent float
    await db
      .update(agentFloat)
      .set({
        currentBalance: newBalance.toString(),
        dailyQuotaRemaining: (account.dailyQuotaRemaining || 0) - 1,
        updatedAt: new Date(),
      })
      .where(eq(agentFloat.agentId, parsedAgentId));

    // Record float usage transaction
    await db.insert(agentFloatTransactions).values({
      agentId: parsedAgentId,
      transactionType: 'usage',
      amountZmw: new Decimal(COST_PER_REQUEST).toString(),
      requestsAllocated: 1,
      status: 'completed',
      notes: `Claimed request #${requestId}`,
    });

    // Update ticket request status
    await db
      .update(ticketRequests)
      .set({
        status: 'claimed_by_agent',
        agentId: parsedAgentId,
        agentClaimedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(ticketRequests.id, requestId));

    // Log daily quota usage
    const today = new Date().toISOString().split('T')[0];
    await db.insert(agentDailyQuotaLogs).values({
      agentId: parsedAgentId,
      date: today,
      requestsViewed: 1,
      quotaLimit: account.dailyQuotaLimit,
      floatBalanceOnDate: newBalance.toString(),
    });

    const result = {
      newBalance: newBalance.toString(),
      quotaRemaining: (account.dailyQuotaRemaining || 0) - 1,
    };

    return NextResponse.json({
      message: 'Request claimed successfully',
      requestId,
      contactPhone: req.contactPhone,
      contactEmail: req.contactEmail,
      passengerNames: req.passengerNames ? JSON.parse(req.passengerNames) : [],
      fromCity: req.fromCity,
      toCity: req.toCity,
      travelDate: req.travelDate,
      passengerCount: req.passengerCount,
      newBalance: result.newBalance,
      quotaRemaining: result.quotaRemaining,
      nextSteps: 'Contact the customer via WhatsApp to discuss bus options and complete the booking.',
    });
  } catch (error) {
    console.error('Error claiming request:', error);
    const message = error instanceof Error ? error.message : 'Failed to claim request';
    return NextResponse.json(
      { error: message },
      { status: 400 }
    );
  }
}
