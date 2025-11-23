import { db } from '@/lib/db';
import { agents, adminUsers } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const query = db.select().from(agents);
    const queryWithFilter = status && ['pending_review', 'approved', 'suspended', 'rejected'].includes(status)
      ? query.where(eq(agents.status, status as any))
      : query;

    const agentList = await queryWithFilter.orderBy(desc(agents.createdAt));

    return NextResponse.json(agentList);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}
