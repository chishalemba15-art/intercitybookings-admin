import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, desc, limit } from 'drizzle-orm';
import * as schema from '@/db/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const limitParam = parseInt(searchParams.get('limit') || '10');

    if (!agentId) {
      return Response.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const agentIdNum = parseInt(agentId);

    // Get recent transactions
    const recentTransactions = await db
      .select()
      .from(schema.agentFloatTransactions)
      .where(eq(schema.agentFloatTransactions.agentId, agentIdNum))
      .orderBy(desc(schema.agentFloatTransactions.createdAt))
      .limit(limitParam);

    // Get recent processed tickets
    const recentTickets = await db
      .select()
      .from(schema.agentProcessedTickets)
      .where(eq(schema.agentProcessedTickets.agentId, agentIdNum))
      .orderBy(desc(schema.agentProcessedTickets.createdAt))
      .limit(limitParam);

    // Format activity feed
    const activities = [
      ...recentTransactions.map(t => ({
        id: `trans-${t.id}`,
        type: 'transaction' as const,
        title: t.transactionType === 'purchase' ? 'Float Purchase' : 'Float Used',
        description: `${t.transactionType === 'purchase' ? 'Purchased' : 'Used'} ${Math.abs(parseFloat(t.amountZmw as unknown as string))} ZMW`,
        amount: t.amountZmw,
        date: t.createdAt,
        icon: t.transactionType === 'purchase' ? '💳' : '📊',
      })),
      ...recentTickets.map(t => ({
        id: `ticket-${t.id}`,
        type: 'ticket' as const,
        title: 'Ticket Processed',
        description: `${t.passengerName} - ${t.bookingReference}`,
        date: t.createdAt,
        icon: '🎫',
      })),
    ]
      .sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, limitParam);

    return Response.json({ activities });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return Response.json(
      { error: 'Failed to fetch activity data' },
      { status: 500 }
    );
  }
}
