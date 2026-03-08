import { useState, useEffect, useCallback } from 'react';
import { Search, SlidersHorizontal, Loader2, ArrowUpRight, GripVertical, X } from 'lucide-react';
import { Button, Input, PageHeader } from '../../components';
import { leadService } from '../../services';

const PIPELINE_STAGES = [
  { id: 'new', title: 'New', color: 'bg-blue-500', lightColor: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: 'qualified', title: 'Qualified', color: 'bg-indigo-500', lightColor: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { id: 'contacted', title: 'Contacted', color: 'bg-purple-500', lightColor: 'bg-purple-50 border-purple-200 text-purple-700' },
  { id: 'booked', title: 'Booked', color: 'bg-emerald-500', lightColor: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
  { id: 'won', title: 'Won', color: 'bg-green-500', lightColor: 'bg-green-50 border-green-200 text-green-700' },
  { id: 'lost', title: 'Lost', color: 'bg-red-500', lightColor: 'bg-red-50 border-red-200 text-red-700' },
];

const scoreColors = {
  hot: 'bg-rose-100 text-rose-600',
  warm: 'bg-orange-100 text-orange-600',
  cold: 'bg-blue-100 text-blue-600',
};

const scoreEmoji = { hot: '🔥', warm: '🌤', cold: '❄️' };

export default function LeadManagement() {
  const [leadsByStage, setLeadsByStage] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [dragging, setDragging] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all leads (high page_size to get them all for kanban view)
      const data = await leadService.getLeads({ page: 1, pageSize: 100, search: search || undefined });
      const items = data.items || data.data || [];

      // Group by stage
      const grouped = {};
      PIPELINE_STAGES.forEach(s => { grouped[s.id] = []; });
      items.forEach(lead => {
        const stage = lead.stage || 'new';
        if (grouped[stage]) grouped[stage].push(lead);
        else grouped['new'].push(lead);
      });
      setLeadsByStage(grouped);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleDragStart = (e, lead) => {
    setDragging(lead);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', lead.id);
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stageId);
  };

  const handleDragLeave = () => { setDragOverStage(null); };

  const handleDrop = async (e, newStageId) => {
    e.preventDefault();
    setDragOverStage(null);
    if (!dragging || dragging.stage === newStageId) { setDragging(null); return; }

    // Optimistic update
    setLeadsByStage(prev => {
      const updated = { ...prev };
      const oldStage = dragging.stage || 'new';
      updated[oldStage] = updated[oldStage].filter(l => l.id !== dragging.id);
      updated[newStageId] = [...updated[newStageId], { ...dragging, stage: newStageId }];
      return updated;
    });

    try {
      await leadService.updateLead(dragging.id, { stage: newStageId });
    } catch (err) {
      console.error('Failed to update stage:', err);
      fetchLeads(); // rollback
    }
    setDragging(null);
  };

  const handleMoveStage = async (lead, newStage) => {
    setLeadsByStage(prev => {
      const updated = { ...prev };
      const oldStage = lead.stage || 'new';
      updated[oldStage] = updated[oldStage].filter(l => l.id !== lead.id);
      updated[newStage] = [...updated[newStage], { ...lead, stage: newStage }];
      return updated;
    });
    try {
      await leadService.updateLead(lead.id, { stage: newStage });
    } catch (err) {
      console.error('Failed to update stage:', err);
      fetchLeads();
    }
  };

  const openLeadDetail = async (leadId) => {
    setDetailLoading(true);
    setSelectedLead(null);
    try {
      const detail = await leadService.getLead(leadId);
      setSelectedLead(detail);
    } catch (err) { console.error('Failed to fetch lead detail:', err); }
    finally { setDetailLoading(false); }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days}d ago`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const handleSearchKeyDown = (e) => { if (e.key === 'Enter') fetchLeads(); };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl p-6 overflow-hidden">
      <PageHeader
        title={<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Pipeline</span>}
        description="Drag and drop leads between stages to manage your pipeline."
        className="mb-6"
        actions={
          <>
            <Input
              icon={Search}
              placeholder="Search leads..."
              className="w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
          </>
        }
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 flex-1 items-stretch">
          {PIPELINE_STAGES.map(stage => {
            const leads = leadsByStage[stage.id] || [];
            const isOver = dragOverStage === stage.id;
            return (
              <div
                key={stage.id}
                className={`min-w-[280px] w-[280px] rounded-2xl border flex flex-col transition-all duration-200 ${
                  isOver ? 'bg-blue-50/80 border-blue-300 shadow-lg scale-[1.01]' : 'bg-white border-gray-100 shadow-sm'
                }`}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, stage.id)}
              >
                {/* Column Header */}
                <div className="p-4 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                      <h3 className="font-bold text-slate-800 text-sm">{stage.title}</h3>
                    </div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${stage.lightColor} border`}>
                      {leads.length}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5 min-h-[200px]">
                  {leads.length === 0 ? (
                    <div className="text-center py-8 text-sm text-gray-400">
                      <p>No leads</p>
                      <p className="text-xs mt-1">Drag leads here</p>
                    </div>
                  ) : (
                    leads.map(lead => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead)}
                        onClick={() => openLeadDetail(lead.id)}
                        className={`group bg-white rounded-xl border border-gray-100 p-3.5 cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-200 transition-all ${
                          dragging?.id === lead.id ? 'opacity-40 scale-95' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                              {(lead.name || 'U')[0].toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-semibold text-slate-800 text-sm truncate">{lead.name || 'Unknown'}</h4>
                              <p className="text-xs text-gray-400 truncate">{lead.email || lead.phone || '—'}</p>
                            </div>
                          </div>
                          <GripVertical className="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </div>

                        <div className="flex items-center justify-between mt-2.5">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${scoreColors[lead.score] || scoreColors.cold}`}>
                            {scoreEmoji[lead.score] || '❄️'} {(lead.score || 'cold').charAt(0).toUpperCase() + (lead.score || 'cold').slice(1)}
                          </span>
                          <span className="text-xs text-gray-400">{formatDate(lead.created_at)}</span>
                        </div>

                        {lead.procedure && (
                          <p className="text-xs text-gray-500 mt-2 bg-gray-50 px-2 py-1 rounded-md truncate">{lead.procedure}</p>
                        )}

                        {/* Quick stage move buttons */}
                        <div className="flex gap-1 mt-2.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {PIPELINE_STAGES.filter(s => s.id !== (lead.stage || 'new')).slice(0, 3).map(s => (
                            <button
                              key={s.id}
                              onClick={(e) => { e.stopPropagation(); handleMoveStage(lead, s.id); }}
                              className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border ${s.lightColor} hover:shadow-sm transition-all`}
                              title={`Move to ${s.title}`}
                            >
                              → {s.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Lead Detail Slide-over */}
      {(selectedLead || detailLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedLead(null)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto animate-[slideInRight_0.3s_ease-out]">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-5 flex items-center justify-between z-10">
              <h2 className="text-lg font-bold text-slate-800">Lead Detail</h2>
              <button onClick={() => setSelectedLead(null)} className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50">
                <X className="w-4 h-4" />
              </button>
            </div>
            {detailLoading ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
            ) : selectedLead && (
              <div className="p-5 space-y-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">
                    {(selectedLead.name || 'U')[0].toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">{selectedLead.name || 'Unknown'}</h3>
                    <p className="text-sm text-slate-500">{selectedLead.email || '—'}</p>
                    {selectedLead.phone && <p className="text-sm text-slate-400">{selectedLead.phone}</p>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Score', value: selectedLead.score },
                    { label: 'Stage', value: selectedLead.stage },
                    { label: 'Procedure', value: selectedLead.procedure || '—' },
                    { label: 'Budget', value: selectedLead.budget_range || '—' },
                    { label: 'Timeframe', value: selectedLead.timeframe || '—' },
                    { label: 'Created', value: formatDate(selectedLead.created_at) },
                  ].map(item => (
                    <div key={item.label} className="bg-slate-50 rounded-xl p-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase">{item.label}</span>
                      <p className="text-sm font-medium text-slate-700 mt-1 capitalize">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Quick Stage Move */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 mb-2">Move to Stage</h4>
                  <div className="flex flex-wrap gap-2">
                    {PIPELINE_STAGES.map(s => (
                      <button
                        key={s.id}
                        disabled={s.id === selectedLead.stage}
                        onClick={async () => {
                          await leadService.updateLead(selectedLead.id, { stage: s.id });
                          setSelectedLead({ ...selectedLead, stage: s.id });
                          fetchLeads();
                        }}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                          s.id === selectedLead.stage
                            ? `${s.lightColor} border ring-2 ring-offset-1 ring-blue-300`
                            : `${s.lightColor} border hover:shadow-sm`
                        }`}
                      >
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>

                {selectedLead.utm_source && (
                  <div className="bg-slate-50 rounded-xl p-3">
                    <span className="text-xs font-semibold text-slate-400 uppercase">UTM Source</span>
                    <p className="text-sm text-slate-700 mt-1">
                      {[selectedLead.utm_source, selectedLead.utm_medium, selectedLead.utm_campaign].filter(Boolean).join(' / ')}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
