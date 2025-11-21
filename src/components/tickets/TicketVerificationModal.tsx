'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

interface ProcessedTicket {
  id: number;
  ticketRequestId: number;
  agentId: number;
  passengerName: string;
  seatNumber: string | null;
  bookingReference: string | null;
  receiptImageUrl: string | null;
  receiptVerificationStatus: 'pending' | 'verified' | 'rejected';
  userSmsSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface TicketVerificationModalProps {
  ticket: ProcessedTicket;
  onClose: () => void;
  onDecision: () => Promise<void>;
}

export default function TicketVerificationModal({
  ticket,
  onClose,
  onDecision,
}: TicketVerificationModalProps) {
  const [loading, setLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      sendSMS: true,
    },
  });

  const sendSMS = watch('sendSMS');

  const handleVerify = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/tickets/${ticket.id}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sendSMS }),
      });

      if (!response.ok) {
        throw new Error('Failed to verify ticket');
      }

      toast.success('Ticket verified successfully');
      await onDecision();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to verify ticket');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/admin/tickets/${ticket.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      if (!response.ok) {
        throw new Error('Failed to reject ticket');
      }

      toast.success('Ticket rejected');
      await onDecision();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to reject ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-slate-900">Verify Receipt</h2>
          <button onClick={onClose} className="text-slate-600 hover:text-slate-900">
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Ticket Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Passenger Name</label>
              <p className="text-sm font-semibold text-slate-900 mt-1">{ticket.passengerName}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Seat Number</label>
              <p className="text-sm text-slate-900 mt-1">{ticket.seatNumber || 'Not specified'}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Ticket Request ID</label>
              <p className="text-sm font-mono text-slate-900 mt-1">#{ticket.ticketRequestId}</p>
            </div>
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase">Agent ID</label>
              <p className="text-sm font-mono text-slate-900 mt-1">#{ticket.agentId}</p>
            </div>
          </div>

          {/* Uploaded At */}
          <div>
            <label className="text-xs font-medium text-slate-500 uppercase">Uploaded At</label>
            <p className="text-sm text-slate-900 mt-1">
              {new Date(ticket.createdAt).toLocaleString('en-ZM')}
            </p>
          </div>

          {/* Receipt Image */}
          {ticket.receiptImageUrl && (
            <div>
              <label className="text-xs font-medium text-slate-500 uppercase mb-2 block">
                Receipt Image
              </label>
              <img
                src={ticket.receiptImageUrl}
                alt="Receipt"
                className="w-full max-h-96 object-contain rounded-lg border border-slate-200"
              />
            </div>
          )}

          {/* Verification Checklist */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-semibold text-blue-900 mb-3">Verification Checklist:</p>
            <ul className="space-y-2 text-sm text-blue-900">
              <li>✓ Receipt has date, amount, and agent signature?</li>
              <li>✓ Passenger name matches request?</li>
              <li>✓ Bus details are legitimate?</li>
              <li>✓ Receipt format looks authentic?</li>
            </ul>
          </div>

          {/* Decision Section */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <div className="flex gap-3 items-center">
              <input
                type="checkbox"
                id="sendSMS"
                {...register('sendSMS')}
                className="rounded"
              />
              <label htmlFor="sendSMS" className="text-sm text-slate-700">
                Send SMS confirmation to user (recommended)
              </label>
            </div>

            {!sendSMS && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm text-yellow-900">
                User will not receive SMS if you don't enable it.
              </div>
            )}

            {/* Rejection Reason */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Rejection Reason (if rejecting)
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="e.g., Receipt image is unclear, Passenger name doesn't match..."
                rows={3}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleVerify}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? 'Processing...' : 'Verify Receipt'}
              </button>
              <button
                onClick={handleReject}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 transition-colors"
              >
                {loading ? 'Processing...' : 'Reject Receipt'}
              </button>
              <button
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 font-medium disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
