'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface SearchAnalyticsChartProps {
  data: Array<{ destination: string; count: number }>;
}

export default function SearchAnalyticsChart({ data }: SearchAnalyticsChartProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-900 mb-4">Search Analytics</h2>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="destination" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" fill="#3b82f6" name="Searches" />
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-slate-500">
          No search data available
        </div>
      )}
    </div>
  );
}
