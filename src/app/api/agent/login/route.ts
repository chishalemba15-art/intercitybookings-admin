import { db } from '@/lib/db';
import { agents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { phoneNumber, pin } = body;

    if (!phoneNumber || !pin) {
      return NextResponse.json(
        { error: 'Phone number and PIN required' },
        { status: 400 }
      );
    }

    // Validate PIN format (4 digits)
    if (!/^\d{4}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be exactly 4 digits' },
        { status: 400 }
      );
    }

    // Find agent by phone number
    const agentList = await db
      .select()
      .from(agents)
      .where(eq(agents.phoneNumber, phoneNumber));

    if (!agentList || agentList.length === 0) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const agent = agentList[0];

    // Check if agent is approved
    if (agent.status !== 'approved') {
      return NextResponse.json(
        {
          error: `Agent status is ${agent.status}. Only approved agents can login.`,
        },
        { status: 403 }
      );
    }

    // Check if agent has set a PIN
    if (!agent.pinHash) {
      return NextResponse.json(
        { error: 'Please set your PIN first' },
        { status: 403 }
      );
    }

    // Verify PIN using bcrypt
    const pinMatches = await bcrypt.compare(pin, agent.pinHash);

    if (!pinMatches) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      );
    }

    // Update last active timestamp
    await db
      .update(agents)
      .set({
        lastActiveAt: new Date(),
        isOnline: true,
      })
      .where(eq(agents.id, agent.id));

    console.log(`[LOGIN] Agent ${agent.id} logged in successfully`);

    // In production, create JWT or session token
    return NextResponse.json({
      message: 'Login successful',
      agent: {
        id: agent.id,
        phoneNumber: agent.phoneNumber,
        firstName: agent.firstName,
        lastName: agent.lastName,
        email: agent.email,
        locationCity: agent.locationCity,
        status: agent.status,
        agentType: agent.agentType,
        primaryOperatorId: agent.primaryOperatorId,
        isOnline: true,
      },
      token: `agent_${agent.id}_${Date.now()}`,
    });
  } catch (error) {
    console.error('Error logging in agent:', error);
    return NextResponse.json(
      { error: 'Failed to login' },
      { status: 500 }
    );
  }
}
