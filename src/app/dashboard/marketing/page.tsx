'use client';

import { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface MarketingMetrics {
  name: string;
  conversions: number;
  abandoned: number;
  revenue: number;
}

interface EngagementData {
  time: string;
  messages: number;
  clicks: number;
  bookings: number;
}

interface CampaignStatus {
  id: string;
  name: string;
  type: 'whatsapp' | 'sms' | 'email' | 'push';
  status: 'active' | 'scheduled' | 'completed' | 'paused';
  sent: number;
  opened: number;
  clicked: number;
  converted: number;
  revenue: number;
  createdAt: string;
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function MarketingPage() {
  const [metrics, setMetrics] = useState<MarketingMetrics[]>([]);
  const [engagement, setEngagement] = useState<EngagementData[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCampaign, setNewCampaign] = useState({
    name: '',
    type: 'whatsapp' as const,
    schedule: '',
  });
  const [showCampaignForm, setShowCampaignForm] = useState(false);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      // Fetch marketing metrics
      const [metricsRes, engagementRes, campaignsRes] = await Promise.all([
        fetch('/api/marketing/metrics'),
        fetch('/api/marketing/engagement'),
        fetch('/api/marketing/campaigns'),
      ]);

      if (metricsRes.ok) {
        const metricsData = await metricsRes.json();
        setMetrics(metricsData);
      }

      if (engagementRes.ok) {
        const engagementData = await engagementRes.json();
        setEngagement(engagementData);
      }

      if (campaignsRes.ok) {
        const campaignsData = await campaignsRes.json();
        setCampaigns(campaignsData);
      }
    } catch (error) {
      console.error('Error fetching metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCampaign = async () => {
    if (!newCampaign.name || !newCampaign.schedule) {
      alert('Please fill in all fields');
      return;
    }

    try {
      const response = await fetch('/api/marketing/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCampaign),
      });

      if (response.ok) {
        alert('Campaign created successfully');
        setNewCampaign({ name: '', type: 'whatsapp', schedule: '' });
        setShowCampaignForm(false);
        fetchMetrics();
      }
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert('Failed to create campaign');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-slate-100 text-slate-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  const getTotalRevenue = () => campaigns.reduce((sum, c) => sum + (c.revenue || 0), 0);
  const getTotalSent = () => campaigns.reduce((sum, c) => sum + (c.sent || 0), 0);
  const getAvgOpenRate = () => {
    const total = campaigns.length;
    if (total === 0) return 0;
    const avgOpened = campaigns.reduce((sum, c) => sum + (c.opened / (c.sent || 1)), 0) / total;
    return (avgOpened * 100).toFixed(1);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="mt-4 text-slate-600">Loading marketing data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Growth Automation</h1>
          <p className="text-slate-600 mt-1">Marketing campaigns and user engagement automation</p>
        </div>
        <button
          onClick={() => setShowCampaignForm(!showCampaignForm)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          + New Campaign
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="text-sm font-medium text-slate-500 uppercase">Total Revenue</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{getTotalRevenue().toLocaleString()} ZMW</div>
          <p className="text-xs text-green-600 mt-2">↑ From campaigns</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="text-sm font-medium text-slate-500 uppercase">Messages Sent</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{getTotalSent().toLocaleString()}</div>
          <p className="text-xs text-blue-600 mt-2">Across all channels</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="text-sm font-medium text-slate-500 uppercase">Avg Open Rate</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{getAvgOpenRate()}%</div>
          <p className="text-xs text-orange-600 mt-2">WhatsApp + SMS</p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <div className="text-sm font-medium text-slate-500 uppercase">Active Campaigns</div>
          <div className="text-3xl font-bold text-slate-900 mt-2">{campaigns.filter(c => c.status === 'active').length}</div>
          <p className="text-xs text-purple-600 mt-2">Running now</p>
        </div>
      </div>

      {/* New Campaign Form */}
      {showCampaignForm && (
        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
          <h2 className="text-xl font-bold text-slate-900">Create New Campaign</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Campaign Name</label>
              <input
                type="text"
                value={newCampaign.name}
                onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                placeholder="e.g., Weekend Flash Sale"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Channel</label>
              <select
                value={newCampaign.type}
                onChange={(e) => setNewCampaign({ ...newCampaign, type: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="whatsapp">WhatsApp</option>
                <option value="sms">SMS</option>
                <option value="email">Email</option>
                <option value="push">Push Notification</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Schedule Time</label>
              <input
                type="datetime-local"
                value={newCampaign.schedule}
                onChange={(e) => setNewCampaign({ ...newCampaign, schedule: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setShowCampaignForm(false)}
              className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateCampaign}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              Create Campaign
            </button>
          </div>
        </div>
      )}

      {/* Engagement Timeline */}
      <div className="bg-white rounded-lg border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-4">Daily Engagement Timeline</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={engagement}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="messages" stroke="#3B82F6" strokeWidth={2} />
            <Line type="monotone" dataKey="clicks" stroke="#10B981" strokeWidth={2} />
            <Line type="monotone" dataKey="bookings" stroke="#F59E0B" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Campaigns Table */}
      <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-900">Active & Recent Campaigns</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Campaign</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Channel</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Sent</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Opened</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Clicked</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Converted</th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-slate-900">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {campaigns.map((campaign) => {
                const openRate = campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(1) : 0;
                const clickRate = campaign.sent > 0 ? ((campaign.clicked / campaign.sent) * 100).toFixed(1) : 0;
                const conversionRate = campaign.sent > 0 ? ((campaign.converted / campaign.sent) * 100).toFixed(1) : 0;

                return (
                  <tr key={campaign.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 text-sm">
                      <div className="font-medium text-slate-900">{campaign.name}</div>
                      <div className="text-xs text-slate-500 mt-1">{new Date(campaign.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 capitalize">{campaign.type}</td>
                    <td className="px-6 py-4 text-sm">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-right text-slate-900 font-medium">{campaign.sent.toLocaleString()}</td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="text-slate-900">{campaign.opened.toLocaleString()}</div>
                      <div className="text-xs text-green-600">{openRate}%</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="text-slate-900">{campaign.clicked.toLocaleString()}</div>
                      <div className="text-xs text-blue-600">{clickRate}%</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-right">
                      <div className="text-slate-900">{campaign.converted.toLocaleString()}</div>
                      <div className="text-xs text-orange-600">{conversionRate}%</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-right font-medium text-slate-900">
                      {campaign.revenue.toLocaleString()} ZMW
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Conversion Funnel Analysis</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="conversions" fill="#3B82F6" name="Converted Bookings" />
              <Bar dataKey="abandoned" fill="#EF4444" name="Abandoned Carts" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Marketing Automation Features */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Automation Features</h2>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">✓</div>
              <div>
                <div className="font-medium text-slate-900">Abandoned Booking Recovery</div>
                <div className="text-xs text-slate-600">Auto-remind users within 1 hour</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-8 h-8 bg-green-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">✓</div>
              <div>
                <div className="font-medium text-slate-900">Price Drop Alerts</div>
                <div className="text-xs text-slate-600">Notify when fares decrease on favorite routes</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
              <div className="w-8 h-8 bg-orange-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">✓</div>
              <div>
                <div className="font-medium text-slate-900">Seat Availability Alerts</div>
                <div className="text-xs text-slate-600">Urgent notifications when seats fill up</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
              <div className="w-8 h-8 bg-purple-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">✓</div>
              <div>
                <div className="font-medium text-slate-900">Smart Time-Based Offers</div>
                <div className="text-xs text-slate-600">Morning deals, midday flash sales, evening specials</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
