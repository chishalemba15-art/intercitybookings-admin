import { db } from '@/lib/db';
import { agents, agentFloat, agentFloatTransactions } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { Decimal } from 'decimal.js';

const REQUESTS_PER_10ZMW = 5;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, amountZmw, paymentMethod, paymentReference } = body;

    if (!agentId || !amountZmw || !paymentMethod) {
      return NextResponse.json(
        { error: 'Agent ID, amount, and payment method required' },
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

    const amount = new Decimal(amountZmw);
    if (amount.lessThan(10)) {
      return NextResponse.json(
        { error: 'Minimum purchase is 10 ZMW' },
        { status: 400 }
      );
    }

    // Verify agent exists
    const agent = await db
      .select()
      .from(agents)
      .where(eq(agents.id, parsedAgentId))
      .limit(1);

    if (!agent || agent.length === 0) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent[0].status !== 'approved') {
      return NextResponse.json(
        { error: 'Only approved agents can purchase float' },
        { status: 403 }
      );
    }

    // Calculate requests allocated
    const requestsAllocated = Math.floor(amount.toNumber() * REQUESTS_PER_10ZMW / 10);

    // Get current float account
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

    const currentBalance = new Decimal(floatAccount[0].currentBalance.toString());
    const newBalance = currentBalance.plus(amount);

    // Update balance
    await db
      .update(agentFloat)
      .set({
        currentBalance: newBalance.toString(),
        dailyQuotaRemaining: floatAccount[0].dailyQuotaRemaining + requestsAllocated,
        dailyQuotaLimit: floatAccount[0].dailyQuotaLimit + requestsAllocated,
        updatedAt: new Date(),
      })
      .where(eq(agentFloat.agentId, parsedAgentId));

    // Create transaction record
    const transaction = await db
      .insert(agentFloatTransactions)
      .values({
        agentId: parsedAgentId,
        transactionType: 'purchase',
        amountZmw: amount.toString(),
        requestsAllocated,
        paymentMethod: paymentMethod as any,
        paymentReference: paymentReference || null,
        status: 'pending', // Pending until payment provider confirms
        notes: `Purchase of ${amount} ZMW for ${requestsAllocated} requests`,
      })
      .returning();

    const result = {
      transaction: transaction[0],
      newBalance: newBalance.toString(),
      requestsAllocated,
    };

    // In production, queue SMS notification and integrate with payment provider
    console.log(`Float purchase initiated for agent ${parsedAgentId}: ${amountZmw} ZMW`);

    return NextResponse.json({
      message: 'Float purchase initiated',
      transactionId: result.transaction.id,
      amountZmw: result.transaction.amountZmw,
      requestsAllocated: result.requestsAllocated,
      newBalance: result.newBalance,
      status: 'pending',
      nextSteps: 'Send payment to +260773962307 via Airtel Money or MTN Mobile Money. Payment will be confirmed within minutes.',
    });
  } catch (error) {
    console.error('Error purchasing float:', error);
    return NextResponse.json(
      { error: 'Failed to purchase float' },
      { status: 500 }
    );
  }
}
