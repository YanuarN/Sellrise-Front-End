import { useState, useEffect, useCallback, useRef } from 'react';
import {
    MessageSquare, Search, ChevronLeft, ChevronRight,
    User, Mail, Phone, Tag, Clock, Flame, Thermometer, Snowflake,
    UserCheck, ArrowRightLeft, StickyNote, Loader2, RefreshCw, Globe, Bot, Send,
} from 'lucide-react';
import { Button, Input, Badge, LeadAttachmentsPanel, PageHeader } from '../../components';
import leadService from '../../services/leadService';
import { API_BASE_URL } from '../../services/api';
import AuthImage from '../../components/AuthImage';
import useAuthStore from '../../stores/authStore';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatRelative(iso) {
    if (!iso) return '';
    const diff = Date.now() - new Date(iso).getTime();
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
    if (diff < 604_800_000) return `${Math.floor(diff / 86_400_000)}d ago`;
    return new Date(iso).toLocaleDateString();
}

function formatTime(iso) {
    if (!iso) return '';
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

const SCORE_CONFIG = {
    hot: { color: 'red', Icon: Flame, label: 'Hot' },
    warm: { color: 'yellow', Icon: Thermometer, label: 'Warm' },
    cold: { color: 'blue', Icon: Snowflake, label: 'Cold' },
};

function ScoreBadge({ score }) {
    const cfg = SCORE_CONFIG[score] || SCORE_CONFIG.cold;
    return (
        <Badge color={cfg.color} className="gap-1">
            <cfg.Icon className="w-3 h-3" />
            {cfg.label}
        </Badge>
    );
}

function initials(name, email) {
    const src = name || email || '?';
    return src.charAt(0).toUpperCase();
}

function getConversationBadges(conversationSummaries = []) {
    const seen = new Set();
    const ordered = [];

    conversationSummaries.forEach((summary) => {
        const key = `${summary.channel_group || summary.channel}:${summary.mode || ''}`;
        if (!seen.has(key)) {
            seen.add(key);
            ordered.push(summary);
        }
    });

    return ordered;
}

function ChannelBadge({ summary }) {
    const channel = summary.channel_group || summary.channel;
    const mode = summary.mode;
    const Icon = channel === 'telegram' ? Send : channel === 'web' ? Globe : Bot;
    const label = channel === 'telegram' ? 'Telegram' : channel === 'web' ? 'Web' : channel;

    return (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600">
            <Icon className="w-3 h-3" />
            {label}
            {mode === 'bot' && channel === 'telegram' && <span className="text-slate-400">Bot</span>}
        </span>
    );
}

// ─── Conversation Transcript ──────────────────────────────────────────────────

const BOT_EVENTS = new Set(['step_completed', 'bot_message', 'question_asked', 'session_started', 'widget_message_replied']);
const VISITOR_EVENTS = new Set(['answer_given', 'lead_submitted', 'visitor_message', 'widget_message_received']);

function eventLabel(ev) {
    if (ev.event_type === 'lead_submitted') {
        const d = ev.data || {};
        const parts = [d.name, d.email, d.phone].filter(Boolean);
        return parts.length ? parts.join(' · ') : 'Lead submitted';
    }
    if (ev.event_type === 'widget_message_received') {
        return ev.data?.message_preview || 'Visitor sent a message';
    }
    if (ev.event_type === 'widget_message_replied') {
        return 'Bot replied';
    }
    if (ev.event_type === 'answer_given') {
        const answer = ev.data?.answer ?? ev.data?.value;
        return answer != null ? String(answer) : `Answered: ${ev.step_name || '—'}`;
    }
    if (ev.event_type === 'session_started') {
        return `Session started${ev.data?.domain ? ` on ${ev.data.domain}` : ''}`;
    }
    if (ev.event_type === 'step_completed') {
        return ev.step_name || 'Step completed';
    }
    if (ev.event_type === 'bot_message' || ev.event_type === 'question_asked') {
        return ev.data?.message || ev.step_name || ev.event_type;
    }
    return ev.data?.message || ev.step_name || ev.event_type;
}

function isBot(ev) {
    return BOT_EVENTS.has(ev.event_type);
}

function Transcript({ events }) {
    const bottomRef = useRef(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [events]);

    if (!events || events.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-sm">
                No conversation events yet.
            </div>
        );
    }

    // Sort ASC for rendering
    const sorted = [...events].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

    return (
        <div className="flex-1 overflow-y-auto no-scrollbar px-4 py-3 space-y-3">
            {sorted.map((ev) => {
                const bot = isBot(ev);
                const atts = ev.event_metadata?.attachments || ev.data?.metadata?.attachments || ev.data?.attachments;
                return (
                    <div key={ev.id} className={`flex ${bot ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[72%] rounded-2xl px-4 py-2 text-sm shadow-sm
                            ${bot
                                ? 'bg-slate-100 text-slate-700 rounded-tl-sm'
                                : 'bg-blue-600 text-white rounded-tr-sm'
                            }`}>
                            {atts && atts.length > 0 && (
                                <div className="mb-2 space-y-2">
                                    {atts.map((url, i) => (
                                        <AuthImage key={i} src={url.startsWith('/') ? `${API_BASE_URL}${url}` : url} alt="Attachment" className="max-w-full rounded-lg border border-white/20" />
                                    ))}
                                </div>
                            )}
                            <p className="leading-snug">{eventLabel(ev)}</p>
                            <p className={`text-[10px] mt-1 ${bot ? 'text-slate-400' : 'text-blue-200'}`}>
                                {bot ? '🤖 Bot' : '👤 Visitor'} · {formatTime(ev.created_at)}
                            </p>
                        </div>
                    </div>
                );
            })}
            <div ref={bottomRef} />
        </div>
    );
}

// ─── Lead Detail Panel ────────────────────────────────────────────────────────

function LeadDetailPanel({ lead, onUpdated }) {
    const user = useAuthStore((s) => s.user);
    const [detail, setDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [noteText, setNoteText] = useState('');
    const [saving, setSaving] = useState(false);
    const [stageVal, setStageVal] = useState('');
    const [error, setError] = useState(null);

    const loadDetail = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const d = await leadService.getLead(lead.id);
            setDetail(d);
            setStageVal(d.stage);
        } catch (e) {
            setError(e.message || 'Failed to load lead');
        } finally {
            setLoading(false);
        }
    }, [lead.id]);

    useEffect(() => { loadDetail(); }, [loadDetail]);

    async function handleAssignSelf() {
        if (!user) return;
        setSaving(true);
        try {
            const updated = await leadService.updateLead(lead.id, { user_id: user.id });
            setDetail(updated);
            onUpdated?.(updated);
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleChangeStage(newStage) {
        setSaving(true);
        try {
            const updated = await leadService.updateLead(lead.id, { stage: newStage });
            setDetail(updated);
            setStageVal(newStage);
            onUpdated?.(updated);
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    async function handleAddNote() {
        if (!noteText.trim()) return;
        setSaving(true);
        try {
            await leadService.addNote(lead.id, noteText.trim());
            setNoteText('');
            await loadDetail();
        } catch (e) {
            setError(e.message);
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center text-slate-400">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                Loading…
            </div>
        );
    }

    if (error || !detail) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3">
                <p className="text-sm">{error || 'Lead not found'}</p>
                <Button variant="secondary" size="sm" onClick={loadDetail}>Retry</Button>
            </div>
        );
    }

    const STAGES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost'];
    const channelBadges = getConversationBadges(detail.conversation_summaries);

    return (
        <div className="flex flex-col h-full">
            {/* Lead Info Header */}
            <div className="px-5 pt-4 pb-3 border-b border-slate-100 space-y-2">
                <div className="flex items-start justify-between gap-2">
                    <div>
                        <h2 className="text-base font-semibold text-slate-800">
                            {detail.name || detail.email || 'Unknown Lead'}
                        </h2>
                        <div className="flex flex-wrap gap-2 mt-1">
                            <ScoreBadge score={detail.score} />
                            <Badge color="gray">{detail.stage}</Badge>
                            {detail.custom_fields && Object.entries(detail.custom_fields).slice(0, 1).map(([k, v]) => (
                                <Badge key={k} color="blue">{v}</Badge>
                            ))}
                            {channelBadges.map((summary) => (
                                <ChannelBadge key={`${summary.channel}-${summary.mode || 'default'}`} summary={summary} />
                            ))}
                        </div>
                    </div>
                    <button onClick={loadDetail} className="text-slate-400 hover:text-slate-600 mt-0.5">
                        <RefreshCw className="w-4 h-4" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-500">
                    {detail.email && (
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3 shrink-0" />{detail.email}</span>
                    )}
                    {detail.phone && (
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3 shrink-0" />{detail.phone}</span>
                    )}
                    {Object.entries(detail.custom_fields || {}).slice(0, 4).map(([k, v]) => (
                        <span key={k} className="flex items-center gap-1">
                            <Tag className="w-3 h-3 shrink-0" />
                            {k.replace(/_/g, ' ')}: {v}
                        </span>
                    ))}
                    {detail.domain && (
                        <span className="flex items-center gap-1 col-span-2 truncate">
                            <span className="shrink-0">🌐</span>{detail.domain}
                        </span>
                    )}
                </div>

                {detail.user_id && (
                    <p className="text-xs text-slate-400 flex items-center gap-1">
                        <User className="w-3 h-3" />Assigned to {detail.user_id === user?.id ? 'you' : detail.user_id}
                    </p>
                )}
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 px-5 py-2 border-b border-slate-100 bg-slate-50/50 overflow-x-auto">
                {!detail.user_id && (
                    <Button variant="primary" size="sm" className="gap-1 shrink-0" disabled={saving} onClick={handleAssignSelf}>
                        <UserCheck className="w-3.5 h-3.5" />
                        Assign to me
                    </Button>
                )}
                <div className="flex items-center gap-1 shrink-0">
                    <ArrowRightLeft className="w-3.5 h-3.5 text-slate-400" />
                    <select
                        value={stageVal}
                        onChange={(e) => handleChangeStage(e.target.value)}
                        disabled={saving}
                        className="text-xs border border-gray-300 rounded-md px-2 py-1 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    >
                        {STAGES.map((s) => (
                            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="px-4 py-4 border-b border-slate-100 bg-white">
                <LeadAttachmentsPanel leadId={detail.id} />
            </div>

            {/* Transcript */}
            <Transcript events={detail.events} />

            {/* Note Input */}
            <div className="px-4 py-3 border-t border-slate-100 bg-white">
                {detail.notes?.length > 0 && (
                    <div className="mb-2 max-h-24 overflow-y-auto no-scrollbar space-y-1">
                        {detail.notes.map((n) => (
                            <div key={n.id} className="text-xs bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5 text-amber-800">
                                <StickyNote className="w-3 h-3 inline mr-1 opacity-60" />
                                {n.body}
                            </div>
                        ))}
                    </div>
                )}
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleAddNote()}
                        placeholder="Add a note… (Enter to save)"
                        className="flex-1 text-sm border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                    <Button variant="secondary" size="sm" disabled={saving || !noteText.trim()} onClick={handleAddNote}>
                        <StickyNote className="w-4 h-4" />
                    </Button>
                </div>
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
            </div>
        </div>
    );
}

// ─── Main Inbox Page ──────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function Inbox() {
    const [leads, setLeads] = useState([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [channelFilter, setChannelFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [selectedLead, setSelectedLead] = useState(null);
    const [error, setError] = useState(null);

    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    const fetchLeads = useCallback(async (pg = 1, q = '', channel = '') => {
        setLoading(true);
        setError(null);
        try {
            const res = await leadService.getLeads({
                inbox: true,
                page: pg,
                pageSize: PAGE_SIZE,
                search: q || undefined,
                channel: channel || undefined,
            });
            // res may be { items, total, page, page_size } or an array
            const items = res?.items ?? res ?? [];
            const tot = res?.total ?? items.length;
            setLeads(items);
            setTotal(tot);
        } catch (e) {
            setError(e.message || 'Failed to load leads');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchLeads(page, search, channelFilter); }, [fetchLeads, page, search, channelFilter]);

    function handleSearch(e) {
        e.preventDefault();
        setPage(1);
        setSearch(searchInput);
    }

    function handleLeadUpdated(updated) {
        setLeads((prev) => prev.map((l) => l.id === updated.id ? { ...l, ...updated } : l));
        if (selectedLead?.id === updated.id) {
            setSelectedLead((prev) => ({ ...prev, ...updated }));
        }
    }

    return (
        <div className="flex flex-col h-full bg-slate-50 rounded-2xl overflow-hidden p-4 md:p-6">
            <PageHeader
                title="Inbox"
                description="New and unassigned leads."
                className="mb-4 md:mb-6"
                actions={
                    <form onSubmit={handleSearch} className="flex gap-2 w-full md:w-auto">
                        <select
                            value={channelFilter}
                            onChange={(event) => { setChannelFilter(event.target.value); setPage(1); }}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                        >
                            <option value="">All channels</option>
                            <option value="web">Web</option>
                            <option value="telegram_bot">Telegram Bot</option>
                        </select>
                        <Input
                            icon={Search}
                            placeholder="Search..."
                            className="flex-1 md:w-64"
                            value={searchInput}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                        <Button variant="secondary" type="submit" size="md">Search</Button>
                    </form>
                }
            />

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 min-h-0 relative">
                {/* ── Left Panel: Lead List ─────────────────────────── */}
                <div className={`col-span-1 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col overflow-hidden ${selectedLead ? 'hidden md:flex' : 'flex'}`}>
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                        <h3 className="font-semibold text-slate-700">New Leads</h3>
                        <span className="text-xs text-slate-400">{total} total</span>
                    </div>

                    {loading ? (
                        <div className="flex-1 flex items-center justify-center text-slate-400">
                            <Loader2 className="w-5 h-5 animate-spin mr-2" />
                            Loading…
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex flex-col items-center justify-center gap-2 text-slate-400 p-4">
                            <p className="text-sm text-center">{error}</p>
                            <Button variant="secondary" size="sm" onClick={() => fetchLeads(page, search)}>
                                <RefreshCw className="w-3.5 h-3.5 mr-1" />Retry
                            </Button>
                        </div>
                    ) : leads.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-2 p-6">
                            <MessageSquare className="w-10 h-10 text-slate-200" />
                            <p className="text-sm font-medium text-slate-500">No new leads yet</p>
                            <p className="text-xs text-slate-400 text-center">
                                New leads from your chatbot will appear here.
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-1">
                                {leads.map((lead) => {
                                    const isSelected = selectedLead?.id === lead.id;
                                    const channelBadges = getConversationBadges(lead.conversation_summaries);
                                    return (
                                        <button
                                            key={lead.id}
                                            onClick={() => setSelectedLead(lead)}
                                            className={`w-full text-left p-3 rounded-xl transition-colors border flex gap-3
                                                ${isSelected
                                                    ? 'bg-blue-50 border-blue-200'
                                                    : 'hover:bg-slate-50 border-transparent hover:border-slate-100'
                                                }`}
                                        >
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 shrink-0 flex items-center justify-center text-white font-bold text-sm">
                                                {initials(lead.name, lead.email)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-1">
                                                    <span className="font-medium text-slate-800 text-sm truncate">
                                                        {lead.name || lead.email || 'Unknown'}
                                                    </span>
                                                    <span className="text-[10px] text-slate-400 shrink-0">
                                                        {formatRelative(lead.created_at)}
                                                    </span>
                                                </div>
                                                {lead.email && lead.name && (
                                                    <p className="text-xs text-slate-400 truncate">{lead.email}</p>
                                                )}
                                                <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                                    <ScoreBadge score={lead.score} />
                                                    {channelBadges.map((summary) => (
                                                        <ChannelBadge key={`${lead.id}-${summary.channel}-${summary.mode || 'default'}`} summary={summary} />
                                                    ))}
                                                    {lead.custom_fields && Object.values(lead.custom_fields)[0] && (
                                                        <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded truncate max-w-[100px]">
                                                            {Object.values(lead.custom_fields)[0]}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>

                            {/* Pagination */}
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100">
                                    <button
                                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                                        disabled={page === 1}
                                        className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                                    >
                                        <ChevronLeft className="w-4 h-4 text-slate-500" />
                                    </button>
                                    <span className="text-xs text-slate-500">
                                        {page} / {totalPages}
                                    </span>
                                    <button
                                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                                        disabled={page === totalPages}
                                        className="p-1 rounded hover:bg-slate-100 disabled:opacity-30"
                                    >
                                        <ChevronRight className="w-4 h-4 text-slate-500" />
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* ── Right Panel: Lead Detail + Transcript ─────────── */}
                <div className={`col-span-1 md:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-sm flex flex-col overflow-hidden ${!selectedLead ? 'hidden md:flex' : 'flex'}`}>
                    {selectedLead ? (
                        <>
                            <div className="md:hidden flex items-center p-4 border-b border-slate-100 bg-white sticky top-0 z-10">
                                <button onClick={() => setSelectedLead(null)} className="text-slate-500 flex items-center gap-1 font-medium">
                                    <ChevronLeft className="w-5 h-5" /> Back
                                </button>
                            </div>
                            <LeadDetailPanel
                                key={selectedLead.id}
                                lead={selectedLead}
                                onUpdated={handleLeadUpdated}
                            />
                        </>
                    ) : (
                        <div className="flex-1 p-8 flex flex-col items-center justify-center text-center">
                            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="w-10 h-10 text-blue-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-700 mb-1">Select a lead</h2>
                            <p className="text-sm text-slate-400 max-w-xs">
                                Choose a lead from the list to view their conversation transcript and take action.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
