import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Loader2, X } from 'lucide-react';
import { Button, Input, PageHeader, ScenarioCard, ScenarioSimulator } from '../../components';
import { scenarioService } from '../../services';
import useAuthStore from '../../stores/authStore';

export default function Scenarios() {
  const navigate = useNavigate();
  const [scenarios, setScenarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', config: '' });
  const [configError, setConfigError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [simulatingScenario, setSimulatingScenario] = useState(null);
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  const fetchScenarios = async () => {
    setLoading(true);
    try {
      const data = await scenarioService.getScenarios();
      setScenarios(Array.isArray(data) ? data : data.items || []);
    } catch (err) {
      console.error('Failed to fetch scenarios:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchScenarios();
  }, []);

  const handleCreate = async () => {
    if (!formData.name.trim()) return;
    setSaving(true);
    try {
      let config;
      try {
        config = formData.config.trim() ? JSON.parse(formData.config) : {};
      } catch {
        setConfigError('Invalid JSON – please check syntax');
        setSaving(false);
        return;
      }
      if (config === null || typeof config !== 'object' || Array.isArray(config)) {
        setConfigError('Config must be a JSON object');
        setSaving(false);
        return;
      }
      setConfigError(null);
      const created = await scenarioService.createScenario({
        name: formData.name,
        description: formData.description,
        config,
      });
      setShowCreateModal(false);
      setFormData({ name: '', description: '', config: '' });
      await fetchScenarios();
      // Navigate to the full editor so users can continue editing
      if (created?.id) {
        navigate(`/scenario-config?id=${created.id}`);
      }
    } catch (err) {
      console.error('Failed to create scenario:', err);
    } finally {
      setSaving(false);
    }
  };

  // Navigate to the full ScenarioConfiguration editor.
  const handleEdit = (scenario) => {
    navigate(`/scenario-config?id=${scenario.id}`);
  };

  // Open the simulator popup for the selected scenario.
  const handleSimulate = (scenario) => {
    setSimulatingScenario(scenario);
  };

  const filteredScenarios = searchQuery
    ? scenarios.filter((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.description || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : scenarios;

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days === 0) return 'Modified today';
    if (days === 1) return 'Modified 1d ago';
    return `Modified ${days}d ago`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl overflow-hidden p-6">
      <PageHeader
        title={<span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">Scenarios Engine</span>}
        description="Design and publish automated flows for your web widget. These deterministic scenarios define how your chatbots interact with visitors."
        className="mb-8"
        actions={
          <>
            <Input
              icon={Search}
              placeholder="Search scenarios..."
              className="w-64"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {isAdmin && (
              <Button
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 shrink-0 gap-2"
                onClick={() => { setFormData({ name: '', description: '', config: '' }); setConfigError(null); setShowCreateModal(true); }}
              >
                <Plus className="w-4 h-4" />
                New Scenario
              </Button>
            )}
          </>
        }
      />

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      ) : filteredScenarios.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
          <p className="text-lg font-medium">No scenarios found</p>
          <p className="text-sm mt-1">Create your first scenario to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScenarios.map((scenario) => (
            <ScenarioCard
              key={scenario.id}
              title={scenario.name}
              description={scenario.description || 'No description'}
              status={scenario.is_published ? `Published (v${scenario.version || 1})` : `Draft (v${scenario.version || 1})`}
              lastModified={formatDate(scenario.updated_at)}
              onEdit={isAdmin ? () => handleEdit(scenario) : undefined}
              onSimulate={() => handleSimulate(scenario)}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30" onClick={() => setShowCreateModal(false)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8 animate-[fadeIn_0.2s_ease-out]">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-800">New Scenario</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="e.g. Lead Qualification"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none h-20"
                  placeholder="Describe what this scenario does..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Config JSON <span className="text-slate-400 font-normal">(optional – you can edit later)</span>
                </label>
                <textarea
                  value={formData.config}
                  onChange={(e) => { setFormData({ ...formData, config: e.target.value }); setConfigError(null); }}
                  className={`w-full border rounded-xl px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 resize-none h-32 ${
                    configError
                      ? 'border-red-300 focus:ring-red-500/20 focus:border-red-500 bg-red-50'
                      : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-500'
                  }`}
                  placeholder='{"version": "1.0", "stages": [...] }'
                  spellCheck={false}
                />
                {configError && (
                  <p className="text-xs text-red-600 mt-1">{configError}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreate}
                disabled={saving || !formData.name.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Create'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Scenario Simulator */}
      {simulatingScenario && (
        <ScenarioSimulator
          scenario={simulatingScenario}
          onClose={() => setSimulatingScenario(null)}
        />
      )}
    </div>
  );
}
