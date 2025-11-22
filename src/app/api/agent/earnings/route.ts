import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, and, gte } from 'drizzle-orm';
import * as schema from '@/db/schema';

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql as any, { schema });

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

    if (!agentId) {
      return Response.json({ error: 'Agent ID is required' }, { status: 400 });
    }

    const agentIdNum = parseInt(agentId);

    // Get total revenue from completed tickets
    const processedTickets = await db
      .select()
      .from(schema.agentProcessedTickets)
      .where(eq(schema.agentProcessedTickets.agentId, agentIdNum));

    // Get transaction history
    const transactions = await db
      .select()
      .from(schema.agentFloatTransactions)
      .where(eq(schema.agentFloatTransactions.agentId, agentIdNum));

    // Calculate metrics
    const completedTickets = processedTickets.length;
    const totalEarnings = transactions
      .filter(t => t.transactionType === 'usage' && t.status === 'completed')
      .reduce((sum, t) => {
        const amount = typeof t.amountZmw === 'string' ? parseFloat(t.amountZmw) : t.amountZmw;
        return sum + amount;
      }, 0);

    const totalSpent = transactions
      .filter(t => t.transactionType === 'purchase' && t.status === 'completed')
      .reduce((sum, t) => {
        const amount = typeof t.amountZmw === 'string' ? parseFloat(t.amountZmw) : t.amountZmw;
        return sum + amount;
      }, 0);

    // Get this month's earnings
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisMonthEarnings = transactions
      .filter(
        t =>
          t.transactionType === 'usage' &&
          t.status === 'completed' &&
          t.createdAt &&
          new Date(t.createdAt) >= monthStart
      )
      .reduce((sum, t) => {
        const amount = typeof t.amountZmw === 'string' ? parseFloat(t.amountZmw) : t.amountZmw;
        return sum + amount;
      }, 0);

    return Response.json({
      completedTickets,
      totalEarnings: parseFloat(totalEarnings.toFixed(2)),
      totalSpent: parseFloat(totalSpent.toFixed(2)),
      netEarnings: parseFloat((totalEarnings - totalSpent).toFixed(2)),
      thisMonthEarnings: parseFloat(thisMonthEarnings.toFixed(2)),
      averagePerTicket: completedTickets > 0 ? parseFloat((totalEarnings / completedTickets).toFixed(2)) : 0,
    });
  } catch (error) {
    console.error('Error fetching earnings:', error);
    return Response.json(
      { error: 'Failed to fetch earnings data' },
      { status: 500 }
    );
  }
}
