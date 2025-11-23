import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentLifts } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID required' },
        { status: 400 }
      );
    }

    const parsedAgentId = parseInt(agentId);

    // Get or create lifts account
    let liftsAccount = await db
      .select()
      .from(agentLifts)
      .where(eq(agentLifts.agentId, parsedAgentId))
      .limit(1);

    if (!liftsAccount || liftsAccount.length === 0) {
      // Create new lifts account with 0 balance
      const [newAccount] = await db
        .insert(agentLifts)
        .values({
          agentId: parsedAgentId,
          currentBalance: 0,
          totalPurchased: 0,
          totalUsed: 0,
        })
        .returning();

      liftsAccount = [newAccount];
    }

    return NextResponse.json({
      agentId: parsedAgentId,
      balance: liftsAccount[0].currentBalance,
      totalPurchased: liftsAccount[0].totalPurchased,
      totalUsed: liftsAccount[0].totalUsed,
      lastPurchaseAt: liftsAccount[0].lastPurchaseAt,
    });
  } catch (error) {
    console.error('Error fetching lifts balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch lifts balance' },
      { status: 500 }
    );
  }
}
