'use client';

import { useState } from 'react';
import AgentApprovalModal from './AgentApprovalModal';

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
  createdAt: Date;
}

interface AgentApplicationsProps {
  agents: Agent[];
  onUpdate: () => Promise<void>;
}

export default function AgentApplications({
  agents,
  onUpdate,
}: AgentApplicationsProps) {
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleReview = (agent: Agent) => {
    setSelectedAgent(agent);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedAgent(null);
  };

  const handleDecision = async () => {
    await onUpdate();
    handleModalClose();
  };

  if (agents.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center">
        <p className="text-slate-600">No pending applications at the moment.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-white rounded-lg border border-slate-200 overflow-hidden hover:shadow-lg transition-shadow"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">
                {agent.firstName} {agent.lastName}
              </h3>
              <p className="text-sm text-slate-600">{agent.phoneNumber}</p>
            </div>

            {/* Details */}
            <div className="px-6 py-4 space-y-3">
              {/* ID */}
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">
                  ID Type
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {agent.idType.replace('_', ' ')} - {agent.idNumber}
                </p>
              </div>

              {/* Location */}
              {agent.locationCity && (
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">
                    Location
                  </label>
                  <p className="text-sm text-slate-900 mt-1">
                    {agent.locationCity}
                    {agent.locationAddress && `, ${agent.locationAddress}`}
                  </p>
                </div>
              )}

              {/* Email */}
              {agent.email && (
                <div>
                  <label className="text-xs font-medium text-slate-500 uppercase">
                    Email
                  </label>
                  <p className="text-sm text-slate-900 mt-1 break-all">
                    {agent.email}
                  </p>
                </div>
              )}

              {/* Applied Date */}
              <div>
                <label className="text-xs font-medium text-slate-500 uppercase">
                  Applied On
                </label>
                <p className="text-sm text-slate-900 mt-1">
                  {new Date(agent.createdAt).toLocaleDateString('en-ZM', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>

            {/* Action */}
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-200">
              <button
                onClick={() => handleReview(agent)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
              >
                Review Application
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Approval Modal */}
      {showModal && selectedAgent && (
        <AgentApprovalModal
          agent={selectedAgent}
          onClose={handleModalClose}
          onDecision={handleDecision}
        />
      )}
    </>
  );
}
