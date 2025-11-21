import { db } from '@/lib/db';
import { agentFloatTransactions } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
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

    // Get transaction history
    const transactions = await db
      .select()
      .from(agentFloatTransactions)
      .where(eq(agentFloatTransactions.agentId, parsedAgentId))
      .orderBy(desc(agentFloatTransactions.createdAt))
      .limit(limit);

    return NextResponse.json({
      agentId: parsedAgentId,
      transactions: transactions.map((t) => ({
        id: t.id,
        type: t.transactionType,
        amount: parseFloat(t.amountZmw.toString()),
        requestsAllocated: t.requestsAllocated,
        paymentMethod: t.paymentMethod,
        paymentReference: t.paymentReference,
        status: t.status,
        notes: t.notes,
        createdAt: t.createdAt,
      })),
      total: transactions.length,
    });
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch transaction history' },
      { status: 500 }
    );
  }
}
