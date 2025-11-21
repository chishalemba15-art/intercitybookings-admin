'use client';

import { useEffect, useState } from 'react';
import { Bus } from '@/db/schema';
import BusList from '@/components/buses/BusList';
import BusForm from '@/components/buses/BusForm';

export default function BusesPage() {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/buses');
      if (!response.ok) throw new Error('Failed to fetch buses');
      const data = await response.json();
      setBuses(data);
    } catch (error) {
      console.error('Error fetching buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBus = () => {
    setSelectedBus(null);
    setShowForm(true);
  };

  const handleEditBus = (bus: Bus) => {
    setSelectedBus(bus);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedBus(null);
  };

  const handleSave = async () => {
    handleCloseForm();
    await fetchBuses();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this bus?')) return;

    try {
      const response = await fetch(`/api/buses/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete bus');
      await fetchBuses();
    } catch (error) {
      console.error('Error deleting bus:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Buses</h1>
          <p className="text-slate-600 mt-1">Manage bus schedules and details</p>
        </div>
        <button
          onClick={handleAddBus}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Bus
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <BusForm
          bus={selectedBus}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}

      {/* Buses List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading buses...</p>
        </div>
      ) : (
        <BusList
          buses={buses}
          onEdit={handleEditBus}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
