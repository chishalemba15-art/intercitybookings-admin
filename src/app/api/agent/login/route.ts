import { db } from '@/lib/db';
import { agents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { agentPINs } from '@/lib/agent-pins';

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

    // Verify PIN (in production, use bcrypt)
    const storedPIN = agentPINs.get(agent.id);
    if (!storedPIN || storedPIN !== pin) {
      return NextResponse.json(
        { error: 'Invalid PIN' },
        { status: 401 }
      );
    }

    // In production, create JWT or session token
    return NextResponse.json({
      message: 'Login successful',
      agent: {
        id: agent.id,
        phoneNumber: agent.phoneNumber,
        firstName: agent.firstName,
        lastName: agent.lastName,
        locationCity: agent.locationCity,
        status: agent.status,
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
