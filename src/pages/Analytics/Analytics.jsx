import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Users, Loader2, Download, Calendar, ArrowRight } from 'lucide-react';
import { PageHeader, StatCard, Button } from '../../components';
import { analyticsService, leadService } from '../../services';

const FUNNEL_STAGES = [
  { key: 'new', label: 'New Leads', color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { key: 'qualified', label: 'Qualified', color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  { key: 'contacted', label: 'Contacted', color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  { key: 'booked', label: 'Booked', color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { key: 'won', label: 'Won', color: 'from-green-500 to-green-600', bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
];

export default function Analytics() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      try {
        const data = await analyticsService.getSummary();
        setSummary(data);
      } catch (err) {
        console.error('Failed to fetch analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [dateRange]);

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      const data = await leadService.getLeads({ page: 1, pageSize: 1000 });
      const items = data.items || data.data || [];
      if (items.length === 0) { alert('No leads to export'); return; }

      const headers = ['Name', 'Email', 'Phone', 'Score', 'Stage', 'Procedure', 'Budget', 'Timeframe', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Page URL', 'Created At'];
      const rows = items.map(l => [
        l.name || '', l.email || '', l.phone || '', l.score || '', l.stage || '',
        l.procedure || '', l.budget_range || '', l.timeframe || '',
        l.utm_source || '', l.utm_medium || '', l.utm_campaign || '',
        l.page_url || '',
        l.created_at ? new Date(l.created_at).toISOString().split('T')[0] : '',
      ]);

      const csvContent = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export:', err);
    } finally {
      setExporting(false);
    }
  };

  const stats = summary
    ? [
        { label: 'Total Leads', value: summary.total_leads?.toLocaleString() ?? '0', change: `${summary.leads_by_score?.hot ?? 0} hot`, isUp: true, icon: Users, colorClass: 'bg-blue-50 text-blue-600 border border-blue-100' },
        { label: 'Hot Leads', value: (summary.leads_by_score?.hot ?? 0).toLocaleString(), change: 'Needs attention', isUp: true, icon: TrendingUp, colorClass: 'bg-orange-50 text-orange-600 border border-orange-100' },
        { label: 'Warm Leads', value: (summary.leads_by_score?.warm ?? 0).toLocaleString(), change: 'Follow up', isUp: true, icon: TrendingUp, colorClass: 'bg-yellow-50 text-yellow-600 border border-yellow-100' },
        { label: 'Widget Events', value: summary.total_widget_events?.toLocaleString() ?? '0', change: 'All time', isUp: true, icon: BarChart3, colorClass: 'bg-purple-50 text-purple-600 border border-purple-100' },
      ]
    : [];

  const stages = summary?.leads_by_stage ?? {};
  const totalLeads = summary?.total_leads ?? 0;

  // Calculate funnel conversion rates
  const funnelData = FUNNEL_STAGES.map((s, i) => {
    const count = stages[s.key] ?? 0;
    const pct = totalLeads > 0 ? Math.round((count / totalLeads) * 100) : 0;
    return { ...s, count, pct };
  });

  // Cumulative funnel: from largest to smallest
  const funnelCumulative = FUNNEL_STAGES.map((s, i) => {
    const cumCount = FUNNEL_STAGES.slice(i).reduce((sum, fs) => sum + (stages[fs.key] ?? 0), 0);
    const pct = totalLeads > 0 ? Math.round((cumCount / totalLeads) * 100) : 0;
    return { ...s, count: cumCount, pct };
  });

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl p-8 overflow-auto">
      <PageHeader
        title={<span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-blue-600">Analytics</span>}
        description="Track the performance of your widget and conversion funnel."
        className="mb-8"
        actions={
          <>
            <div className="relative">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="appearance-none bg-white border border-gray-200 text-gray-700 text-sm font-semibold rounded-xl px-4 py-2.5 pr-10 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 shadow-sm cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="7d">Last 7 Days</option>
                <option value="30d">Last 30 Days</option>
                <option value="90d">Last 90 Days</option>
              </select>
              <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
            <Button
              variant="secondary"
              className="gap-2 shrink-0"
              onClick={handleExportCSV}
              disabled={exporting}
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4 text-gray-500" />}
              <span className="text-gray-600">Export CSV</span>
            </Button>
          </>
        }
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <StatCard
                key={stat.label}
                title={stat.label}
                value={stat.value}
                change={stat.change}
                isPositive={stat.isUp}
                icon={stat.icon}
                colorClass={stat.colorClass}
              />
            ))}
          </div>

          {/* Conversion Funnel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-2">Conversion Funnel</h2>
            <p className="text-sm text-slate-500 mb-6">Lead progression through your pipeline stages</p>

            <div className="space-y-3">
              {funnelCumulative.map((stage, i) => {
                const maxWidth = Math.max(stage.pct, 8); // minimum bar width
                return (
                  <div key={stage.key} className="flex items-center gap-4">
                    <div className="w-24 text-sm font-semibold text-slate-700 shrink-0">{stage.label}</div>
                    <div className="flex-1 relative">
                      <div className="w-full bg-slate-100 rounded-full h-10 overflow-hidden">
                        <div
                          className={`h-full bg-gradient-to-r ${stage.color} rounded-full flex items-center justify-end pr-3 transition-all duration-700`}
                          style={{ width: `${maxWidth}%` }}
                        >
                          <span className="text-white text-sm font-bold">{stage.count}</span>
                        </div>
                      </div>
                    </div>
                    <div className="w-16 text-right text-sm font-bold text-slate-600">{stage.pct}%</div>
                    {i < funnelCumulative.length - 1 && (
                      <div className="w-8 text-center">
                        <ArrowRight className="w-4 h-4 text-slate-300 mx-auto" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Drop-off indicators */}
            {funnelCumulative.length > 1 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-600 mb-3">Drop-off Analysis</h3>
                <div className="flex flex-wrap gap-3">
                  {funnelCumulative.slice(0, -1).map((stage, i) => {
                    const next = funnelCumulative[i + 1];
                    const dropoff = stage.count > 0 ? Math.round(((stage.count - next.count) / stage.count) * 100) : 0;
                    return (
                      <div key={stage.key} className={`px-4 py-2 rounded-xl border ${stage.border} ${stage.bg}`}>
                        <div className="text-xs font-semibold text-slate-500">{stage.label} → {next.label}</div>
                        <div className={`text-lg font-bold ${dropoff > 50 ? 'text-red-600' : dropoff > 30 ? 'text-orange-600' : 'text-green-600'}`}>
                          {dropoff}% drop
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Leads by Stage Breakdown */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Leads by Stage</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {['new', 'qualified', 'contacted', 'booked', 'won', 'lost'].map((stage) => {
                const colors = {
                  new: 'bg-blue-50 text-blue-700 border-blue-200',
                  qualified: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                  contacted: 'bg-purple-50 text-purple-700 border-purple-200',
                  booked: 'bg-emerald-50 text-emerald-700 border-emerald-200',
                  won: 'bg-green-50 text-green-700 border-green-200',
                  lost: 'bg-red-50 text-red-700 border-red-200',
                };
                return (
                  <div key={stage} className={`rounded-xl border p-4 text-center ${colors[stage]}`}>
                    <div className="text-2xl font-bold">{(stages[stage] ?? 0).toLocaleString()}</div>
                    <div className="text-xs font-semibold uppercase mt-1 tracking-wider">{stage}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Leads by Score */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Leads by Score</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-orange-50 border border-orange-200">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-2xl">🔥</div>
                <div>
                  <div className="text-2xl font-bold text-orange-700">{(summary?.leads_by_score?.hot ?? 0).toLocaleString()}</div>
                  <div className="text-sm font-medium text-orange-600">Hot Leads</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
                <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-2xl">🌤</div>
                <div>
                  <div className="text-2xl font-bold text-yellow-700">{(summary?.leads_by_score?.warm ?? 0).toLocaleString()}</div>
                  <div className="text-sm font-medium text-yellow-600">Warm Leads</div>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 border border-blue-200">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-2xl">❄️</div>
                <div>
                  <div className="text-2xl font-bold text-blue-700">{(summary?.leads_by_score?.cold ?? 0).toLocaleString()}</div>
                  <div className="text-sm font-medium text-blue-600">Cold Leads</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
