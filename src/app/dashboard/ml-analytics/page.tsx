'use client';

import { useEffect, useState } from 'react';

interface MLAnalyticsData {
  mlEnabled: boolean;
  cache: {
    size: number;
    maxSize: number;
    utilization: number;
  } | null;
  search: {
    stats: {
      totalSearches: number;
      uniqueUsers: number;
      uniqueDestinations: number;
      avgSearchesPerUser: number;
    };
    topDestinations: Array<{
      destination: string;
      searchCount: number;
      uniqueUsers: number;
    }>;
    trends: Array<{
      date: string;
      searchCount: number;
    }>;
  };
  timestamp: string;
}

interface MLStatusData {
  status: string;
  mlEnabled: boolean;
  cache: {
    size: number;
    maxSize: number;
    utilization: number;
  } | null;
  testResults: {
    responseTime: number;
    embeddingSize: number;
    status: string;
    error: string | null;
  } | null;
  model?: string;
  provider?: string;
  reason?: string;
}

export default function MLAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<MLAnalyticsData | null>(null);
  const [statusData, setStatusData] = useState<MLStatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMLData();
  }, []);

  const fetchMLData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch both analytics and status in parallel
      const [analyticsRes, statusRes] = await Promise.all([
        fetch('/api/ml/analytics'),
        fetch('/api/ml/status'),
      ]);

      if (!analyticsRes.ok || !statusRes.ok) {
        throw new Error('Failed to fetch ML data');
      }

      const analyticsJson = await analyticsRes.json();
      const statusJson = await statusRes.json();

      if (analyticsJson.success) {
        setAnalyticsData(analyticsJson.data);
      }

      if (statusJson.success) {
        setStatusData(statusJson.data);
      }
    } catch (err) {
      console.error('Error fetching ML data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading ML analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-900">Error</h2>
        <p className="text-red-700 mt-2">{error}</p>
        <button
          onClick={fetchMLData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'disabled':
        return 'text-slate-600 bg-slate-50 border-slate-200';
      default:
        return 'text-slate-600 bg-slate-50 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            🤖 ML Analytics
          </h1>
          <p className="text-slate-600 mt-1">
            AI/ML system performance and insights
          </p>
        </div>
        <button
          onClick={fetchMLData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* ML Status Card */}
      {statusData && (
        <div
          className={`border rounded-lg p-6 ${getStatusColor(statusData.status)}`}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">System Status</h2>
              <p className="text-sm mt-1 opacity-75">
                {statusData.mlEnabled ? (
                  <>
                    {statusData.model} via {statusData.provider}
                  </>
                ) : (
                  statusData.reason || 'ML features disabled'
                )}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold capitalize">
                {statusData.status}
              </div>
              {statusData.testResults && (
                <div className="text-sm mt-1 opacity-75">
                  {statusData.testResults.responseTime}ms response
                </div>
              )}
            </div>
          </div>

          {statusData.testResults && statusData.testResults.error && (
            <div className="mt-4 pt-4 border-t border-current/20">
              <p className="text-sm font-medium">Error:</p>
              <p className="text-sm mt-1 opacity-75">{statusData.testResults.error}</p>
            </div>
          )}
        </div>
      )}

      {/* Key Metrics */}
      {analyticsData && analyticsData.mlEnabled && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Cache Utilization */}
          {analyticsData.cache && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <div className="text-sm font-medium text-slate-600">Cache Utilization</div>
              <div className="text-3xl font-bold mt-2 text-blue-600">
                {analyticsData.cache.utilization.toFixed(1)}%
              </div>
              <p className="text-sm text-slate-500 mt-2">
                {analyticsData.cache.size} / {analyticsData.cache.maxSize} entries
              </p>
            </div>
          )}

          {/* Total Searches */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="text-sm font-medium text-slate-600">Total Searches</div>
            <div className="text-3xl font-bold mt-2 text-green-600">
              {analyticsData.search.stats.totalSearches.toLocaleString()}
            </div>
            <p className="text-sm text-slate-500 mt-2">Last 7 days</p>
          </div>

          {/* Unique Users */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="text-sm font-medium text-slate-600">Unique Users</div>
            <div className="text-3xl font-bold mt-2 text-purple-600">
              {analyticsData.search.stats.uniqueUsers.toLocaleString()}
            </div>
            <p className="text-sm text-slate-500 mt-2">Last 7 days</p>
          </div>

          {/* Avg Searches/User */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="text-sm font-medium text-slate-600">Avg Searches/User</div>
            <div className="text-3xl font-bold mt-2 text-orange-600">
              {analyticsData.search.stats.avgSearchesPerUser.toFixed(1)}
            </div>
            <p className="text-sm text-slate-500 mt-2">User engagement</p>
          </div>
        </div>
      )}

      {/* Top Destinations */}
      {analyticsData && analyticsData.mlEnabled && (
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Top Searched Destinations</h2>
            <p className="text-sm text-slate-600 mt-1">Most popular search queries (last 7 days)</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Destination
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Searches
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                    Unique Users
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {analyticsData.search.topDestinations.map((destination, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-600">#{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {destination.destination}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {destination.searchCount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {destination.uniqueUsers.toLocaleString()}
                    </td>
                  </tr>
                ))}
                {analyticsData.search.topDestinations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No search data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Search Trends Chart */}
      {analyticsData && analyticsData.mlEnabled && analyticsData.search.trends.length > 0 && (
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="font-semibold text-slate-900 mb-4">Search Trends</h2>
          <div className="space-y-3">
            {analyticsData.search.trends.map((trend, index) => {
              const maxCount = Math.max(...analyticsData.search.trends.map(t => t.searchCount));
              const percentage = (trend.searchCount / maxCount) * 100;

              return (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-24 text-sm text-slate-600">
                    {new Date(trend.date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </div>
                  <div className="flex-1">
                    <div className="h-8 bg-slate-100 rounded-lg overflow-hidden">
                      <div
                        className="h-full bg-blue-500 transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                  <div className="w-16 text-sm font-medium text-slate-900 text-right">
                    {trend.searchCount}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ML Disabled Message */}
      {analyticsData && !analyticsData.mlEnabled && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-yellow-900">ML Features Disabled</h2>
          <p className="text-yellow-700 mt-2">
            To enable ML-powered features, configure your HUGGINGFACE_API_KEY in the environment variables.
          </p>
          <a
            href="https://huggingface.co/settings/tokens"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-block px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
          >
            Get API Key →
          </a>
        </div>
      )}

      {/* Footer */}
      <div className="text-center text-sm text-slate-500">
        Last updated: {analyticsData ? new Date(analyticsData.timestamp).toLocaleString() : 'N/A'}
      </div>
    </div>
  );
}
