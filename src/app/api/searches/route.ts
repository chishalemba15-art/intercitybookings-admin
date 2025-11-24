import { NextResponse } from 'next/server';
import { db } from '@/db';
import { searchAnalytics } from '@/db/schema';
import { sql, desc, gte } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

/**
 * Get comprehensive search analytics data
 * - Recent searches with geolocation
 * - Search volume trends
 * - Top destinations
 * - Geographic distribution
 * - ML-extracted insights
 */
export async function GET() {
  try {
    // Get date filters
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get recent searches with all details (last 100)
    const recentSearches = await db
      .select({
        id: searchAnalytics.id,
        searchQuery: searchAnalytics.searchQuery,
        destination: searchAnalytics.destination,
        city: searchAnalytics.city,
        country: searchAnalytics.country,
        latitude: searchAnalytics.latitude,
        longitude: searchAnalytics.longitude,
        extractedLocation: searchAnalytics.extractedLocation,
        searchIntent: searchAnalytics.searchIntent,
        userPhone: searchAnalytics.userPhone,
        resultsCount: searchAnalytics.resultsCount,
        createdAt: searchAnalytics.createdAt,
      })
      .from(searchAnalytics)
      .orderBy(desc(searchAnalytics.createdAt))
      .limit(100);

    // Get search volume statistics
    const searchStats = await db
      .select({
        total: sql<number>`COUNT(*)`,
        last24h: sql<number>`COUNT(*) FILTER (WHERE ${searchAnalytics.createdAt} >= ${last24Hours})`,
        last7days: sql<number>`COUNT(*) FILTER (WHERE ${searchAnalytics.createdAt} >= ${last7Days})`,
        last30days: sql<number>`COUNT(*) FILTER (WHERE ${searchAnalytics.createdAt} >= ${last30Days})`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${searchAnalytics.userPhone})`,
        avgResultsCount: sql<number>`AVG(${searchAnalytics.resultsCount})`,
      })
      .from(searchAnalytics);

    // Get top destinations (last 7 days)
    const topDestinations = await db
      .select({
        destination: searchAnalytics.destination,
        searchCount: sql<number>`COUNT(*)`,
        uniqueUsers: sql<number>`COUNT(DISTINCT ${searchAnalytics.userPhone})`,
      })
      .from(searchAnalytics)
      .where(gte(searchAnalytics.createdAt, last7Days))
      .groupBy(searchAnalytics.destination)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    // Get geographic distribution (searches by city)
    const geographicDistribution = await db
      .select({
        city: searchAnalytics.city,
        country: searchAnalytics.country,
        searchCount: sql<number>`COUNT(*)`,
        latitude: sql<string>`AVG(${searchAnalytics.latitude})`,
        longitude: sql<string>`AVG(${searchAnalytics.longitude})`,
      })
      .from(searchAnalytics)
      .where(sql`${searchAnalytics.city} IS NOT NULL`)
      .groupBy(searchAnalytics.city, searchAnalytics.country)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(20);

    // Get hourly search trends (last 24 hours)
    const hourlyTrends = await db
      .select({
        hour: sql<string>`TO_CHAR(${searchAnalytics.createdAt}, 'YYYY-MM-DD HH24:00')`,
        searchCount: sql<number>`COUNT(*)`,
      })
      .from(searchAnalytics)
      .where(gte(searchAnalytics.createdAt, last24Hours))
      .groupBy(sql`TO_CHAR(${searchAnalytics.createdAt}, 'YYYY-MM-DD HH24:00')`)
      .orderBy(sql`TO_CHAR(${searchAnalytics.createdAt}, 'YYYY-MM-DD HH24:00') ASC`);

    // Get ML insights - search intents distribution
    const intentDistribution = await db
      .select({
        intent: searchAnalytics.searchIntent,
        count: sql<number>`COUNT(*)`,
      })
      .from(searchAnalytics)
      .where(sql`${searchAnalytics.searchIntent} IS NOT NULL`)
      .groupBy(searchAnalytics.searchIntent)
      .orderBy(sql`COUNT(*) DESC`);

    // Get top extracted locations from ML
    const topExtractedLocations = await db
      .select({
        location: searchAnalytics.extractedLocation,
        count: sql<number>`COUNT(*)`,
      })
      .from(searchAnalytics)
      .where(sql`${searchAnalytics.extractedLocation} IS NOT NULL`)
      .groupBy(searchAnalytics.extractedLocation)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(15);

    return NextResponse.json({
      success: true,
      data: {
        recentSearches: (recentSearches || []).map(search => ({
          id: search.id,
          query: search.searchQuery,
          destination: search.destination,
          city: search.city,
          country: search.country,
          latitude: search.latitude ? parseFloat(search.latitude as string) : null,
          longitude: search.longitude ? parseFloat(search.longitude as string) : null,
          extractedLocation: search.extractedLocation,
          searchIntent: search.searchIntent,
          userPhone: search.userPhone,
          resultsCount: search.resultsCount,
          timestamp: search.createdAt,
        })),
        stats: {
          total: parseInt(searchStats[0]?.total as any) || 0,
          last24h: parseInt(searchStats[0]?.last24h as any) || 0,
          last7days: parseInt(searchStats[0]?.last7days as any) || 0,
          last30days: parseInt(searchStats[0]?.last30days as any) || 0,
          uniqueUsers: parseInt(searchStats[0]?.uniqueUsers as any) || 0,
          avgResultsCount: parseFloat(searchStats[0]?.avgResultsCount as any) || 0,
        },
        topDestinations: (topDestinations || []).map(dest => ({
          destination: dest.destination,
          searchCount: parseInt(dest.searchCount as any) || 0,
          uniqueUsers: parseInt(dest.uniqueUsers as any) || 0,
        })),
        geographicDistribution: (geographicDistribution || []).map(geo => ({
          city: geo.city,
          country: geo.country,
          searchCount: parseInt(geo.searchCount as any) || 0,
          latitude: geo.latitude ? parseFloat(geo.latitude as string) : null,
          longitude: geo.longitude ? parseFloat(geo.longitude as string) : null,
        })),
        hourlyTrends: (hourlyTrends || []).map(trend => ({
          hour: trend.hour,
          searchCount: parseInt(trend.searchCount as any) || 0,
        })),
        mlInsights: {
          intentDistribution: (intentDistribution || []).map(intent => ({
            intent: intent.intent,
            count: parseInt(intent.count as any) || 0,
          })),
          topExtractedLocations: (topExtractedLocations || []).map(loc => ({
            location: loc.location,
            count: parseInt(loc.count as any) || 0,
          })),
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Error fetching search analytics:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch search analytics',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
