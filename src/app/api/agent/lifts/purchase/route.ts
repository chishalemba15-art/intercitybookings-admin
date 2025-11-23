import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { agentLifts, liftsTransactions, agents, agentFloat } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { settingsService } from '@/lib/settings';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, purchaseType, paymentMethod, paymentReference } = body;

    if (!agentId || !purchaseType) {
      return NextResponse.json(
        { error: 'Agent ID and purchase type required' },
        { status: 400 }
      );
    }

    const parsedAgentId = parseInt(agentId);

    // Verify agent exists
    const agentData = await db
      .select()
      .from(agents)
      .where(eq(agents.id, parsedAgentId))
      .limit(1);

    if (!agentData || agentData.length === 0) {
      return NextResponse.json({ error: 'Agent not found' }, { status: 404 });
    }

    const agent = agentData[0];

    // Check if independent agent has sufficient float
    if (agent.agentType === 'independent') {
      const minFloat = await settingsService.getSetting('minFloatForIndependentAgent');

      const floatData = await db
        .select()
        .from(agentFloat)
        .where(eq(agentFloat.agentId, parsedAgentId))
        .limit(1);

      if (floatData.length === 0 || Number(floatData[0].currentBalance) < minFloat) {
        return NextResponse.json(
          {
            error: `Independent agents need minimum ${minFloat} ZMW float to purchase lifts`,
          },
          { status: 403 }
        );
      }
    }

    // Get pricing based on purchase type
    const pricing: Record<string, { lifts: number; price: number }> = {
      daily: {
        lifts: await settingsService.getSetting('liftsDailyAmount'),
        price: await settingsService.getSetting('liftsDailyPrice'),
      },
      weekly: {
        lifts: await settingsService.getSetting('liftsWeeklyAmount'),
        price: await settingsService.getSetting('liftsWeeklyPrice'),
      },
      monthly: {
        lifts: await settingsService.getSetting('liftsMonthlyAmount'),
        price: await settingsService.getSetting('liftsMonthlyPrice'),
      },
    };

    const selectedPlan = pricing[purchaseType];
    if (!selectedPlan) {
      return NextResponse.json(
        { error: 'Invalid purchase type' },
        { status: 400 }
      );
    }

    // Calculate expiry date
    const expiresAt = new Date();
    if (purchaseType === 'daily') {
      expiresAt.setDate(expiresAt.getDate() + 1);
    } else if (purchaseType === 'weekly') {
      expiresAt.setDate(expiresAt.getDate() + 7);
    } else if (purchaseType === 'monthly') {
      expiresAt.setMonth(expiresAt.getMonth() + 1);
    }

    // Create lifts transaction
    const [transaction] = await db
      .insert(liftsTransactions)
      .values({
        agentId: parsedAgentId,
        purchaseType,
        liftsAmount: selectedPlan.lifts,
        priceZmw: selectedPlan.price.toString(),
        paymentMethod: paymentMethod || 'airtel_money',
        paymentReference: paymentReference || `LIFT_${Date.now()}`,
        status: 'completed', // In production, this would be 'pending' until payment confirmed
        expiresAt,
      })
      .returning();

    // Get or create lifts account
    const existingAccount = await db
      .select()
      .from(agentLifts)
      .where(eq(agentLifts.agentId, parsedAgentId))
      .limit(1);

    if (existingAccount.length > 0) {
      // Update existing account
      await db
        .update(agentLifts)
        .set({
          currentBalance: Number(existingAccount[0].currentBalance) + selectedPlan.lifts,
          totalPurchased: Number(existingAccount[0].totalPurchased) + selectedPlan.lifts,
          lastPurchaseAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(agentLifts.agentId, parsedAgentId));
    } else {
      // Create new account
      await db.insert(agentLifts).values({
        agentId: parsedAgentId,
        currentBalance: selectedPlan.lifts,
        totalPurchased: selectedPlan.lifts,
        totalUsed: 0,
        lastPurchaseAt: new Date(),
      });
    }

    console.log(
      `[LIFTS] Agent ${parsedAgentId} purchased ${selectedPlan.lifts} lifts (${purchaseType})`
    );

    return NextResponse.json({
      message: 'Lifts purchased successfully',
      transaction: {
        id: transaction.id,
        lifts: selectedPlan.lifts,
        price: selectedPlan.price,
        purchaseType,
        expiresAt,
      },
    });
  } catch (error) {
    console.error('Error purchasing lifts:', error);
    return NextResponse.json(
      { error: 'Failed to purchase lifts' },
      { status: 500 }
    );
  }
}
