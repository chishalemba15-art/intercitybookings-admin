import { db } from '@/lib/db';
import { agentFloat, agents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

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
    if (isNaN(parsedAgentId)) {
      return NextResponse.json(
        { error: 'Invalid agent ID' },
        { status: 400 }
      );
    }

    // Get agent float account
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

    // Check if daily quota needs reset
    const today = new Date().toISOString().split('T')[0];
    const lastResetDate = account.lastQuotaReset
      ? new Date(account.lastQuotaReset).toISOString().split('T')[0]
      : null;

    let quotaRemaining = account.dailyQuotaRemaining;
    let lastQuotaReset = account.lastQuotaReset;

    // Reset daily quota if it's a new day
    if (lastResetDate !== today) {
      quotaRemaining = account.dailyQuotaLimit;
      lastQuotaReset = new Date();

      // Update in database
      await db
        .update(agentFloat)
        .set({
          dailyQuotaRemaining: quotaRemaining,
          lastQuotaReset,
          updatedAt: new Date(),
        })
        .where(eq(agentFloat.agentId, parsedAgentId));
    }

    return NextResponse.json({
      agentId: parsedAgentId,
      currentBalance: parseFloat(account.currentBalance.toString()),
      dailyQuotaRemaining: quotaRemaining,
      dailyQuotaLimit: account.dailyQuotaLimit,
      lastQuotaReset,
      requestsPerZMW: 0.5, // 10 ZMW = 5 requests
    });
  } catch (error) {
    console.error('Error fetching float balance:', error);
    return NextResponse.json(
      { error: 'Failed to fetch float balance' },
      { status: 500 }
    );
  }
}
