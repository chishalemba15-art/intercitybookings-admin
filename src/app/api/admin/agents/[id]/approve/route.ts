import { db } from '@/lib/db';
import { agents, agentFloat } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

const WELCOME_BONUS_ZMW = 50;
const REQUESTS_PER_10ZMW = 5;
const WELCOME_BONUS_REQUESTS = Math.floor((WELCOME_BONUS_ZMW / 10) * REQUESTS_PER_10ZMW);

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const agentId = parseInt(params.id);
    if (isNaN(agentId)) {
      return NextResponse.json(
        { error: 'Invalid agent ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { verificationNotes } = body;

    // Get agent
    const agent = await db
      .select()
      .from(agents)
      .where(eq(agents.id, agentId))
      .limit(1);

    if (!agent || agent.length === 0) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    if (agent[0].status !== 'pending_review') {
      return NextResponse.json(
        { error: 'Agent is not pending review' },
        { status: 400 }
      );
    }

    // Approve agent and create float account
    // Note: Neon HTTP driver doesn't support transactions, so we do sequential operations

    // Update agent status
    await db
      .update(agents)
      .set({
        status: 'approved',
        approvedAt: new Date(),
        approvedBy: 1, // Admin user ID - in production, get from session
        updatedAt: new Date(),
      })
      .where(eq(agents.id, agentId));

    // Check if float account already exists
    const existingFloat = await db
      .select()
      .from(agentFloat)
      .where(eq(agentFloat.agentId, agentId))
      .limit(1);

    if (existingFloat.length === 0) {
      // Create float account with welcome bonus
      await db.insert(agentFloat).values({
        agentId,
        currentBalance: WELCOME_BONUS_ZMW.toString(),
        dailyQuotaRemaining: WELCOME_BONUS_REQUESTS,
        dailyQuotaLimit: WELCOME_BONUS_REQUESTS,
        lastQuotaReset: new Date(),
      });
    } else {
      // Update existing float account (add welcome bonus if not already added)
      const existingBalance = parseFloat(existingFloat[0].currentBalance.toString());
      if (existingBalance === 0) {
        await db
          .update(agentFloat)
          .set({
            currentBalance: WELCOME_BONUS_ZMW.toString(),
            dailyQuotaRemaining: WELCOME_BONUS_REQUESTS,
            dailyQuotaLimit: WELCOME_BONUS_REQUESTS,
            lastQuotaReset: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(agentFloat.agentId, agentId));
      }
    }

    return NextResponse.json({
      message: 'Agent approved successfully',
      welcomeBonus: {
        amount: WELCOME_BONUS_ZMW,
        requests: WELCOME_BONUS_REQUESTS,
      },
    });
  } catch (error) {
    console.error('Error approving agent:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Full error:', errorMessage);
    return NextResponse.json(
      { error: 'Failed to approve agent', details: errorMessage },
      { status: 500 }
    );
  }
}
