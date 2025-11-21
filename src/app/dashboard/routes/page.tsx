'use client';

import { useEffect, useState } from 'react';
import { Route } from '@/db/schema';
import RoutesList from '@/components/routes/RoutesList';
import RouteForm from '@/components/routes/RouteForm';

export default function RoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/routes');
      if (!response.ok) throw new Error('Failed to fetch routes');
      const data = await response.json();
      setRoutes(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRoute = () => {
    setSelectedRoute(null);
    setShowForm(true);
  };

  const handleEditRoute = (route: Route) => {
    setSelectedRoute(route);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedRoute(null);
  };

  const handleSave = async () => {
    handleCloseForm();
    await fetchRoutes();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this route?')) return;

    try {
      const response = await fetch(`/api/routes/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete route');
      await fetchRoutes();
    } catch (error) {
      console.error('Error deleting route:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Routes</h1>
          <p className="text-slate-600 mt-1">Manage intercity routes and distances</p>
        </div>
        <button
          onClick={handleAddRoute}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Route
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <RouteForm
          route={selectedRoute}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}

      {/* Routes List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading routes...</p>
        </div>
      ) : (
        <RoutesList
          routes={routes}
          onEdit={handleEditRoute}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
