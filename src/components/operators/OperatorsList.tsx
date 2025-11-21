'use client';

import { Operator } from '@/db/schema';

interface OperatorsListProps {
  operators: Operator[];
  onEdit: (operator: Operator) => void;
  onDelete: (id: number) => void;
}

export default function OperatorsList({
  operators,
  onEdit,
  onDelete,
}: OperatorsListProps) {
  if (operators.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-600">
          No operators found. Add your first operator to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {operators.map((operator) => (
        <div
          key={operator.id}
          className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
        >
          {/* Operator Logo/Avatar */}
          <div className="flex items-center gap-3 mb-4">
            {operator.logo ? (
              <img
                src={operator.logo}
                alt={operator.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${operator.color} text-white font-bold`}>
                {operator.name.charAt(0)}
              </div>
            )}
            <div className="flex-1">
              <h3 className="font-semibold text-slate-900">{operator.name}</h3>
              <p className="text-xs text-slate-500">{operator.slug}</p>
            </div>
          </div>

          {/* Rating */}
          <div className="mb-3">
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium text-slate-900">
                {Number(operator.rating).toFixed(1)}★
              </span>
              <span className="text-xs text-slate-500">({operator.rating ? '4.5/5' : 'No rating'})</span>
            </div>
          </div>

          {/* Description */}
          {operator.description && (
            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
              {operator.description}
            </p>
          )}

          {/* Contact Info */}
          <div className="space-y-1 mb-4 text-xs text-slate-600">
            {operator.phone && (
              <p>
                <span className="font-medium">Phone:</span> {operator.phone}
              </p>
            )}
            {operator.email && (
              <p>
                <span className="font-medium">Email:</span> {operator.email}
              </p>
            )}
          </div>

          {/* Status */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                operator.isActive
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {operator.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t border-slate-200">
            <button
              onClick={() => onEdit(operator)}
              className="flex-1 px-3 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded font-medium transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => onDelete(operator.id)}
              className="flex-1 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
