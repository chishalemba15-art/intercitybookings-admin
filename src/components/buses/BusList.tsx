'use client';

import { Bus } from '@/db/schema';

interface BusListProps {
  buses: Bus[];
  onEdit: (bus: Bus) => void;
  onDelete: (id: number) => void;
}

export default function BusList({ buses, onEdit, onDelete }: BusListProps) {
  if (buses.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-600">No buses found. Add your first bus to get started.</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Route
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Operator
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Time
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Type
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Seats
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Price (ZMW)
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Status
              </th>
              <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {buses.map((bus: any) => (
              <tr key={bus.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-900">
                  <div className="font-medium">{bus.route}</div>
                  <div className="text-xs text-slate-600">{bus.toCity}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {bus.operatorName}
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {bus.departureTime} → {bus.arrivalTime}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bus.type === 'luxury'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {bus.type}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  <div className="font-medium">{bus.availableSeats}/{bus.totalSeats}</div>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900">
                  ZMW {Number(bus.price).toFixed(2)}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      bus.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {bus.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-right space-x-2">
                  <button
                    onClick={() => onEdit(bus)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(bus.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
