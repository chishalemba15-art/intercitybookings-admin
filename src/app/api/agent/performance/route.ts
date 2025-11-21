import { db } from '@/lib/db';
import { agentPerformanceTiers, agentProcessedTickets, agents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { Decimal } from 'decimal.js';

// Tier configuration
const TIERS = {
  bronze: {
    label: 'Bronze',
    minRequests: 0,
    costPerRequest: new Decimal(2),
    bonusPercentage: 0,
    color: 'bg-amber-600',
    benefits: ['Access to booking requests', 'Real-time notifications'],
  },
  silver: {
    label: 'Silver',
    minRequests: 50,
    costPerRequest: new Decimal(1.5),
    bonusPercentage: 10,
    color: 'bg-gray-400',
    benefits: ['25% lower request cost', '10% float bonus on purchases', 'Priority support'],
  },
  gold: {
    label: 'Gold',
    minRequests: 200,
    costPerRequest: new Decimal(1),
    bonusPercentage: 20,
    color: 'bg-yellow-500',
    benefits: ['50% lower request cost', '20% float bonus on purchases', 'Dedicated account manager'],
  },
  platinum: {
    label: 'Platinum',
    minRequests: 500,
    costPerRequest: new Decimal(0.5),
    bonusPercentage: 30,
    color: 'bg-blue-300',
    benefits: ['75% lower request cost', '30% float bonus', 'Custom commission rates'],
  },
};

function calculateTier(requestsCompleted: number): keyof typeof TIERS {
  if (requestsCompleted >= 500) return 'platinum';
  if (requestsCompleted >= 200) return 'gold';
  if (requestsCompleted >= 50) return 'silver';
  return 'bronze';
}

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

    // Get or create performance tier
    let tier = await db
      .select()
      .from(agentPerformanceTiers)
      .where(eq(agentPerformanceTiers.agentId, parsedAgentId))
      .limit(1);

    if (!tier || tier.length === 0) {
      // Create initial tier for new agent
      const created = await db
        .insert(agentPerformanceTiers)
        .values({
          agentId: parsedAgentId,
          tier: 'bronze',
          totalRequestsCompleted: 0,
          totalRevenue: '0',
          costPerRequest: '2',
          bonusPercentage: 0,
        })
        .returning();

      tier = created;
    }

    const tierData = tier[0];
    const tierConfig = TIERS[tierData.tier as keyof typeof TIERS];

    return NextResponse.json({
      agentId: parsedAgentId,
      currentTier: tierData.tier,
      tierLabel: tierConfig.label,
      totalRequestsCompleted: tierData.totalRequestsCompleted,
      totalRevenue: parseFloat(tierData.totalRevenue.toString()),
      costPerRequest: parseFloat(tierData.costPerRequest.toString()),
      bonusPercentage: tierData.bonusPercentage,
      tiers: Object.entries(TIERS).map(([key, config]) => ({
        tier: key,
        label: config.label,
        minRequests: config.minRequests,
        costPerRequest: config.costPerRequest.toString(),
        bonusPercentage: config.bonusPercentage,
        benefits: config.benefits,
        unlocked: tierData.totalRequestsCompleted >= config.minRequests,
      })),
      nextTierIn: (() => {
        const nextTier = Object.entries(TIERS).find(
          ([_, config]) =>
            config.minRequests > tierData.totalRequestsCompleted &&
            config.minRequests >= TIERS[tierData.tier as keyof typeof TIERS].minRequests
        );
        return nextTier
          ? {
              tier: nextTier[0],
              requestsNeeded: nextTier[1].minRequests - tierData.totalRequestsCompleted,
            }
          : null;
      })(),
    });
  } catch (error) {
    console.error('Error fetching performance tier:', error);
    return NextResponse.json(
      { error: 'Failed to fetch performance tier' },
      { status: 500 }
    );
  }
}
