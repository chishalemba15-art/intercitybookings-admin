import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { bookings, buses, searchAnalytics, routes } from '@/db/schema';
import { count, desc, eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get total bookings (last 30 days)
    const [{ totalBookings }] = await db
      .select({ totalBookings: count() })
      .from(bookings)
      .where(sql`${bookings.createdAt} >= NOW() - INTERVAL '30 days'`);

    // Get total revenue (last 30 days)
    const [{ totalRevenue }] = await db
      .select({
        totalRevenue: sql<number>`COALESCE(SUM(CAST(${bookings.totalAmount} AS NUMERIC)), 0)`,
      })
      .from(bookings)
      .where(sql`${bookings.createdAt} >= NOW() - INTERVAL '30 days'`);

    // Get active users (unique phone numbers)
    const [{ activeUsers }] = await db
      .select({
        activeUsers: sql<number>`COUNT(DISTINCT ${bookings.passengerPhone})`,
      })
      .from(bookings);

    // Get total buses
    const [{ totalBuses }] = await db
      .select({ totalBuses: count() })
      .from(buses)
      .where(eq(buses.isActive, true));

    // Get recent bookings
    const recentBookings = await db
      .select({
        id: bookings.id,
        passengerName: bookings.passengerName,
        destination: routes.toCity,
        amount: bookings.totalAmount,
        createdAt: bookings.createdAt,
      })
      .from(bookings)
      .innerJoin(buses, eq(bookings.busId, buses.id))
      .innerJoin(routes, eq(buses.routeId, routes.id))
      .orderBy(desc(bookings.createdAt))
      .limit(5);

    // Get popular routes
    const popularRoutes = await db
      .select({
        destination: searchAnalytics.destination,
        count: count(),
      })
      .from(searchAnalytics)
      .where(sql`${searchAnalytics.destination} IS NOT NULL`)
      .groupBy(searchAnalytics.destination)
      .orderBy(desc(count()))
      .limit(5);

    return NextResponse.json({
      totalBookings: totalBookings || 0,
      totalRevenue: Number(totalRevenue) || 0,
      activeUsers: Number(activeUsers) || 0,
      totalBuses: totalBuses || 0,
      recentBookings,
      popularRoutes,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
