import { useState } from 'react';
import {
  Users, MessageSquare, TrendingUp, Zap,
  ArrowUpRight, ArrowDownRight, Clock, Plus, Filter, MoreHorizontal
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';

import { Card, Button, Badge } from '../../components';

const mockData = [
  { name: 'Mon', conversations: 400, leads: 240 },
  { name: 'Tue', conversations: 300, leads: 139 },
  { name: 'Wed', conversations: 550, leads: 380 },
  { name: 'Thu', conversations: 450, leads: 290 },
  { name: 'Fri', conversations: 600, leads: 480 },
  { name: 'Sat', conversations: 350, leads: 200 },
  { name: 'Sun', conversations: 250, leads: 150 },
];

const mockRecentConversations = [
  { id: 1, name: 'Alex Thompson', channel: 'WhatsApp', status: 'Hot', time: '2 mins ago', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: 2, name: 'Sarah Chen', channel: 'Instagram', status: 'Warm', time: '15 mins ago', avatar: 'https://i.pravatar.cc/150?img=9' },
  { id: 3, name: 'Michael Brown', channel: 'Website', status: 'Cold', time: '1 hour ago', avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: 4, name: 'Elena Rodriguez', channel: 'WhatsApp', status: 'Hot', time: '2 hours ago', avatar: 'https://i.pravatar.cc/150?img=5' },
];

function StatCard({ title, value, change, isPositive, icon: Icon, colorClass }) {
  return (
    <div className="bg-white rounded-[24px] p-6 border border-gray-100 shadow-[0_4px_20px_rgba(0,0,0,0.02)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 group">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center \${colorClass} shadow-sm transition-transform group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className={`flex items-center gap-1 text-[13px] font-bold px-2.5 py-1 rounded-full \${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
          {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          <span>{change}</span>
        </div>
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-gray-500 mb-1">{title}</h3>
        <div className="text-[32px] font-bold text-gray-900 tracking-tight leading-none bg-clip-text">
          {value}
        </div>
      </div>
    </div>
  );
}

function Dashboard() {
  const [timeRange, setTimeRange] = useState('7d');

  return (
    <div className="h-full bg-[#FAFCFF] p-6 md:p-8 space-y-8 overflow-auto selection:bg-blue-100">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-[fadeIn_0.5s_ease-out]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-[12px] font-bold mb-3 text-blue-600 shadow-sm">
            <Zap className="w-3 h-3 fill-blue-600" /> Live Updates
          </div>
          <h1 className="text-3xl md:text-[36px] font-extrabold text-gray-900 tracking-tight leading-none">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500">Alex</span>
          </h1>
          <p className="text-[15px] text-gray-500 mt-2 font-medium">Here's what your AI agent has been up to today.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-full px-5 py-2.5 pr-10 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm transition-all cursor-pointer"
            >
              <option value="today">Today</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500">
              <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
            </div>
          </div>
          <button className="flex items-center gap-2 bg-[#0066FF] hover:bg-blue-700 text-white px-6 py-2.5 rounded-full text-[14px] font-bold transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:-translate-y-0.5 active:translate-y-0">
            <Plus className="w-4 h-4" /> New Campaign
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-[fadeIn_0.6s_ease-out]">
        <StatCard title="Total Leads" value="1,248" change="+12.5%" isPositive={true} icon={Users} colorClass="bg-blue-50 text-blue-600 border border-blue-100" />
        <StatCard title="Active Chats" value="342" change="+5.2%" isPositive={true} icon={MessageSquare} colorClass="bg-purple-50 text-purple-600 border border-purple-100" />
        <StatCard title="Conversion Rate" value="8.4%" change="+1.2%" isPositive={true} icon={TrendingUp} colorClass="bg-emerald-50 text-emerald-600 border border-emerald-100" />
        <StatCard title="Avg. Response" value="1m 12s" change="-18s" isPositive={true} icon={Clock} colorClass="bg-orange-50 text-orange-600 border border-orange-100" />
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
              <AreaChart data={mockData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
            {mockRecentConversations.map((conv) => (
              <div key={conv.id} className="group flex items-center justify-between rounded-[16px] border border-transparent p-3 hover:bg-blue-50/50 hover:border-blue-100/50 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img src={conv.avatar} alt={conv.name} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                    <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white \${conv.channel === 'WhatsApp' ? 'bg-emerald-500' : 'bg-pink-500'}`}></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900 text-[14px] group-hover:text-blue-600 transition-colors">{conv.name}</span>
                    <span className="text-[12px] font-semibold text-gray-400">{conv.channel} • {conv.time}</span>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider
                   \${conv.status === 'Hot' ? 'bg-rose-100 text-rose-600' : 
                     conv.status === 'Warm' ? 'bg-orange-100 text-orange-600' : 
                     'bg-blue-100 text-blue-600'}`}>
                  {conv.status}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-5 border-t border-gray-100 relative z-10">
            <button className="w-full py-3 rounded-xl bg-gray-50 hover:bg-blue-50 border border-gray-100 hover:border-blue-200 text-[14px] font-bold text-gray-700 hover:text-blue-700 transition-all">
              View All Leads
            </button>
          </div>
        </div>
      </div>

    </div>
  );
}

export default Dashboard;
