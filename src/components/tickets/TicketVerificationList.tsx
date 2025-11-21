'use client';

import { useState } from 'react';
import TicketVerificationModal from './TicketVerificationModal';

interface ProcessedTicket {
  id: number;
  ticketRequestId: number;
  agentId: number;
  agentName?: string;
  passengerName: string;
  seatNumber: string | null;
  bookingReference: string | null;
  receiptImageUrl: string | null;
  receiptVerificationStatus: 'pending' | 'verified' | 'rejected';
  userSmsSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TicketVerificationListProps {
  tickets: ProcessedTicket[];
  onUpdate: () => Promise<void>;
  status: 'pending' | 'verified' | 'rejected';
}

export default function TicketVerificationList({
  tickets,
  onUpdate,
  status,
}: TicketVerificationListProps) {
  const [selectedTicket, setSelectedTicket] = useState<ProcessedTicket | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleReview = (ticket: ProcessedTicket) => {
    setSelectedTicket(ticket);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedTicket(null);
  };

  const handleDecision = async () => {
    await onUpdate();
    handleModalClose();
  };

  if (tickets.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <svg
          className="w-16 h-16 text-slate-400 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-slate-600">
          {status === 'pending' && 'No pending receipts. All caught up!'}
          {status === 'verified' && 'No verified receipts yet.'}
          {status === 'rejected' && 'No rejected receipts.'}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        {tickets.map((ticket) => (
          <div
            key={ticket.id}
            className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-6">
              {/* Passenger Info */}
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Passenger</label>
                <p className="text-sm font-semibold text-slate-900 mt-1">{ticket.passengerName}</p>
                {ticket.seatNumber && (
                  <p className="text-xs text-slate-600 mt-1">Seat: {ticket.seatNumber}</p>
                )}
              </div>

              {/* Booking Ref */}
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Booking Ref</label>
                <p className="text-sm font-mono text-slate-900 mt-1">
                  {ticket.bookingReference || 'Not assigned'}
                </p>
              </div>

              {/* Status */}
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">Status</label>
                <div className="mt-1">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                      ticket.receiptVerificationStatus === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : ticket.receiptVerificationStatus === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {ticket.receiptVerificationStatus.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* SMS Status */}
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">SMS Sent</label>
                <div className="mt-1 flex items-center gap-2">
                  {ticket.userSmsSent ? (
                    <>
                      <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-slate-900">Yes</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm text-slate-600">No</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Receipt Image Preview and Action */}
            {ticket.receiptImageUrl && (
              <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <img
                    src={ticket.receiptImageUrl}
                    alt="Receipt"
                    className="w-16 h-16 object-cover rounded border border-slate-200"
                  />
                  <span className="text-sm text-slate-600">Receipt image attached</span>
                </div>

                {ticket.receiptVerificationStatus === 'pending' && (
                  <button
                    onClick={() => handleReview(ticket)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                  >
                    Review Receipt
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Verification Modal */}
      {showModal && selectedTicket && (
        <TicketVerificationModal
          ticket={selectedTicket}
          onClose={handleModalClose}
          onDecision={handleDecision}
        />
      )}
    </>
  );
}
