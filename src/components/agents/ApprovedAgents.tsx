'use client';

import { useState } from 'react';



interface ApprovedAgentsProps {
  agents: Agent[];
  onUpdate: () => Promise<void>;
}

export default function ApprovedAgents({
  agents,
  onUpdate,
}: ApprovedAgentsProps) {
  const [suspendingId, setSuspendingId] = useState<number | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [showSuspendModal, setShowSuspendModal] = useState(false);

  const handleSuspend = (agentId: number) => {
    setSuspendingId(agentId);
    setShowSuspendModal(true);
  };

  const submitSuspension = async () => {
    if (!suspensionReason.trim()) {
      alert('Please provide a suspension reason');
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/agents/${suspendingId}/suspend`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ suspensionReason }),
        }
      );

      if (!response.ok) throw new Error('Failed to suspend agent');

      alert('Agent has been suspended');
      setShowSuspendModal(false);
      setSuspendingId(null);
      setSuspensionReason('');
      await onUpdate();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to suspend agent');
    }
  };

  const handleReactivate = async (agentId: number) => {
    if (!window.confirm('Reactivate this agent?')) return;

    try {
      const response = await fetch(
        `/api/admin/agents/${agentId}/reactivate`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) throw new Error('Failed to reactivate agent');

      alert('Agent has been reactivated');
      await onUpdate();
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to reactivate agent');
    }
  };

  if (agents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-600">No agents in this category.</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Agent Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Phone
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">
                  Since
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {agents.map((agent) => (
                <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 text-sm">
                    <div className="font-medium text-slate-900">
                      {agent.firstName} {agent.lastName}
                    </div>
                    {agent.email && (
                      <div className="text-xs text-slate-600">{agent.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {agent.phoneNumber}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {agent.locationCity || 'Not specified'}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    <div>{agent.idType.replace('_', ' ')}</div>
                    <div className="text-xs text-slate-500">{agent.idNumber}</div>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        agent.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {agent.status === 'approved' ? 'Active' : 'Suspended'}
                    </span>
                    {agent.suspensionReason && (
                      <div className="text-xs text-red-600 mt-1">
                        {agent.suspensionReason}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-600">
                    {agent.approvedAt || agent.suspendedAt
                      ? new Date(
                        // @ts-ignore
                          agent.approvedAt || agent.suspendedAt
                        ).toLocaleDateString('en-ZM', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-right space-x-2">
                    {agent.status === 'approved' ? (
                      <button
                        onClick={() => handleSuspend(agent.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        Suspend
                      </button>
                    ) : (
                      <button
                        onClick={() => handleReactivate(agent.id)}
                        className="text-green-600 hover:text-green-800 font-medium"
                      >
                        Reactivate
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Suspension Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Suspend Agent</h2>
            <p className="text-slate-600">
              Are you sure you want to suspend this agent? They will not be able to see new requests.
            </p>

            <textarea
              value={suspensionReason}
              onChange={(e) => setSuspensionReason(e.target.value)}
              placeholder="Suspension reason..."
              rows={3}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowSuspendModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={submitSuspension}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
              >
                Suspend
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
