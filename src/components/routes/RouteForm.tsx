
import { useState } from 'react';
import { Route } from '@/db/schema';

interface RouteFormProps {
  route: Route | null;
  onClose: () => void;
  onSave: () => void;
}

export default function RouteForm({ route, onClose, onSave }: RouteFormProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fromCity: route?.fromCity ?? '',
    toCity: route?.toCity ?? '',
    distance: route?.distance?.toString() ?? '',
    estimatedDuration: route?.estimatedDuration?.toString() ?? '',
    isActive: route?.isActive ?? true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'isActive' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = route ? `/api/routes/${route.id}` : '/api/routes';
      const method = route ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          distance: formData.distance ? parseInt(formData.distance) : null,
          estimatedDuration: formData.estimatedDuration
            ? parseInt(formData.estimatedDuration)
            : null,
        }),
      });

      if (!response.ok) throw new Error('Failed to save route');

      onSave();
    } catch (error) {
      console.error('Error saving route:', error);
      alert('Failed to save route');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {route ? 'Edit Route' : 'Add New Route'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Cities */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                From City *
              </label>
              <input
                type="text"
                name="fromCity"
                value={formData.fromCity}
                onChange={handleChange}
                required
                placeholder="e.g., Lusaka"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                To City *
              </label>
              <input
                type="text"
                name="toCity"
                value={formData.toCity}
                onChange={handleChange}
                required
                placeholder="e.g., Kitwe"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Distance and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Distance (km)
              </label>
              <input
                type="number"
                name="distance"
                value={formData.distance}
                onChange={handleChange}
                min="0"
                placeholder="e.g., 456"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Est. Duration (minutes)
              </label>
              <input
                type="number"
                name="estimatedDuration"
                value={formData.estimatedDuration}
                onChange={handleChange}
                min="0"
                placeholder="e.g., 480"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              name="isActive"
              checked={formData.isActive}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="text-sm font-medium text-slate-600">
              Active
            </label>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-slate-400 font-medium"
            >
              {submitting ? 'Saving...' : route ? 'Update Route' : 'Add Route'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
