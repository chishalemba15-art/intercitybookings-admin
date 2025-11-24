import { NextResponse } from 'next/server';
import { getCacheStats, isMLAvailable } from '@/lib/ml/semantic-search';
import { db } from '@/db';
import { searchAnalytics } from '@/db/schema';
import { sql } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * Get ML Analytics - Cache stats, usage metrics, performance
 */
export async function GET() {
  try {
    const mlAvailable = isMLAvailable();

    // Get cache statistics
    const cacheStats = mlAvailable ? getCacheStats() : null;

    // Get search analytics from last 7 days (using real data)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const searchStats = await db
      .select({
        totalSearches: sql<number>`COUNT(*)`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${searchAnalytics.userPhone})`,
        uniqueDestinations: sql<number>`COUNT(DISTINCT ${searchAnalytics.destination})`,
        avgSearchesPerUser: sql<number>`CAST(COUNT(*) AS FLOAT) / NULLIF(COUNT(DISTINCT ${searchAnalytics.userPhone}), 0)`,
      })
      .from(searchAnalytics)
      .where(sql`${searchAnalytics.createdAt} >= ${sevenDaysAgo}`);

    // Get top searched destinations
    const topDestinations = await db
      .select({
        destination: searchAnalytics.destination,
        searchCount: sql<number>`COUNT(*)`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${searchAnalytics.userPhone})`,
      })
      .from(searchAnalytics)
      .where(sql`${searchAnalytics.createdAt} >= ${sevenDaysAgo}`)
      .groupBy(searchAnalytics.destination)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    // Get search trends by day
    const searchTrends = await db
      .select({
        date: sql<string>`DATE(${searchAnalytics.createdAt})`,
        searchCount: sql<number>`COUNT(*)`,
      })
      .from(searchAnalytics)
      .where(sql`${searchAnalytics.createdAt} >= ${sevenDaysAgo}`)
      .groupBy(sql`DATE(${searchAnalytics.createdAt})`)
      .orderBy(sql`DATE(${searchAnalytics.createdAt}) ASC`);

    return NextResponse.json({
      success: true,
      data: {
        mlEnabled: mlAvailable,
        cache: cacheStats,
        search: {
          stats: searchStats[0] || {
            totalSearches: 0,
            uniqueUsers: 0,
            uniqueDestinations: 0,
            avgSearchesPerUser: 0,
          },
          topDestinations: topDestinations.map(item => ({
            destination: item.destination,
            searchCount: parseInt(item.searchCount as any) || 0,
            uniqueUsers: parseInt(item.uniqueUsers as any) || 0,
          })),
          trends: searchTrends.map(item => ({
            date: item.date,
            searchCount: parseInt(item.searchCount as any) || 0,
          })),
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching ML analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch ML analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
