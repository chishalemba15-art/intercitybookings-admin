'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface BookingAnalyticsChartProps {
  data: Array<{ date: string; count: number; revenue: number }>;
}

export default function BookingAnalyticsChart({ data }: BookingAnalyticsChartProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6">
      <h2 className="font-semibold text-slate-900 mb-4">Booking Trends</h2>
      {data && data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line yAxisId="left" type="monotone" dataKey="count" stroke="#3b82f6" name="Bookings" />
            <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#10b981" name="Revenue (ZMW)" />
          </LineChart>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex items-center justify-center text-slate-500">
          No booking data available
        </div>
      )}
    </div>
  );
}
