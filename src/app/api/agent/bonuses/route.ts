import { db } from '@/lib/db';
import { agentBonuses, agentFloat } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { Decimal } from 'decimal.js';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const unclaimed = searchParams.get('unclaimed') === 'true';

    if (!agentId) {
      return NextResponse.json(
        { error: 'Agent ID required' },
        { status: 400 }
      );
    }

    const parsedAgentId = parseInt(agentId);

    const conditions = unclaimed
      ? and(
          eq(agentBonuses.agentId, parsedAgentId),
          eq(agentBonuses.claimed, false)
        )
      : eq(agentBonuses.agentId, parsedAgentId);

    const bonuses = await db
      .select()
      .from(agentBonuses)
      .where(conditions);

    // Calculate total unclaimed bonus
    const totalUnclaimed = bonuses
      .filter((b) => !b.claimed)
      .reduce((sum, b) => sum + parseFloat(b.bonusAmountZmw.toString()), 0);

    return NextResponse.json({
      agentId: parsedAgentId,
      bonuses: bonuses.map((b) => ({
        id: b.id,
        type: b.bonusType,
        amount: parseFloat(b.bonusAmountZmw.toString()),
        description: b.description,
        expiresAt: b.expiresAt,
        claimed: b.claimed,
        claimedAt: b.claimedAt,
        createdAt: b.createdAt,
      })),
      totalUnclaimed,
    });
  } catch (error) {
    console.error('Error fetching bonuses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bonuses' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, bonusId } = body;

    if (!agentId || !bonusId) {
      return NextResponse.json(
        { error: 'Agent ID and bonus ID required' },
        { status: 400 }
      );
    }

    const parsedAgentId = parseInt(agentId);
    const parsedBonusId = parseInt(bonusId);

    // Get bonus
    const bonus = await db
      .select()
      .from(agentBonuses)
      .where(eq(agentBonuses.id, parsedBonusId))
      .limit(1);

    if (!bonus || bonus.length === 0) {
      return NextResponse.json(
        { error: 'Bonus not found' },
        { status: 404 }
      );
    }

    const bonusData = bonus[0];

    if (bonusData.agentId !== parsedAgentId) {
      return NextResponse.json(
        { error: 'Bonus does not belong to this agent' },
        { status: 403 }
      );
    }

    if (bonusData.claimed) {
      return NextResponse.json(
        { error: 'Bonus already claimed' },
        { status: 400 }
      );
    }

    if (bonusData.expiresAt && new Date(bonusData.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'Bonus has expired' },
        { status: 410 }
      );
    }

    // Claim bonus
    // Mark bonus as claimed
    const claimed = await db
      .update(agentBonuses)
      .set({
        claimed: true,
        claimedAt: new Date(),
      })
      .where(eq(agentBonuses.id, parsedBonusId))
      .returning();

    // Add to float balance
    const floatAccount = await db
      .select()
      .from(agentFloat)
      .where(eq(agentFloat.agentId, parsedAgentId))
      .limit(1);

    if (floatAccount && floatAccount.length > 0) {
      const currentBalance = new Decimal(floatAccount[0].currentBalance?.toString() || '0');
      const bonusAmount = new Decimal(bonusData.bonusAmountZmw?.toString() || '0');
      const newBalance = currentBalance.plus(bonusAmount);

      await db
        .update(agentFloat)
        .set({
          currentBalance: newBalance.toString(),
          updatedAt: new Date(),
        })
        .where(eq(agentFloat.agentId, parsedAgentId));
    }

    const result = claimed[0];

    return NextResponse.json({
      message: 'Bonus claimed successfully',
      bonusId: parsedBonusId,
      amount: parseFloat(bonusData.bonusAmountZmw.toString()),
      message2: 'Float has been added to your account',
    });
  } catch (error) {
    console.error('Error claiming bonus:', error);
    return NextResponse.json(
      { error: 'Failed to claim bonus' },
      { status: 500 }
    );
  }
}
