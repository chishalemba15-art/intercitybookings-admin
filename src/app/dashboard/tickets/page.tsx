'use client';

import { useEffect, useState } from 'react';
import TicketVerificationList from '@/components/tickets/TicketVerificationList';

interface ProcessedTicket {
  id: number;
  ticketRequestId: number;
  agentId: number;
  agentName: string;
  passengerName: string;
  seatNumber: string | null;
  bookingReference: string | null;
  receiptImageUrl: string | null;
  receiptVerificationStatus: 'pending' | 'verified' | 'rejected';
  userSmsSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

type TabType = 'pending' | 'verified' | 'rejected';

export default function TicketsPage() {
  const [tickets, setTickets] = useState<ProcessedTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/tickets');
      if (!response.ok) throw new Error('Failed to fetch tickets');
      const data = await response.json();
      setTickets(data);
    } catch (error) {
      console.error('Error fetching tickets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTicketUpdate = async () => {
    await fetchTickets();
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (activeTab === 'pending') return ticket.receiptVerificationStatus === 'pending';
    if (activeTab === 'verified') return ticket.receiptVerificationStatus === 'verified';
    if (activeTab === 'rejected') return ticket.receiptVerificationStatus === 'rejected';
    return false;
  });

  const pendingCount = tickets.filter((t) => t.receiptVerificationStatus === 'pending').length;
  const verifiedCount = tickets.filter((t) => t.receiptVerificationStatus === 'verified').length;
  const rejectedCount = tickets.filter((t) => t.receiptVerificationStatus === 'rejected').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Ticket Verification</h1>
        <p className="text-slate-600 mt-1">Review and verify agent-uploaded receipt images</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="text-sm font-medium opacity-90">Pending Review</div>
          <div className="text-3xl font-bold mt-2">{pendingCount}</div>
          <p className="text-sm opacity-75 mt-2">Receipts awaiting verification</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="text-sm font-medium opacity-90">Verified</div>
          <div className="text-3xl font-bold mt-2">{verifiedCount}</div>
          <p className="text-sm opacity-75 mt-2">Confirmed bookings</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="text-sm font-medium opacity-90">Rejected</div>
          <div className="text-3xl font-bold mt-2">{rejectedCount}</div>
          <p className="text-sm opacity-75 mt-2">Rejected receipts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        {(['pending', 'verified', 'rejected'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'pending' && 'Pending Verification'}
            {tab === 'verified' && 'Verified Tickets'}
            {tab === 'rejected' && 'Rejected Receipts'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading tickets...</p>
        </div>
      ) : (
        <TicketVerificationList
          tickets={filteredTickets}
          onUpdate={handleTicketUpdate}
          status={activeTab}
        />
      )}
    </div>
  );
}
