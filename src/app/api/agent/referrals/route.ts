import { db } from '@/lib/db';
import { agentReferrals, agents, agentFloat } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { Decimal } from 'decimal.js';

const REFERRAL_BONUS = new Decimal(50); // 50 ZMW bonus for both referrer and referee

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

    // Get referrals made by this agent
    const referralsMade = await db
      .select()
      .from(agentReferrals)
      .where(eq(agentReferrals.referrerAgentId, parsedAgentId));

    // Get referrals received by this agent
    const referralsReceived = await db
      .select()
      .from(agentReferrals)
      .where(eq(agentReferrals.referredAgentId, parsedAgentId));

    // Calculate bonuses
    const bonusEarned = referralsMade
      .filter((r) => r.status === 'credited')
      .reduce((sum, r) => sum + parseFloat(r.bonusZmw.toString()), 0);

    return NextResponse.json({
      agentId: parsedAgentId,
      referralsMade: referralsMade.length,
      referralsReceived: referralsReceived.length,
      bonusEarned,
      referralCode: 'AG' + parsedAgentId.toString().padStart(6, '0'), // Example format
      details: {
        made: referralsMade,
        received: referralsReceived,
      },
    });
  } catch (error) {
    console.error('Error fetching referrals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch referrals' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { referrerAgentId, referralCode } = body;

    if (!referrerAgentId || !referralCode) {
      return NextResponse.json(
        { error: 'Referrer ID and referral code required' },
        { status: 400 }
      );
    }

    // Verify referrer exists
    const referrer = await db
      .select()
      .from(agents)
      .where(eq(agents.id, referrerAgentId))
      .limit(1);

    if (!referrer || referrer.length === 0) {
      return NextResponse.json(
        { error: 'Referrer not found' },
        { status: 404 }
      );
    }

    // Extract agent ID from referral code (format: AGXXXXXX)
    const referredAgentId = parseInt(referralCode.substring(2));

    if (isNaN(referredAgentId)) {
      return NextResponse.json(
        { error: 'Invalid referral code' },
        { status: 400 }
      );
    }

    // Verify referred agent exists and is approved
    const referredAgent = await db
      .select()
      .from(agents)
      .where(eq(agents.id, referredAgentId))
      .limit(1);

    if (!referredAgent || referredAgent.length === 0) {
      return NextResponse.json(
        { error: 'Referred agent not found' },
        { status: 404 }
      );
    }

    if (referredAgent[0].status !== 'approved') {
      return NextResponse.json(
        { error: 'Referred agent must be approved' },
        { status: 400 }
      );
    }

    // Check if referral already exists
    const existingReferral = await db
      .select()
      .from(agentReferrals)
      .where(
        and(
          eq(agentReferrals.referrerAgentId, referrerAgentId),
          eq(agentReferrals.referredAgentId, referredAgentId)
        )
      );

    if (existingReferral.length > 0) {
      return NextResponse.json(
        { error: 'Referral already recorded' },
        { status: 400 }
      );
    }

    // Create referral and add bonuses
    // Create referral record
    const referral = await db
      .insert(agentReferrals)
      .values({
        referrerAgentId,
        referredAgentId,
        bonusZmw: REFERRAL_BONUS.toString(),
        status: 'credited',
        creditedAt: new Date(),
      })
      .returning();

    // Add bonus to referrer's float
    const referrerFloat = await db
      .select()
      .from(agentFloat)
      .where(eq(agentFloat.agentId, referrerAgentId))
      .limit(1);

    if (referrerFloat && referrerFloat.length > 0) {
      const currentBalance = new Decimal(referrerFloat[0].currentBalance.toString());
      const newBalance = currentBalance.plus(REFERRAL_BONUS);

      await db
        .update(agentFloat)
        .set({
          currentBalance: newBalance.toString(),
          updatedAt: new Date(),
        })
        .where(eq(agentFloat.agentId, referrerAgentId));
    }

    // Add bonus to referred agent's float
    const referredFloat = await db
      .select()
      .from(agentFloat)
      .where(eq(agentFloat.agentId, referredAgentId))
      .limit(1);

    if (referredFloat && referredFloat.length > 0) {
      const currentBalance = new Decimal(referredFloat[0].currentBalance.toString());
      const newBalance = currentBalance.plus(REFERRAL_BONUS);

      await db
        .update(agentFloat)
        .set({
          currentBalance: newBalance.toString(),
          updatedAt: new Date(),
        })
        .where(eq(agentFloat.agentId, referredAgentId));
    }

    const result = referral[0];

    return NextResponse.json({
      message: 'Referral recorded successfully',
      referral: result,
      bonusAwarded: {
        referrer: `${REFERRAL_BONUS} ZMW`,
        referred: `${REFERRAL_BONUS} ZMW`,
      },
    });
  } catch (error) {
    console.error('Error creating referral:', error);
    return NextResponse.json(
      { error: 'Failed to create referral' },
      { status: 500 }
    );
  }
}
