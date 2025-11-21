'use client';

import { useEffect, useState } from 'react';
import SearchAnalyticsChart from '@/components/analytics/SearchAnalyticsChart';
import BookingAnalyticsChart from '@/components/analytics/BookingAnalyticsChart';

interface AnalyticsData {
  searches: Array<{ destination: string; count: number }>;
  bookings: Array<{ date: string; count: number; revenue: number }>;
  topRoutes: Array<{ route: string; bookings: number }>;
  conversionRate: number;
}

export default function AnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>({
    searches: [],
    bookings: [],
    topRoutes: [],
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics');
      if (!response.ok) throw new Error('Failed to fetch analytics');
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading analytics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-600 mt-1">Platform insights and performance metrics</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="text-sm font-medium opacity-90">Conversion Rate</div>
          <div className="text-4xl font-bold mt-2">{analyticsData.conversionRate.toFixed(1)}%</div>
          <p className="text-sm opacity-75 mt-2">Booking success rate</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="text-sm font-medium opacity-90">Total Searches</div>
          <div className="text-4xl font-bold mt-2">
            {analyticsData.searches.reduce((sum, item) => sum + item.count, 0)}
          </div>
          <p className="text-sm opacity-75 mt-2">User search queries</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SearchAnalyticsChart data={analyticsData.searches} />
        <BookingAnalyticsChart data={analyticsData.bookings} />
      </div>

      {/* Top Routes Table */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Popular Routes</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Route
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Bookings
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Popularity
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {analyticsData.topRoutes.length > 0 ? (
                analyticsData.topRoutes.map((route, index) => {
                  const maxBookings = Math.max(...analyticsData.topRoutes.map(r => r.bookings));
                  const percentage = (route.bookings / maxBookings) * 100;
                  return (
                    <tr key={index} className="hover:bg-slate-50">
                      <td className="px-6 py-4 text-sm font-medium text-slate-900">
                        {route.route}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {route.bookings}
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="px-6 py-4 text-center text-slate-600">
                    No route data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
