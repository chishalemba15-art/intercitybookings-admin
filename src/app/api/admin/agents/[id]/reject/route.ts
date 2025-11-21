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
    const { rejectionReason } = body;

    if (!rejectionReason || !rejectionReason.trim()) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
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

    if (agent[0].status !== 'pending_review') {
      return NextResponse.json(
        { error: 'Agent is not pending review' },
        { status: 400 }
      );
    }

    // Reject agent
    await db
      .update(agents)
      .set({
        status: 'rejected',
        rejectionReason,
        updatedAt: new Date(),
      })
      .where(eq(agents.id, agentId));

    return NextResponse.json({
      message: 'Agent application rejected',
    });
  } catch (error) {
    console.error('Error rejecting agent:', error);
    return NextResponse.json(
      { error: 'Failed to reject agent' },
      { status: 500 }
    );
  }
}
