import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { searchAnalytics, bookings, buses, routes } from '@/db/schema';
import { count, desc, eq, sql } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get search analytics by destination
    const searchData = await db
      .select({
        destination: searchAnalytics.destination,
        count: count(),
      })
      .from(searchAnalytics)
      .where(sql`${searchAnalytics.destination} IS NOT NULL`)
      .groupBy(searchAnalytics.destination)
      .orderBy(desc(count()))
      .limit(10);

    // Get booking trends
    const bookingData = await db
      .select({
        date: sql<string>`DATE(${bookings.createdAt})`,
        count: count(),
        revenue: sql<number>`COALESCE(SUM(CAST(${bookings.totalAmount} AS NUMERIC)), 0)`,
      })
      .from(bookings)
      .groupBy(sql`DATE(${bookings.createdAt})`)
      .orderBy(sql`DATE(${bookings.createdAt})`)
      .limit(30);

    // Get top routes
    const topRoutesData = await db
      .select({
        fromCity: routes.fromCity,
        toCity: routes.toCity,
        bookingCount: count(bookings.id),
      })
      .from(routes)
      .leftJoin(buses, eq(buses.routeId, routes.id))
      .leftJoin(bookings, eq(bookings.busId, buses.id))
      .groupBy(routes.id, routes.fromCity, routes.toCity)
      .orderBy(desc(count(bookings.id)))
      .limit(10);

    // Calculate conversion rate
    const totalSearches = await db
      .select({ count: count() })
      .from(searchAnalytics);

    const totalBookings = await db
      .select({ count: count() })
      .from(bookings);

    const conversionRate =
      totalSearches[0]?.count > 0
        ? (totalBookings[0]?.count / totalSearches[0].count) * 100
        : 0;

    return NextResponse.json({
      searches: searchData.map((item) => ({
        destination: item.destination,
        count: Number(item.count),
      })),
      bookings: bookingData.map((item) => ({
        date: item.date,
        count: Number(item.count),
        revenue: Number(item.revenue),
      })),
      topRoutes: topRoutesData.map((item) => ({
        route: `${item.fromCity} → ${item.toCity}`,
        bookings: Number(item.bookingCount),
      })),
      conversionRate: parseFloat(conversionRate.toFixed(2)),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
