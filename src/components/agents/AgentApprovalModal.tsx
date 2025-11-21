'use client';

import { useState } from 'react';

interface Agent {
  id: number;
  phoneNumber: string;
  firstName: string;
  lastName: string;
  email: string | null;
  idType: string;
  idNumber: string;
  profilePictureUrl: string | null;
  locationCity: string | null;
  locationAddress: string | null;
}

interface AgentApprovalModalProps {
  agent: Agent;
  onClose: () => void;
  onDecision: () => void;
}

export default function AgentApprovalModal({
  agent,
  onClose,
  onDecision,
}: AgentApprovalModalProps) {
  const [decision, setDecision] = useState<'approve' | 'reject' | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState('');

  const handleSubmit = async () => {
    if (!decision) {
      alert('Please select approve or reject');
      return;
    }

    if (decision === 'reject' && !rejectionReason) {
      alert('Please provide a rejection reason');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(
        `/api/admin/agents/${agent.id}/${decision}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            rejectionReason: decision === 'reject' ? rejectionReason : null,
            verificationNotes,
          }),
        }
      );

      if (!response.ok) throw new Error('Failed to update agent');

      alert(
        decision === 'approve'
          ? 'Agent approved! Welcome bonus (50 ZMW) has been added.'
          : 'Application rejected. SMS notification sent to agent.'
      );

      onDecision();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to process decision');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">
            Review Agent Application
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-700"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Agent Details */}
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <h3 className="font-semibold text-slate-900">Agent Information</h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">
                  Name
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {agent.firstName} {agent.lastName}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">
                  Phone
                </label>
                <p className="text-sm text-slate-900 mt-1">{agent.phoneNumber}</p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">
                  ID Type
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {agent.idType.replace('_', ' ')}
                </p>
              </div>
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">
                  ID Number
                </label>
                <p className="text-sm text-slate-900 mt-1">{agent.idNumber}</p>
              </div>
              {agent.locationCity && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-500 uppercase">
                    Location
                  </label>
                  <p className="text-sm text-slate-900 mt-1">
                    {agent.locationCity}
                    {agent.locationAddress && `, ${agent.locationAddress}`}
                  </p>
                </div>
              )}
              {agent.email && (
                <div className="col-span-2">
                  <label className="text-xs font-medium text-slate-500 uppercase">
                    Email
                  </label>
                  <p className="text-sm text-slate-900 mt-1 break-all">
                    {agent.email}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Verification Checklist */}
          <div className="space-y-3">
            <h3 className="font-semibold text-slate-900">
              Verification Checklist
            </h3>
            <div className="space-y-2">
              {[
                'Called operator to confirm agent legitimacy',
                'Verified agent phone number',
                'Checked ID information',
                'Confirmed agent availability',
                'Discussed commission structure and float system',
              ].map((item) => (
                <label key={item} className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-slate-600">{item}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Verification Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-900 mb-2">
              Verification Notes
            </label>
            <textarea
              value={verificationNotes}
              onChange={(e) => setVerificationNotes(e.target.value)}
              placeholder="Add any additional notes from your verification call..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Decision */}
          <div className="space-y-4">
            <h3 className="font-semibold text-slate-900">Decision</h3>

            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="decision"
                  value="approve"
                  checked={decision === 'approve'}
                  onChange={(e) => setDecision('approve' as const)}
                  className="w-4 h-4 text-green-600 border-slate-300 focus:ring-2 focus:ring-green-500"
                />
                <div>
                  <p className="font-medium text-slate-900">Approve</p>
                  <p className="text-xs text-slate-600">
                    Agent will receive 50 ZMW welcome bonus
                  </p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="decision"
                  value="reject"
                  checked={decision === 'reject'}
                  onChange={(e) => setDecision('reject' as const)}
                  className="w-4 h-4 text-red-600 border-slate-300 focus:ring-2 focus:ring-red-500"
                />
                <div>
                  <p className="font-medium text-slate-900">Reject</p>
                  <p className="text-xs text-slate-600">
                    SMS notification will be sent to agent
                  </p>
                </div>
              </label>
            </div>

            {decision === 'reject' && (
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Rejection Reason *
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why the application is being rejected..."
                  rows={3}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !decision}
              className={`px-4 py-2 text-white rounded-lg font-medium ${
                decision === 'approve'
                  ? 'bg-green-600 hover:bg-green-700'
                  : decision === 'reject'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-slate-400 cursor-not-allowed'
              }`}
            >
              {submitting ? 'Processing...' : decision === 'approve' ? 'Approve Agent' : 'Reject Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
