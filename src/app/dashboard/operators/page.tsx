'use client';

import { useEffect, useState } from 'react';
import { Operator } from '@/db/schema';
import OperatorsList from '@/components/operators/OperatorsList';
import OperatorForm from '@/components/operators/OperatorForm';

export default function OperatorsPage() {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<Operator | null>(null);

  useEffect(() => {
    fetchOperators();
  }, []);

  const fetchOperators = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/operators');
      if (!response.ok) throw new Error('Failed to fetch operators');
      const data = await response.json();
      setOperators(data);
    } catch (error) {
      console.error('Error fetching operators:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOperator = () => {
    setSelectedOperator(null);
    setShowForm(true);
  };

  const handleEditOperator = (operator: Operator) => {
    setSelectedOperator(operator);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedOperator(null);
  };

  const handleSave = async () => {
    handleCloseForm();
    await fetchOperators();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this operator?')) return;

    try {
      const response = await fetch(`/api/operators/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete operator');
      await fetchOperators();
    } catch (error) {
      console.error('Error deleting operator:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Operators</h1>
          <p className="text-slate-600 mt-1">Manage bus operators and their details</p>
        </div>
        <button
          onClick={handleAddOperator}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Add Operator
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <OperatorForm
          operator={selectedOperator}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}

      {/* Operators List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading operators...</p>
        </div>
      ) : (
        <OperatorsList
          operators={operators}
          onEdit={handleEditOperator}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
