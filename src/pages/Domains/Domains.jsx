import { useState, useEffect } from 'react';
import { Globe, Copy, Check, Plus, Trash2, Loader2, X } from 'lucide-react';
import { Button, PageHeader } from '../../components';
import { domainService } from '../../services';
import useAuthStore from '../../stores/authStore';

export default function Domains() {
    const [domains, setDomains] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newDomain, setNewDomain] = useState('');
    const [adding, setAdding] = useState(false);
    const [removing, setRemoving] = useState(null);
    const [copied, setCopied] = useState(false);
    const [error, setError] = useState('');
    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === 'admin';

    const fetchDomains = async () => {
        setLoading(true);
        try {
            const data = await domainService.getDomains();
            setDomains(Array.isArray(data) ? data : data.items || data.data || []);
        } catch (err) {
            console.error('Failed to fetch domains:', err);
            // If API not ready yet, show empty state
            setDomains([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDomains(); }, []);

    const handleAddDomain = async () => {
        if (!newDomain.trim()) return;
        setAdding(true);
        setError('');
        try {
            // Basic domain validation
            const domainStr = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
            if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(domainStr)) {
                setError('Please enter a valid domain (e.g. example.com)');
                setAdding(false);
                return;
            }
            await domainService.addDomain(domainStr);
            setNewDomain('');
            setShowAddModal(false);
            fetchDomains();
        } catch (err) {
            console.error('Failed to add domain:', err);
            setError(err.data?.detail || 'Failed to add domain. Make sure the API is available.');
        } finally {
            setAdding(false);
        }
    };

    const handleRemoveDomain = async (domainId) => {
        if (!confirm('Are you sure you want to remove this domain?')) return;
        setRemoving(domainId);
        try {
            await domainService.removeDomain(domainId);
            fetchDomains();
        } catch (err) {
            console.error('Failed to remove domain:', err);
        } finally {
            setRemoving(null);
        }
    };

    const widgetSnippet = `<script>
  window.sellriseConfig = {
    workspaceKey: "${user?.workspace_id || 'wk_your_workspace_key'}",
  };
</script>
<script src="${import.meta.env.VITE_WIDGET_URL || 'http://localhost:5173/widget.js'}" async></script>`;

    const handleCopy = () => {
        navigator.clipboard.writeText(widgetSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 rounded-2xl p-8 overflow-auto">
            <PageHeader
                title={<span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">Installation & Domains</span>}
                description="Configure the web domains allowed to load your widget and grab the installation snippet."
                className="mb-8"
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
                {/* Allowed Domains */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Allowed Domains</h2>
                            <p className="text-sm text-slate-500 mt-1">Domains where your widget is allowed to load</p>
                        </div>
                        {isAdmin && (
                            <Button
                                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-sm shrink-0"
                                onClick={() => { setShowAddModal(true); setError(''); setNewDomain(''); }}
                            >
                                <Plus className="w-4 h-4" />
                                Add Domain
                            </Button>
                        )}
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto">
                        {loading ? (
                            <div className="flex items-center justify-center py-12">
                                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            </div>
                        ) : domains.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Globe className="w-12 h-12 mb-3 text-gray-300" />
                                <p className="text-base font-medium">No domains configured</p>
                                <p className="text-sm mt-1">Add your first domain to enable the widget.</p>
                            </div>
                        ) : (
                            domains.map((d) => (
                                <div key={d.id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-indigo-100 transition-colors bg-slate-50/50 group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center shrink-0">
                                            <Globe className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold text-slate-800">{d.domain}</h4>
                                            <p className={`text-xs font-medium mt-0.5 flex items-center gap-1 ${d.is_active ? 'text-emerald-600' : 'text-gray-400'}`}>
                                                <span className={`w-2 h-2 rounded-full ${d.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                                                {d.is_active ? 'Active' : 'Inactive'}
                                            </p>
                                        </div>
                                    </div>
                                    {isAdmin && (
                                        <Button
                                            variant="outline"
                                            className="text-xs py-1.5 px-3 h-auto text-red-600 border-red-200 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleRemoveDomain(d.id)}
                                            disabled={removing === d.id}
                                        >
                                            {removing === d.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3 mr-1" />}
                                            Remove
                                        </Button>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Installation Snippet */}
                <div className="bg-slate-900 rounded-3xl p-6 shadow-xl flex flex-col relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-20 -mt-20"></div>

                    <h2 className="text-xl font-bold text-white mb-2 relative z-10">Widget Snippet</h2>
                    <p className="text-sm text-slate-400 mb-6 relative z-10">Copy and paste this code just before the closing <code className="text-indigo-300">&lt;/body&gt;</code> tag on your website.</p>

                    <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 overflow-x-auto relative z-10 group">
                        <pre className="text-xs text-indigo-300 font-mono leading-relaxed">
                            <code>{widgetSnippet}</code>
                        </pre>

                        <button
                            onClick={handleCopy}
                            className={`absolute top-4 right-4 w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                                copied ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white opacity-0 group-hover:opacity-100'
                            }`}
                        >
                            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </button>
                    </div>

                    <div className="mt-auto bg-slate-800/50 border border-slate-700 rounded-2xl p-4 flex items-start gap-3 relative z-10 mt-6">
                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-white" />
                        </div>
                        <p className="text-sm text-slate-300 leading-relaxed">
                            Once installed, the widget will automatically appear on the allowed domains configured in the left panel.
                        </p>
                    </div>
                </div>
            </div>

            {/* Add Domain Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setShowAddModal(false)} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-8 animate-[fadeIn_0.2s_ease-out]">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-slate-800">Add Domain</h2>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Domain</label>
                                <input
                                    type="text"
                                    value={newDomain}
                                    onChange={(e) => { setNewDomain(e.target.value); setError(''); }}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                                    placeholder="e.g. example.com"
                                    autoFocus
                                />
                                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
                            </div>
                            <p className="text-xs text-slate-400">Enter the domain without protocol (no http:// or https://)</p>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <Button variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
                            <Button
                                onClick={handleAddDomain}
                                disabled={adding || !newDomain.trim()}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white"
                            >
                                {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Domain'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
