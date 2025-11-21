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

    if (agent[0].status !== 'suspended') {
      return NextResponse.json(
        { error: 'Only suspended agents can be reactivated' },
        { status: 400 }
      );
    }

    // Reactivate agent
    await db
      .update(agents)
      .set({
        status: 'approved',
        suspendedAt: null,
        suspensionReason: null,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, agentId));

    return NextResponse.json({
      message: 'Agent reactivated successfully',
    });
  } catch (error) {
    console.error('Error reactivating agent:', error);
    return NextResponse.json(
      { error: 'Failed to reactivate agent' },
      { status: 500 }
    );
  }
}
