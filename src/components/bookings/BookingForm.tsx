'use client';

import { useEffect, useState } from 'react';

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
}

interface BookingFormProps {
  booking: Booking | null;
  onClose: () => void;
  onSave: () => void;
}

interface Bus {
  id: number;
  operatorId: number;
  routeId: number;
  departureTime: string;
  arrivalTime: string;
  price: number;
  operatorName?: string;
  fromCity?: string;
  toCity?: string;
}

export default function BookingForm({ booking, onClose, onSave }: BookingFormProps) {
  const [buses, setBuses] = useState<Bus[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    busId: booking?.busId ?? '',
    bookingRef: booking?.bookingRef ?? '',
    passengerName: booking?.passengerName ?? '',
    passengerPhone: booking?.passengerPhone ?? '',
    passengerEmail: booking?.passengerEmail ?? '',
    seatNumber: booking?.seatNumber ?? '',
    travelDate: booking?.travelDate ? new Date(booking.travelDate).toISOString().split('T')[0] : '',
    status: booking?.status ?? 'pending',
    totalAmount: booking?.totalAmount ?? '',
    specialRequests: booking?.specialRequests ?? '',
  });

  useEffect(() => {
    fetchBuses();
  }, []);

  const fetchBuses = async () => {
    try {
      const response = await fetch('/api/buses');
      if (response.ok) {
        const data = await response.json();
        setBuses(data);
      }
    } catch (error) {
      console.error('Error fetching buses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleBusChange = (busId: string) => {
    const selectedBus = buses.find((b) => b.id === parseInt(busId));
    setFormData((prev) => ({
      ...prev,
      busId,
      totalAmount: selectedBus ? selectedBus.price : '',
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const url = booking ? `/api/bookings/${booking.id}` : '/api/bookings';
      const method = booking ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          busId: parseInt(formData.busId as string),
          totalAmount: parseFloat(formData.totalAmount as string),
        }),
      });

      if (!response.ok) throw new Error('Failed to save booking');

      onSave();
    } catch (error) {
      console.error('Error saving booking:', error);
      alert('Failed to save booking');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-slate-600 mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            {booking ? 'Edit Booking' : 'New Booking'}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Bus Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Bus *
            </label>
            <select
              value={formData.busId}
              onChange={(e) => handleBusChange(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a bus</option>
              {buses.map((bus: any) => (
                <option key={bus.id} value={bus.id}>
                  {bus.route} → {bus.toCity} ({bus.departureTime}) - ZMW {Number(bus.price).toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Booking Reference */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Booking Reference *
            </label>
            <input
              type="text"
              name="bookingRef"
              value={formData.bookingRef}
              onChange={handleChange}
              required
              placeholder="e.g., ICB202411001"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Passenger Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Passenger Name *
              </label>
              <input
                type="text"
                name="passengerName"
                value={formData.passengerName}
                onChange={handleChange}
                required
                placeholder="Full name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Phone *
              </label>
              <input
                type="tel"
                name="passengerPhone"
                value={formData.passengerPhone}
                onChange={handleChange}
                required
                placeholder="+260..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Email
            </label>
            <input
              type="email"
              name="passengerEmail"
              value={formData.passengerEmail}
              onChange={handleChange}
              placeholder="email@example.com"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Seat and Travel Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Seat Number *
              </label>
              <input
                type="text"
                name="seatNumber"
                value={formData.seatNumber}
                onChange={handleChange}
                required
                placeholder="e.g., A1"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Travel Date *
              </label>
              <input
                type="date"
                name="travelDate"
                value={formData.travelDate}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Amount and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Amount (ZMW) *
              </label>
              <input
                type="number"
                name="totalAmount"
                value={formData.totalAmount}
                onChange={handleChange}
                required
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Special Requests */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Special Requests
            </label>
            <textarea
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              placeholder="Any special requests or notes..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              {submitting ? 'Saving...' : booking ? 'Update Booking' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
