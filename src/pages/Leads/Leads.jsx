import { useState, useEffect, useCallback } from 'react';
import { Users, Filter, Download, ArrowUpRight, Search, Loader2, ChevronDown, X, UserPlus } from 'lucide-react';
import { Button, Input, LeadAttachmentsPanel } from '../../components';
import { leadService } from '../../services';
import useAuthStore from '../../stores/authStore';

const STAGES = ['new', 'qualified', 'contacted', 'booked', 'won', 'lost'];
const SCORES = ['hot', 'warm', 'cold'];

const stageColors = {
  new: 'bg-blue-100 text-blue-700',
  qualified: 'bg-indigo-100 text-indigo-700',
  contacted: 'bg-purple-100 text-purple-700',
  booked: 'bg-emerald-100 text-emerald-700',
  won: 'bg-green-100 text-green-700',
  lost: 'bg-red-100 text-red-700',
};

const scoreDisplay = {
  hot: { emoji: '🔥', label: 'Hot', color: 'text-orange-600' },
  warm: { emoji: '🌤', label: 'Warm', color: 'text-yellow-600' },
  cold: { emoji: '❄️', label: 'Cold', color: 'text-blue-600' },
};

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('');
  const [scoreFilter, setScoreFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [exporting, setExporting] = useState(false);
  const user = useAuthStore((s) => s.user);
  const isAgent = user?.role === 'admin' || user?.role === 'agent';

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const data = await leadService.getLeads({
        page,
        pageSize,
        stage: stageFilter || undefined,
        score: scoreFilter || undefined,
        search: search || undefined,
      });
      setLeads(data.items || data.data || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Failed to fetch leads:', err);
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, stageFilter, scoreFilter, search]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setPage(1);
      fetchLeads();
    }
  };

  const openLeadDetail = async (leadId) => {
    setDetailLoading(true);
    setSelectedLead(null);
    try {
      const detail = await leadService.getLead(leadId);
      setSelectedLead(detail);
    } catch (err) {
      console.error('Failed to fetch lead detail:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !selectedLead) return;
    setAddingNote(true);
    try {
      await leadService.addNote(selectedLead.id, noteText);
      setNoteText('');
      // Refresh detail
      const detail = await leadService.getLead(selectedLead.id);
      setSelectedLead(detail);
    } catch (err) {
      console.error('Failed to add note:', err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleUpdateStage = async (leadId, newStage) => {
    try {
      await leadService.updateLead(leadId, { stage: newStage });
      fetchLeads();
      if (selectedLead?.id === leadId) {
        const detail = await leadService.getLead(leadId);
        setSelectedLead(detail);
      }
    } catch (err) {
      console.error('Failed to update lead:', err);
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const handleExportCSV = async () => {
    setExporting(true);
    try {
      // Fetch all leads matching current filters for export
      const data = await leadService.getLeads({
        page: 1, pageSize: 1000,
        stage: stageFilter || undefined,
        score: scoreFilter || undefined,
        search: search || undefined,
      });
      const items = data.items || data.data || [];
      if (items.length === 0) { alert('No leads to export'); return; }

      const customKeys = [...new Set(items.flatMap(l => Object.keys(l.custom_fields || {})))];
      const headers = ['Name', 'Email', 'Phone', 'Score', 'Stage', ...customKeys, 'Created At'];
      const rows = items.map(l => [
        l.name || '', l.email || '', l.phone || '',
        l.score || '', l.stage || '',
        ...customKeys.map(k => (l.custom_fields || {})[k] || ''),
        l.created_at ? new Date(l.created_at).toISOString().split('T')[0] : '',
      ]);

      const csvContent = [headers, ...rows].map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads_export_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to export:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleUpdateScore = async (leadId, newScore) => {
    try {
      await leadService.updateLead(leadId, { score: newScore });
      fetchLeads();
      if (selectedLead?.id === leadId) {
        const detail = await leadService.getLead(leadId);
        setSelectedLead(detail);
      }
    } catch (err) {
      console.error('Failed to update score:', err);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 rounded-2xl p-4 md:p-6 overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-800 tracking-tight">Leads</h1>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            {loading ? 'Loading...' : `${total} leads captured by your widget.`}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-3 items-center">
          <Input
            icon={Search}
            placeholder="Search..."
            className="w-full sm:w-48 lg:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <div className="flex gap-2 w-full sm:w-auto">
            <Button
              variant="secondary"
              className="flex-1 sm:flex-none gap-2 shrink-0 py-2 md:py-2.5"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-gray-600">Filters</span>
              {(stageFilter || scoreFilter) && (
                <span className="w-2 h-2 rounded-full bg-blue-500" />
              )}
            </Button>
            <Button
              variant="secondary"
              className="flex-1 sm:flex-none gap-2 shrink-0 py-2 md:py-2.5"
              onClick={handleExportCSV}
              disabled={exporting}
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin text-gray-500" /> : <Download className="w-4 h-4 text-gray-500" />}
              <span className="text-gray-600">Export</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      {showFilters && (
        <div className="flex gap-4 mb-4 p-4 bg-white rounded-xl border border-slate-200 animate-[fadeIn_0.2s_ease-out]">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Stage:</span>
            <select
              value={stageFilter}
              onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All</option>
              {STAGES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-600">Score:</span>
            <select
              value={scoreFilter}
              onChange={(e) => { setScoreFilter(e.target.value); setPage(1); }}
              className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="">All</option>
              {SCORES.map((s) => (
                <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
              ))}
            </select>
          </div>
          {(stageFilter || scoreFilter) && (
            <button
              onClick={() => { setStageFilter(''); setScoreFilter(''); setPage(1); }}
              className="text-sm text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>
      )}

      <div className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-0">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-sm text-left text-slate-500 min-w-[700px] md:min-w-full">
            <thead className="text-xs text-slate-400 uppercase bg-slate-50 border-b border-slate-100 sticky top-0 z-10">
              <tr>
                <th scope="col" className="px-4 md:px-6 py-4 font-semibold">Contact Info</th>
                <th scope="col" className="px-4 md:px-6 py-4 font-semibold">Stage</th>
                <th scope="col" className="px-4 md:px-6 py-4 font-semibold">Score</th>
                <th scope="col" className="px-4 md:px-6 py-4 font-semibold">Details</th>
                <th scope="col" className="px-4 md:px-6 py-4 font-semibold">Created At</th>
                <th scope="col" className="px-4 md:px-6 py-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 md:px-6 py-16 text-center">
                    <Loader2 className="w-6 h-6 animate-spin text-gray-400 mx-auto" />
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 md:px-6 py-16 text-center text-gray-400">
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const initials = (lead.name || 'U')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);
                  const stage = lead.stage || 'new';
                  const score = lead.score || 'cold';
                  const scoreInfo = scoreDisplay[score] || scoreDisplay.cold;

                  return (
                    <tr key={lead.id} className="bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 md:px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                        <div className="flex items-center gap-2 md:gap-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs md:text-sm">
                            {initials}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs md:text-sm">{lead.name || 'Unknown'}</span>
                            <span className="text-[10px] md:text-xs text-slate-400 font-normal mt-0.5">{lead.email || lead.phone || '—'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <select
                          value={stage}
                          onChange={(e) => handleUpdateStage(lead.id, e.target.value)}
                          className={`text-[10px] md:text-xs font-semibold px-2 md:px-2.5 py-1 rounded-full border-0 cursor-pointer ${stageColors[stage] || 'bg-gray-100 text-gray-700'}`}
                        >
                          {STAGES.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        {isAgent ? (
                          <select
                            value={score}
                            onChange={(e) => handleUpdateScore(lead.id, e.target.value)}
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 cursor-pointer ${score === 'hot' ? 'bg-orange-100 text-orange-600' : score === 'warm' ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-100 text-blue-600'}`}
                          >
                            {SCORES.map((s) => (
                              <option key={s} value={s}>{scoreDisplay[s]?.emoji} {s.charAt(0).toUpperCase() + s.slice(1)}</option>
                            ))}
                          </select>
                        ) : (
                          <div className={`flex items-center gap-1.5 font-medium ${scoreInfo.color}`}>
                            {scoreInfo.emoji} {scoreInfo.label}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-600">
                          {Object.entries(lead.custom_fields || {}).slice(0, 1).map(([k, v]) => (
                            <span key={k} title={k.replace(/_/g, ' ')}>{v}</span>
                          ))}
                          {Object.keys(lead.custom_fields || {}).length === 0 && '—'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-slate-500">{formatDate(lead.created_at)}</span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openLeadDetail(lead.id)}
                          className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center text-sm transition-colors decoration-indigo-300 hover:underline underline-offset-4"
                        >
                          View Details
                          <ArrowUpRight className="w-4 h-4 ml-1" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-slate-100 text-sm text-slate-500 flex justify-between items-center bg-slate-50/50 mt-auto">
          <span>
            {total > 0
              ? `Showing ${(page - 1) * pageSize + 1} to ${Math.min(page * pageSize, total)} of ${total} leads`
              : 'No leads'}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="text-xs py-1.5 px-3 h-auto"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="flex items-center px-2 text-xs text-slate-400">
              {page} / {totalPages || 1}
            </span>
            <Button
              variant="outline"
              className="text-xs py-1.5 px-3 h-auto"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {/* Lead Detail Slide-over */}
      {(selectedLead || detailLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSelectedLead(null)} />
          <div className="relative w-full max-w-lg bg-white h-full shadow-2xl overflow-y-auto animate-[slideInRight_0.3s_ease-out]">
            <div className="sticky top-0 bg-white border-b border-slate-200 p-6 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-slate-800">Lead Detail</h2>
              <button
                onClick={() => setSelectedLead(null)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {detailLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : selectedLead && (
              <div className="p-6 space-y-6">
                {/* Lead Info */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold text-xl">
                      {(selectedLead.name || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-800">{selectedLead.name || 'Unknown'}</h3>
                      <p className="text-sm text-slate-500">{selectedLead.email || '—'}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Phone</span>
                      <p className="text-sm font-medium text-slate-700 mt-1">{selectedLead.phone || '—'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Score</span>
                      <p className="text-sm font-medium text-slate-700 mt-1 capitalize">{selectedLead.score || 'cold'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Stage</span>
                      <p className="text-sm font-medium text-slate-700 mt-1 capitalize">{selectedLead.stage || 'new'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Country</span>
                      <p className="text-sm font-medium text-slate-700 mt-1">{selectedLead.country || '—'}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase">Age</span>
                      <p className="text-sm font-medium text-slate-700 mt-1">{selectedLead.age || '—'}</p>
                    </div>
                    {Object.entries(selectedLead.custom_fields || {}).map(([key, value]) => (
                      <div key={key} className="bg-slate-50 rounded-xl p-3">
                        <span className="text-xs font-semibold text-slate-400 uppercase">{key.replace(/_/g, ' ')}</span>
                        <p className="text-sm font-medium text-slate-700 mt-1">{value || '—'}</p>
                      </div>
                    ))}
                    {Object.keys(selectedLead.custom_fields || {}).length === 0 && (
                      <div className="col-span-2 bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-sm text-slate-400">No additional data collected yet.</p>
                      </div>
                    )}
                  </div>

                  {selectedLead.utm_source && (
                    <div className="bg-slate-50 rounded-xl p-3">
                      <span className="text-xs font-semibold text-slate-400 uppercase">UTM</span>
                      <p className="text-sm text-slate-700 mt-1">
                        {[selectedLead.utm_source, selectedLead.utm_medium, selectedLead.utm_campaign].filter(Boolean).join(' / ')}
                      </p>
                    </div>
                  )}
                </div>

                {/* Events */}
                {selectedLead.events && selectedLead.events.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Events</h4>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedLead.events.map((evt, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg text-sm">
                          <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                          <span className="text-slate-700 font-medium">{evt.event_type}</span>
                          {evt.step_name && <span className="text-slate-400">• {evt.step_name}</span>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <LeadAttachmentsPanel leadId={selectedLead.id} />

                {/* Notes */}
                <div>
                  <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3">Notes</h4>
                  {selectedLead.notes && selectedLead.notes.length > 0 ? (
                    <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                      {selectedLead.notes.map((note, i) => (
                        <div key={i} className="p-3 bg-yellow-50 border border-yellow-100 rounded-xl text-sm text-slate-700">
                          <p>{note.body}</p>
                          <span className="text-xs text-slate-400 mt-1 block">{formatDate(note.created_at)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 mb-4">No notes yet</p>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                      placeholder="Add a note..."
                      className="flex-1 text-sm border border-slate-200 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <Button
                      onClick={handleAddNote}
                      disabled={addingNote || !noteText.trim()}
                      className="bg-blue-600 hover:bg-blue-700 text-white text-sm px-4 shrink-0"
                    >
                      {addingNote ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add'}
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
