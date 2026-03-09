import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, MessageSquare, TrendingUp, Zap,
  ArrowUpRight, Clock, Plus, MoreHorizontal, Loader2, BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

import { Card, Button, Badge, StatCard } from '../../components';
import useAuthStore from '../../stores/authStore';
import { analyticsService, leadService } from '../../services';

const mockChartData = [
  { name: 'Mon', conversations: 0, leads: 0 },
  { name: 'Tue', conversations: 0, leads: 0 },
  { name: 'Wed', conversations: 0, leads: 0 },
  { name: 'Thu', conversations: 0, leads: 0 },
  { name: 'Fri', conversations: 0, leads: 0 },
  { name: 'Sat', conversations: 0, leads: 0 },
  { name: 'Sun', conversations: 0, leads: 0 },
];

function Dashboard() {
  const [timeRange, setTimeRange] = useState('7d');
  const [analytics, setAnalytics] = useState(null);
  const [recentLeads, setRecentLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [summaryData, leadsData] = await Promise.all([
          analyticsService.getSummary(),
          leadService.getLeads({ page: 1, pageSize: 5 }),
        ]);
        setAnalytics(summaryData);
        setRecentLeads(leadsData.items || leadsData.data || []);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalLeads = analytics?.total_leads ?? 0;
  const hotLeads = analytics?.leads_by_score?.hot ?? 0;
  const warmLeads = analytics?.leads_by_score?.warm ?? 0;
  const coldLeads = analytics?.leads_by_score?.cold ?? 0;
  const totalEvents = analytics?.total_widget_events ?? 0;
  const leadsByStage = analytics?.leads_by_stage ?? {};
  const userName = user?.full_name?.split(' ')[0] || 'there';

  return (
    <div className="h-full bg-[#FAFCFF] p-4 md:p-8 space-y-6 md:space-y-8 overflow-auto no-scrollbar selection:bg-blue-100">

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 animate-[fadeIn_0.5s_ease-out]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-[10px] md:text-[12px] font-bold mb-3 text-blue-600 shadow-sm">
            <Zap className="w-3 h-3 fill-blue-600" /> Live Updates
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-[36px] font-extrabold text-gray-900 tracking-tight leading-tight">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">{userName}</span>
          </h1>
          <p className="text-sm md:text-[15px] text-gray-500 mt-2 font-medium">Here's what your AI agent has been up to today.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-auto">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="w-full appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-full px-5 py-2.5 pr-10 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </div>
          </div>
          <button
            onClick={() => navigate('/scenarios')}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#0066FF] hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-[14px] font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0"
          >
            <Plus className="w-4 h-4" /> New Scenario
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-[fadeIn_0.6s_ease-out]">
        <StatCard title="Total Leads" value={loading ? '—' : totalLeads.toLocaleString()} change={`${hotLeads} hot`} isPositive={true} icon={Users} colorClass="bg-blue-50 text-blue-600 border border-blue-100" />
        <StatCard title="Widget Events" value={loading ? '—' : totalEvents.toLocaleString()} change="All time" isPositive={true} icon={MessageSquare} colorClass="bg-purple-50 text-purple-600 border border-purple-100" />
        <StatCard title="Hot Leads" value={loading ? '—' : hotLeads.toLocaleString()} change={`${warmLeads} warm`} isPositive={true} icon={TrendingUp} colorClass="bg-emerald-50 text-emerald-600 border border-emerald-100" />
        <StatCard title="New Leads" value={loading ? '—' : (leadsByStage.new ?? 0).toLocaleString()} change={`${leadsByStage.qualified ?? 0} qualified`} isPositive={true} icon={Clock} colorClass="bg-orange-50 text-orange-600 border border-orange-100" />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-[fadeIn_0.65s_ease-out]">
        {[
          { label: 'View Pipeline', path: '/pipeline', icon: TrendingUp, color: 'from-blue-500 to-indigo-500' },
          { label: 'All Leads', path: '/leads', icon: Users, color: 'from-emerald-500 to-teal-500' },
          { label: 'Knowledge Base', path: '/knowledge-base', icon: MessageSquare, color: 'from-purple-500 to-pink-500' },
          { label: 'Analytics', path: '/analytics', icon: BarChart3, color: 'from-orange-500 to-red-500' },
        ].map((action) => (
          <button
            key={action.path}
            onClick={() => navigate(action.path)}
            className="group flex items-center gap-3 bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform`}>
              <action.icon className="w-5 h-5" />
            </div>
            <span className="text-[14px] font-bold text-gray-700 group-hover:text-gray-900">{action.label}</span>
            <ArrowUpRight className="w-4 h-4 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeIn_0.7s_ease-out]">

        {/* Activity Chart */}
        <div className="lg:col-span-2 bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-full">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">Conversation Activity</h2>
              <p className="text-sm text-gray-500 mt-1 font-medium">Total volume across all integrated channels</p>
            </div>
            <div className="flex bg-gray-50 border border-gray-100 rounded-full p-1">
              <button className="px-4 py-1.5 text-[13px] font-bold rounded-full bg-white text-gray-900 shadow-sm">Overview</button>
              <button className="px-4 py-1.5 text-[13px] font-bold rounded-full text-gray-500 hover:text-gray-900 transition-colors">By Channel</button>
            </div>
          </div>

          <div className="h-[300px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={mockChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorConversations" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0066FF" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#F3F4F6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 13, fontWeight: 500 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 13, fontWeight: 500 }} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '16px',
                    border: 'none',
                    boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(8px)',
                    padding: '12px 16px',
                    fontWeight: 600
                  }}
                  itemStyle={{ fontSize: '14px', fontWeight: 600 }}
                  labelStyle={{ color: '#6B7280', marginBottom: '8px', fontSize: '13px', fontWeight: 500 }}
                />
                <Area type="monotone" dataKey="conversations" stroke="#0066FF" strokeWidth={3} fillOpacity={1} fill="url(#colorConversations)" activeDot={{ r: 6, strokeWidth: 0, fill: '#0066FF' }} />
                <Area type="monotone" dataKey="leads" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorLeads)" activeDot={{ r: 6, strokeWidth: 0, fill: '#10B981' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-6 mt-6 justify-center text-sm font-semibold">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#0066FF] shadow-[0_0_8px_rgba(0,102,255,0.4)]"></span>
              <span className="text-gray-700">Total Conversations</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"></span>
              <span className="text-gray-700">Qualified Leads</span>
            </div>
          </div>
        </div>

        {/* Recent Conversations List */}
        <div className="bg-white rounded-[24px] p-6 md:p-8 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] flex flex-col h-full relative overflow-hidden">
          {/* Subtle gradient blob behind the recent leads */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

          <div className="mb-6 flex items-center justify-between relative z-10">
            <div>
              <h2 className="text-[20px] font-bold text-gray-900 tracking-tight">Recent Leads</h2>
              <p className="text-[13px] text-gray-500 font-medium">Needs attention ASAP</p>
            </div>
            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-col gap-3 relative z-10 overflow-hidden flex-grow">
            {loading ? (
              <div className="flex items-center justify-center flex-1">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="flex items-center justify-center flex-1 text-sm text-gray-400">No leads yet</div>
            ) : (
              recentLeads.slice(0, 5).map((lead) => (
                <div key={lead.id} onClick={() => navigate('/leads')} className="group flex items-center justify-between rounded-[16px] border border-transparent p-3 hover:bg-blue-50/50 hover:border-blue-100/50 transition-all cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-sm">
                        {(lead.name || 'U')[0].toUpperCase()}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 text-[14px] group-hover:text-blue-600 transition-colors">{lead.name || 'Unknown'}</span>
                      <span className="text-[12px] font-semibold text-gray-400">{lead.email || lead.phone || '—'}</span>
                    </div>
                  </div>
                  <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
                     ${lead.score === 'hot' ? 'bg-rose-100 text-rose-600' :
                      lead.score === 'warm' ? 'bg-orange-100 text-orange-600' :
                        'bg-blue-100 text-blue-600'}`}>
                    {lead.score || 'cold'}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 relative z-10">
            <button
              onClick={() => navigate('/leads')}
              className="w-full py-3 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 text-[14px] font-bold text-gray-700 hover:text-blue-700 transition-all flex items-center justify-center gap-2"
            >
              View All Leads
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
