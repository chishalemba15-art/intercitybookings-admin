import { db } from '@/lib/db';
import { agents } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

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
    const { suspensionReason } = body;

    if (!suspensionReason || !suspensionReason.trim()) {
      return NextResponse.json(
        { error: 'Suspension reason is required' },
        { status: 400 }
      );
    }

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

    if (agent[0].status !== 'approved') {
      return NextResponse.json(
        { error: 'Only approved agents can be suspended' },
        { status: 400 }
      );
    }

    // Suspend agent
    await db
      .update(agents)
      .set({
        status: 'suspended',
        suspendedAt: new Date(),
        suspensionReason,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, agentId));

    return NextResponse.json({
      message: 'Agent suspended successfully',
    });
  } catch (error) {
    console.error('Error suspending agent:', error);
    return NextResponse.json(
      { error: 'Failed to suspend agent' },
      { status: 500 }
    );
  }
}
