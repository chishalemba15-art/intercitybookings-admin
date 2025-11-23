'use client';

import { useEffect, useState } from 'react';
import BookingsList from '@/components/bookings/BookingsList';
import BookingForm from '@/components/bookings/BookingForm';

interface Booking {
  id: number;
  busId: number;
  bookingRef: string;
  passengerName: string;
  passengerPhone: string;
  passengerEmail: string;
  seatNumber: string;
  travelDate: Date;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  totalAmount: number;
  specialRequests: string | null;
  createdAt: Date;
  updatedAt: Date;
  busInfo?: {
    operatorName: string;
    departureTime: string;
    arrivalTime: string;
    fromCity: string;
    toCity: string;
  };
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'cancelled' | 'completed'>('all');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings');
      if (!response.ok) throw new Error('Failed to fetch bookings');
      const data = await response.json();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBooking = () => {
    setSelectedBooking(null);
    setShowForm(true);
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setSelectedBooking(null);
  };

  const handleSave = async () => {
    handleCloseForm();
    await fetchBookings();
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this booking?')) return;

    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete booking');
      await fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const filteredBookings = filter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-600 mt-1">Manage passenger bookings and reservations</p>
        </div>
        <button
          onClick={handleAddBooking}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + New Booking
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {(['all', 'pending', 'confirmed', 'cancelled', 'completed'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              filter === status
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
            {filter === status && (
              <span className="ml-2 bg-blue-100 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full">
                {bookings.filter((b) => b.status === status || status === 'all').length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Form Modal */}
      {showForm && (
        <BookingForm
          booking={selectedBooking}
          onClose={handleCloseForm}
          onSave={handleSave}
        />
      )}

      {/* Bookings List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading bookings...</p>
        </div>
      ) : (
        <BookingsList
          bookings={filteredBookings}
// @ts-ignore
          onEdit={handleEditBooking}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
