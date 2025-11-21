import { db } from '@/lib/db';
import { agents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

// Simulated PIN storage (in production, use secure hashing and database)
// This is imported from login route for consistency
const agentPINs = new Map<number, string>();

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agentId, phoneNumber, pin } = body;

    if (!agentId || !phoneNumber || !pin) {
      return NextResponse.json(
        { error: 'Agent ID, phone number, and PIN required' },
        { status: 400 }
      );
    }

    // Validate PIN format (4-6 digits)
    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        { error: 'PIN must be 4-6 digits' },
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

    // Verify agent exists and is approved
    const agentList = await db
      .select()
      .from(agents)
      .where(eq(agents.id, parsedAgentId));

    if (!agentList || agentList.length === 0) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    const agent = agentList[0];

    if (agent.phoneNumber !== phoneNumber) {
      return NextResponse.json(
        { error: 'Phone number does not match agent' },
        { status: 400 }
      );
    }

    if (agent.status !== 'approved') {
      return NextResponse.json(
        { error: 'Only approved agents can set PIN' },
        { status: 403 }
      );
    }

    // Store PIN in memory map
    agentPINs.set(parsedAgentId, pin);

    return NextResponse.json({
      message: 'PIN set successfully',
      agentId: parsedAgentId,
      phoneNumber: agent.phoneNumber,
      name: `${agent.firstName} ${agent.lastName}`,
      readyToLogin: true,
    });
  } catch (error) {
    console.error('Error setting PIN:', error);
    return NextResponse.json(
      { error: 'Failed to set PIN' },
      { status: 500 }
    );
  }
}

// Export agentPINs so login route can access it
export { agentPINs };
