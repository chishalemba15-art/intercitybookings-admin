'use client';

import { Route } from '@/db/schema';

interface RoutesListProps {
  routes: Route[];
  onEdit: (route: Route) => void;
  onDelete: (id: number) => void;
}

export default function RoutesList({ routes, onEdit, onDelete }: RoutesListProps) {
  if (routes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-600">No routes found. Add your first route to get started.</p>
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
                Distance (km)
              </th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                Est. Duration
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
            {routes.map((route) => (
              <tr key={route.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm text-slate-900">
                  <div className="font-medium">
                    {route.fromCity} → {route.toCity}
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {Number(route.distance) || 'N/A'} km
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">
                  {route.estimatedDuration
                    ? `${Math.round(Number(route.estimatedDuration) / 60)} hrs`
                    : 'N/A'}
                </td>
                <td className="px-6 py-4 text-sm">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      route.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {route.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-right space-x-2">
                  <button
                    onClick={() => onEdit(route)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(route.id)}
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
