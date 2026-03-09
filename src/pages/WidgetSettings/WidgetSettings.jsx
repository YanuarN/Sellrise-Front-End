import { useState, useEffect } from 'react';
import { Code2, Palette, Globe, Plus, Trash2, Loader2, X, Check, Copy } from 'lucide-react';
import WidgetEditor from '../../components/WidgetEditor/WidgetEditor';
import BrandingCustomizer from '../../components/BrandingCustomizer/BrandingCustomizer';
import { Button } from '../../components';
import useAuthStore from '../../stores/authStore';
import domainService from '../../services/domainService';

function WidgetSettings() {
  const { user } = useAuthStore();
  const workspaceId = user?.workspace_id || '';
  const workspaceName = user?.full_name ? `${user.full_name}'s Workspace` : 'My Workspace';
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState('embed');

  // --- Branding state ---
  const [brandingConfig, setBrandingConfig] = useState({
    primaryColor: '#3b82f6',
    bubbleColor: '#3b82f6',
    bubbleIcon: '💬',
    welcomeMessage: 'Hi! How can we help?',
    position: 'bottom-right',
    logoUrl: '',
    borderRadius: '16',
    bubbleSize: 'large',
  });
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [brandingSaveMsg, setBrandingSaveMsg] = useState(null);

  // --- Domains state ---
  const [domains, setDomains] = useState([]);
  const [domainsLoading, setDomainsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newDomain, setNewDomain] = useState('');
  const [adding, setAdding] = useState(false);
  const [removing, setRemoving] = useState(null);
  const [domainError, setDomainError] = useState('');

  const fetchDomains = async () => {
    setDomainsLoading(true);
    try {
      const data = await domainService.getDomains();
      setDomains(Array.isArray(data) ? data : data.items || data.data || []);
    } catch {
      setDomains([]);
    } finally {
      setDomainsLoading(false);
    }
  };

  useEffect(() => { fetchDomains(); }, []);

  const handleAddDomain = async () => {
    if (!newDomain.trim()) return;
    setAdding(true);
    setDomainError('');
    try {
      const domainStr = newDomain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
      if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/.test(domainStr)) {
        setDomainError('Please enter a valid domain (e.g. example.com)');
        setAdding(false);
        return;
      }
      await domainService.addDomain(domainStr);
      setNewDomain('');
      setShowAddModal(false);
      fetchDomains();
    } catch (err) {
      setDomainError(err.data?.detail || 'Failed to add domain.');
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
    } catch {
      // ignore
    } finally {
      setRemoving(null);
    }
  };

  // Persist branding to all registered domains in this workspace
  const handleSaveBranding = async (branding) => {
    setIsSavingBranding(true);
    setBrandingSaveMsg(null);
    try {
      const allDomains = domains.length ? domains : await domainService.getDomains();
      if (!allDomains || allDomains.length === 0) {
        setBrandingSaveMsg({ type: 'warn', text: 'No domains registered yet. Add a domain in the Domains tab first.' });
        return;
      }
      await Promise.all(
        allDomains.map((d) =>
          domainService.updateDomain(d.id, {
            brand_primary_color: branding.primaryColor,
            bubble_color: branding.bubbleColor,
            bubble_icon: branding.bubbleIcon,
            welcome_message: branding.welcomeMessage,
            brand_logo_url: branding.logoUrl || null,
            position: branding.position,
            border_radius: branding.borderRadius,
            bubble_size: branding.bubbleSize,
          })
        )
      );
      setBrandingSaveMsg({ type: 'success', text: '✅ Branding saved successfully.' });
    } catch (err) {
      setBrandingSaveMsg({ type: 'error', text: `Failed to save: ${err.message}` });
    } finally {
      setIsSavingBranding(false);
      setTimeout(() => setBrandingSaveMsg(null), 4000);
    }
  };

  const tabs = [
    { id: 'embed', label: 'Embed Code', icon: Code2 },
    { id: 'domains', label: 'Domains', icon: Globe },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  return (
    <div className="h-full bg-gray-50 p-6 overflow-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <Code2 size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Widget Configuration</h1>
            <p className="mt-1 text-gray-600">
              Manage domains, embed code, and customize widget appearance
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex border-b border-gray-200 bg-white rounded-t-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl">
        {/* ── Embed Code Tab ── */}
        {activeTab === 'embed' && (
          <WidgetEditor
            workspaceId={workspaceId}
            workspaceName={workspaceName}
          />
        )}

        {/* ── Domains Tab ── */}
        {activeTab === 'domains' && (
          <div className="space-y-6">
            {/* Allowed Domains Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-800">Allowed Domains</h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Domains where your widget is allowed to load
                  </p>
                </div>
                {isAdmin && (
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 text-sm shrink-0"
                    onClick={() => { setShowAddModal(true); setDomainError(''); setNewDomain(''); }}
                  >
                    <Plus className="w-4 h-4" />
                    Add Domain
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                {domainsLoading ? (
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
                            <span className={`w-2 h-2 rounded-full ${d.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
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

            {/* Security Info */}
            <div className="rounded-xl bg-blue-50 p-4 text-sm text-blue-900 border border-blue-200">
              <p className="font-medium mb-1">🛡️ Security Note</p>
              <p>
                Only domains you register here can load the widget. This prevents unauthorized usage and protects your data.
              </p>
            </div>
          </div>
        )}

        {/* ── Appearance Tab ── */}
        {activeTab === 'appearance' && (
          <>
            {brandingSaveMsg && (
              <div className={`mb-4 rounded-lg p-3 text-sm ${
                brandingSaveMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                brandingSaveMsg.type === 'warn'    ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {brandingSaveMsg.text}
              </div>
            )}
            <BrandingCustomizer
              initialBranding={brandingConfig}
              onBrandingChange={(branding) => setBrandingConfig(branding)}
              onSave={handleSaveBranding}
              isSaving={isSavingBranding}
            />
          </>
        )}
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
                  onChange={(e) => { setNewDomain(e.target.value); setDomainError(''); }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddDomain()}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  placeholder="e.g. example.com"
                  autoFocus
                />
                {domainError && <p className="text-xs text-red-500 mt-1">{domainError}</p>}
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

      {/* Quick Links */}
      <div className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Need Help?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a href="#" className="rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <p className="font-medium text-gray-900">📚 Documentation</p>
            <p className="mt-1 text-sm text-gray-600">Setup guide & troubleshooting</p>
          </a>
          <a href="#" className="rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <p className="font-medium text-gray-900">⚡ API Reference</p>
            <p className="mt-1 text-sm text-gray-600">Widget API methods & events</p>
          </a>
          <a href="#" className="rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <p className="font-medium text-gray-900">💬 Support</p>
            <p className="mt-1 text-sm text-gray-600">Chat with support team</p>
          </a>
        </div>
      </div>
    </div>
  );
}

export default WidgetSettings;
