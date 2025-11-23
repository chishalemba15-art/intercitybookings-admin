'use client';

import { useEffect, useState } from 'react';
import AgentApplications from '@/components/agents/AgentApplications';
import ApprovedAgents from '@/components/agents/ApprovedAgents';



type TabType = 'pending' | 'approved' | 'suspended';

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('pending');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/agents');
      if (!response.ok) throw new Error('Failed to fetch agents');
      const data = await response.json();
      setAgents(data);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAgentUpdate = async () => {
    await fetchAgents();
  };

  const filteredAgents = agents.filter((agent) => {
    if (activeTab === 'pending') return agent.status === 'pending_review';
    if (activeTab === 'approved') return agent.status === 'approved';
    if (activeTab === 'suspended') return agent.status === 'suspended';
    return false;
  });

  const pendingCount = agents.filter((a) => a.status === 'pending_review').length;
  const approvedCount = agents.filter((a) => a.status === 'approved').length;
  const suspendedCount = agents.filter((a) => a.status === 'suspended').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Ticket Agents</h1>
        <p className="text-slate-600 mt-1">Manage agent applications, approvals, and performance</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="text-sm font-medium opacity-90">Pending Review</div>
          <div className="text-3xl font-bold mt-2">{pendingCount}</div>
          <p className="text-sm opacity-75 mt-2">Applications awaiting approval</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="text-sm font-medium opacity-90">Approved Agents</div>
          <div className="text-3xl font-bold mt-2">{approvedCount}</div>
          <p className="text-sm opacity-75 mt-2">Active agents</p>
        </div>
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-lg p-6 text-white">
          <div className="text-sm font-medium opacity-90">Suspended</div>
          <div className="text-3xl font-bold mt-2">{suspendedCount}</div>
          <p className="text-sm opacity-75 mt-2">Inactive agents</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        {(['pending', 'approved', 'suspended'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 border-b-2 font-medium transition-colors ${
              activeTab === tab
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab === 'pending' && 'Pending Applications'}
            {tab === 'approved' && 'Approved Agents'}
            {tab === 'suspended' && 'Suspended Agents'}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-slate-600">Loading agents...</p>
        </div>
      ) : (
        <>
          {activeTab === 'pending' && (
            <AgentApplications agents={filteredAgents} onUpdate={handleAgentUpdate} />
          )}
          {activeTab === 'approved' && (
            <ApprovedAgents agents={filteredAgents} onUpdate={handleAgentUpdate} />
          )}
          {activeTab === 'suspended' && (
            <ApprovedAgents agents={filteredAgents} onUpdate={handleAgentUpdate} />
          )}
        </>
      )}
    </div>
  );
}
