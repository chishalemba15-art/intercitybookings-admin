'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import map component (client-side only)
const SearchesMap = dynamic(() => import('@/components/maps/SearchesMap'), {
  ssr: false,
  loading: () => (
    <div className="h-96 bg-slate-100 rounded-lg animate-pulse flex items-center justify-center">
      <p className="text-slate-500">Loading map...</p>
    </div>
  ),
});

interface SearchData {
  recentSearches: Array<{
    id: number;
    query: string;
    destination: string;
    city: string;
    country: string;
    latitude: number | null;
    longitude: number | null;
    extractedLocation: string;
    searchIntent: string;
    userPhone: string;
    resultsCount: number;
    timestamp: string;
  }>;
  stats: {
    total: number;
    last24h: number;
    last7days: number;
    last30days: number;
    uniqueUsers: number;
    avgResultsCount: number;
  };
  topDestinations: Array<{
    destination: string;
    searchCount: number;
    uniqueUsers: number;
  }>;
  geographicDistribution: Array<{
    city: string;
    country: string;
    searchCount: number;
    latitude: number | null;
    longitude: number | null;
  }>;
  hourlyTrends: Array<{
    hour: string;
    searchCount: number;
  }>;
  mlInsights: {
    intentDistribution: Array<{
      intent: string;
      count: number;
    }>;
    topExtractedLocations: Array<{
      location: string;
      count: number;
    }>;
  };
}

export default function SearchesPage() {
  const [searchData, setSearchData] = useState<SearchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSearchData();
  }, []);

  const fetchSearchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/searches');
      if (!response.ok) throw new Error('Failed to fetch search data');

      const data = await response.json();
      if (data.success) {
        setSearchData(data.data);
      }
    } catch (err) {
      console.error('Error fetching search data:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading search analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-red-900">Error</h2>
        <p className="text-red-700 mt-2">{error}</p>
        <button
          onClick={fetchSearchData}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!searchData) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            🔍 Search Analytics
          </h1>
          <p className="text-slate-600 mt-1">
            Comprehensive insights into user search behavior
          </p>
        </div>
        <button
          onClick={fetchSearchData}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="text-sm font-medium opacity-90">Total Searches</div>
          <div className="text-4xl font-bold mt-2">{searchData.stats.total.toLocaleString()}</div>
          <p className="text-sm opacity-75 mt-2">All time</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="text-sm font-medium opacity-90">Last 24 Hours</div>
          <div className="text-4xl font-bold mt-2">{searchData.stats.last24h.toLocaleString()}</div>
          <p className="text-sm opacity-75 mt-2">Recent activity</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="text-sm font-medium opacity-90">Unique Users</div>
          <div className="text-4xl font-bold mt-2">{searchData.stats.uniqueUsers.toLocaleString()}</div>
          <p className="text-sm opacity-75 mt-2">Active searchers</p>
        </div>
      </div>

      {/* Geographic Distribution Map */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Geographic Distribution
        </h2>
        <p className="text-sm text-slate-600 mb-4">Searches by location (bubble size = search volume)</p>
        <SearchesMap
          locations={searchData.geographicDistribution
            .filter(geo => geo.latitude && geo.longitude)
            .map(geo => ({
              city: geo.city,
              country: geo.country,
              latitude: geo.latitude!,
              longitude: geo.longitude!,
              searchCount: geo.searchCount,
            }))}
        />
      </div>

      {/* Top Destinations & ML Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Destinations */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900">Top Destinations (7 Days)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Rank</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Destination</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Searches</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Users</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {searchData.topDestinations.map((dest, index) => (
                  <tr key={index} className="hover:bg-slate-50">
                    <td className="px-6 py-4 text-sm text-slate-600">#{index + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">{dest.destination}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{dest.searchCount}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{dest.uniqueUsers}</td>
                  </tr>
                ))}
                {searchData.topDestinations.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                      No destination data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ML Insights - Search Intents */}
        <div className="bg-white rounded-lg border border-slate-200">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="font-semibold text-slate-900 flex items-center gap-2">
              🤖 ML-Extracted Search Intents
            </h2>
          </div>
          <div className="p-6">
            {searchData.mlInsights.intentDistribution.length > 0 ? (
              <div className="space-y-3">
                {searchData.mlInsights.intentDistribution.map((intent, index) => {
                  const maxCount = Math.max(...searchData.mlInsights.intentDistribution.map(i => i.count));
                  const percentage = (intent.count / maxCount) * 100;

                  return (
                    <div key={index}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-slate-700 capitalize">
                          {intent.intent?.replace(/_/g, ' ') || 'Unknown'}
                        </span>
                        <span className="text-sm text-slate-600">{intent.count}</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <p className="text-sm">ML intent classification will appear here</p>
                <p className="text-xs mt-1">Once searches include intent data</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Searches Table */}
      <div className="bg-white rounded-lg border border-slate-200">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="font-semibold text-slate-900">Recent Searches (Last 100)</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Time</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Query</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Destination</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Location</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Results</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Intent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {searchData.recentSearches.slice(0, 50).map((search) => (
                <tr key={search.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-xs text-slate-600 whitespace-nowrap">
                    {new Date(search.timestamp).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-900">
                    {search.query || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-slate-900">
                    {search.destination || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {search.city ? `${search.city}, ${search.country}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {search.resultsCount || 0}
                  </td>
                  <td className="px-6 py-4 text-xs">
                    {search.searchIntent ? (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {search.searchIntent}
                      </span>
                    ) : (
                      <span className="text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {searchData.recentSearches.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-slate-500">
                    No search data available
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
