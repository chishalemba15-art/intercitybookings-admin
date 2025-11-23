'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface BookingDetails {
  booking: any;
  availableAgents: any[];
  assignmentHistory: any[];
}

export default function BookingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id;

  const [data, setData] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [assigning, setAssigning] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);

  useEffect(() => {
    fetchBookingDetails();
  }, [bookingId]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/bookings/${bookingId}`);
      if (!response.ok) throw new Error('Failed to fetch booking');
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching booking:', error);
      toast.error('Failed to load booking details');
    } finally {
      setLoading(false);
    }
  };

  const handleAssignAgent = async () => {
    if (!selectedAgent) {
      toast.error('Please select an agent');
      return;
    }

    try {
      setAssigning(true);
      const response = await fetch(`/api/admin/bookings/${bookingId}/assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agentId: selectedAgent,
          adminUserId: 1, // TODO: Get from session
          notes: assignmentNotes,
        }),
      });

      if (!response.ok) throw new Error('Failed to assign booking');

      const result = await response.json();
      toast.success(`Booking assigned to ${result.assignment.agentName}`);
      setShowAssignModal(false);
      fetchBookingDetails(); // Refresh data
    } catch (error) {
      console.error('Error assigning booking:', error);
      toast.error('Failed to assign booking');
    } finally {
      setAssigning(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-100 text-yellow-800',
      assigned: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6">
        <p className="text-red-600">Booking not found</p>
      </div>
    );
  }

  const { booking, availableAgents, assignmentHistory } = data;

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-800 mb-2"
          >
            ← Back to Bookings
          </button>
          <h1 className="text-3xl font-bold text-slate-900">
            Booking Details
          </h1>
          <p className="text-slate-600 mt-1">
            Reference: <span className="font-semibold">{booking.bookingRef}</span>
          </p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(booking.status)}`}>
          {booking.status?.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Passenger Information */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Passenger Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Name</p>
                <p className="font-semibold text-slate-900">{booking.passengerName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Phone</p>
                <p className="font-semibold text-slate-900">
                  <a href={`tel:${booking.passengerPhone}`} className="text-blue-600 hover:underline">
                    {booking.passengerPhone}
                  </a>
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Email</p>
                <p className="font-semibold text-slate-900">{booking.passengerEmail || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Seat Number</p>
                <p className="font-semibold text-slate-900">{booking.seatNumber}</p>
              </div>
            </div>
            {booking.specialRequests && (
              <div className="mt-4 pt-4 border-t border-slate-200">
                <p className="text-sm text-slate-600">Special Requests</p>
                <p className="text-slate-900">{booking.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Trip Information */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <h2 className="text-xl font-bold text-slate-900 mb-4">
              Trip Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Route</p>
                <p className="font-semibold text-slate-900">
                  {booking.fromCity} → {booking.toCity}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Travel Date</p>
                <p className="font-semibold text-slate-900">
                  {new Date(booking.travelDate).toLocaleDateString('en-ZM', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Operator</p>
                <p className="font-semibold text-slate-900">{booking.operatorName}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Departure Time</p>
                <p className="font-semibold text-slate-900">{booking.departureTime}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Bus Type</p>
                <p className="font-semibold text-slate-900 capitalize">{booking.busType}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Total Amount</p>
                <p className="font-semibold text-slate-900">ZMW {Number(booking.totalAmount).toFixed(2)}</p>
              </div>
            </div>
          </div>

          {/* Assignment History */}
          {assignmentHistory && assignmentHistory.length > 0 && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Assignment History
              </h2>
              <div className="space-y-3">
                {assignmentHistory.map((history: any) => (
                  <div
                    key={history.id}
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {history.agentName} {history.agentLastName}
                      </p>
                      <p className="text-sm text-slate-600">
                        Status: <span className="font-medium">{history.assignmentStatus}</span>
                      </p>
                      {history.rejectionReason && (
                        <p className="text-sm text-red-600 mt-1">
                          Reason: {history.rejectionReason}
                        </p>
                      )}
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(history.createdAt).toLocaleString()}
                      </p>
                    </div>
                    {history.escalated && (
                      <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                        Escalated
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Agent Assignment */}
        <div className="space-y-6">
          {/* Currently Assigned Agent */}
          {booking.assignedAgent && (
            <div className="bg-white rounded-lg border border-slate-200 p-6">
              <h2 className="text-lg font-bold text-slate-900 mb-4">
                Assigned Agent
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-slate-600">Name</p>
                  <p className="font-semibold text-slate-900">
                    {booking.assignedAgent.firstName} {booking.assignedAgent.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Phone</p>
                  <p className="font-semibold text-blue-600">
                    <a href={`tel:${booking.assignedAgent.phoneNumber}`} className="hover:underline">
                      📞 {booking.assignedAgent.phoneNumber}
                    </a>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Status</p>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${booking.assignedAgent.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                    <span className="text-sm">
                      {booking.assignedAgent.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                </div>
                {booking.assignmentResponseDeadline && (
                  <div>
                    <p className="text-sm text-slate-600">Response Deadline</p>
                    <p className="text-sm text-orange-600">
                      {new Date(booking.assignmentResponseDeadline).toLocaleString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Available Agents */}
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">
                Available Agents ({availableAgents.length})
              </h2>
              <button
                onClick={() => setShowAssignModal(true)}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Assign
              </button>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {availableAgents.map((agent: any) => (
                <div
                  key={agent.id}
                  className="p-3 border border-slate-200 rounded-lg hover:bg-slate-50 cursor-pointer"
                  onClick={() => setSelectedAgent(agent.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-slate-900">
                        {agent.firstName} {agent.lastName}
                      </p>
                      <p className="text-xs text-slate-600">{agent.phoneNumber}</p>
                      <p className="text-xs text-slate-500">{agent.locationCity}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`w-2 h-2 rounded-full ${agent.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}></span>
                      <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-800 rounded">
                        {agent.agentType}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-slate-900 mb-4">
              Assign Booking to Agent
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Select Agent
                </label>
                <select
                  value={selectedAgent || ''}
                  onChange={(e) => setSelectedAgent(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose an agent...</option>
                  {availableAgents.map((agent: any) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.firstName} {agent.lastName} - {agent.phoneNumber}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Any special instructions for the agent..."
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAssignAgent}
                  disabled={!selectedAgent || assigning}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {assigning ? 'Assigning...' : 'Assign & Notify'}
                </button>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
