/**
 * ScenarioConfiguration – slim page orchestrator.
 *
 * All heavy logic lives in:
 *   hooks/useScenarioConfig  – state, CRUD, LLM helpers
 *   src/components/*         – one folder per component + barrel exports
 *   constants                – tabs, defaults, templates
 */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Send,
  Loader2,
  Sparkles,
  Play,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Wand2,
  Settings,
} from "lucide-react";
import {
  Button,
  Card,
  ScenarioSimulator,
  ScenarioGeneralTab,
  ScenarioRulesTab,
  ScenarioSlotsTab,
  ScenarioActionsTab,
  ScenarioStagesTab,
  ScenarioPromptsTab,
  ScenarioLLMConfigTab,
  ScenarioFollowupsTab,
  ScenarioJsonEditorTab,
  ScenarioGenerateModal,
} from "../../components";
import useScenarioConfig from "./hooks/useScenarioConfig";
import { TABS, DEFAULT_CONFIG } from "./constants";
import api from "../../services/api";

// ─── Tab renderer map ──────────────────────────────────────────────────────
const TAB_MAP = {
  general: (h) => (
    <ScenarioGeneralTab
      name={h.name}
      setName={(v) => {
        h.setName(v);
      }}
      description={h.description}
      setDescription={(v) => {
        h.setDescription(v);
      }}
      version={h.version}
      setVersion={(v) => {
        h.setVersion(v);
      }}
    />
  ),
  rules: (h) => (
    <ScenarioRulesTab config={h.config} updateConfig={h.updateConfig} />
  ),
  slots: (h) => (
    <ScenarioSlotsTab config={h.config} updateConfig={h.updateConfig} />
  ),
  actions: (h) => (
    <ScenarioActionsTab config={h.config} updateConfig={h.updateConfig} />
  ),
  stages: (h) => (
    <ScenarioStagesTab config={h.config} updateConfig={h.updateConfig} />
  ),
  prompts: (h) => (
    <ScenarioPromptsTab
      config={h.config}
      updateConfig={h.updateConfig}
      enhancePrompt={h.enhancePrompt}
      enhancingField={h.enhancingField}
    />
  ),
  llm_config: (h) => (
    <ScenarioLLMConfigTab config={h.config} updateConfig={h.updateConfig} />
  ),
  followups: (h) => (
    <ScenarioFollowupsTab config={h.config} updateConfig={h.updateConfig} />
  ),
  json: (h) => (
    <ScenarioJsonEditorTab
      jsonText={h.jsonText}
      jsonError={h.jsonError}
      onChange={h.handleJsonChange}
      onFormat={h.formatJson}
      onEnhance={h.enhanceConfigWithInstructions}
      enhancing={h.enhancing}
    />
  ),
};

function ScenarioConfiguration() {
  const [searchParams] = useSearchParams();
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [scenarioName, setScenarioName] = useState("");
  const [scenarioDescription, setScenarioDescription] = useState("");
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isNewScenario, setIsNewScenario] = useState(true);
  const [createMode, setCreateMode] = useState("manual");
  const [showGenerateForm, setShowGenerateForm] = useState(false);
  const [generateForm, setGenerateForm] = useState({
    scenario_name: "",
    scenario_description: "",
    primary_goal: "",
    channel: "website_widget",
    tone: "",
    allowed_actions: ["#product_request", "#New_meeting_time", "#handover"],
  });
  const h = useScenarioConfig();
  const [activeTab, setActiveTab] = useState("general");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);

  // Load all scenarios once on mount.
  useEffect(() => {
    loadScenarios();
  }, []);

  // Sync JSON text when switching to "json" tab
  useEffect(() => {
    const idParam = searchParams.get("id");
    if (idParam) {
      loadScenario(idParam);
    }
  }, [searchParams]);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      const data = await api.scenarios.list();
      setScenarios(data);
    } catch (err) {
      setError("Failed to load scenarios: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadScenario = async (scenarioId) => {
    try {
      setLoading(true);
      const data = await api.scenarios.get(scenarioId);
      setSelectedScenario(data);
      setScenarioName(data.name);
      setScenarioDescription(data.description || "");
      setConfig(data.config || DEFAULT_CONFIG);
      setIsNewScenario(false);
      setError(null);
    } catch (err) {
      setError("Failed to load scenario: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);

      if (!scenarioName.trim()) {
        setError("Scenario name is required");
        return;
      }

      const payload = {
        name: scenarioName,
        description: scenarioDescription,
        config: {
          ...config,
          attachments: attachments.map((a) => ({
            id: a.id,
            name: a.name,
            url: a.url,
          })),
        },
      };

      let savedScenario;
      if (isNewScenario) {
        savedScenario = await api.scenarios.create(payload);
        setSuccess("Scenario created successfully!");
      } else {
        savedScenario = await api.scenarios.update(
          selectedScenario.id,
          payload,
        );
        setSuccess("Scenario updated successfully!");
      }

      setSelectedScenario(savedScenario);
      setIsNewScenario(false);
      await loadScenarios();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to save scenario: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedScenario) {
      setError("Please save the scenario first");
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await api.scenarios.publish(selectedScenario.id);
      setSuccess("Scenario published successfully!");
      await loadScenarios();
      await loadScenario(selectedScenario.id);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError("Failed to publish scenario: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleEnhanceWithLLM = async () => {
    try {
      setEnhancing(true);
      setError(null);

      const response = await api.llm.enhance({
        config: config,
        type: "config",
        context: "full_scenario",
        attachments: attachments.map((a) => ({ id: a.id, url: a.url })),
      });

      if (response.enhanced_config) {
        setConfig(response.enhanced_config);
        setSuccess(
          "✨ Configuration enhanced by AI! Review the changes and save when ready.",
        );
        setTimeout(() => setSuccess(null), 5000);
      } else if (response.suggestions && response.suggestions.length > 0) {
        setError(
          "AI provided suggestions but could not auto-apply them. Please check the JSON editor.",
        );
      }
    } catch (err) {
      setError("Failed to enhance with AI: " + err.message);
    } finally {
      setEnhancing(false);
    }
  };

  const handleNewScenario = () => {
    setSelectedScenario(null);
    setScenarioName("");
    setScenarioDescription("");
    setConfig(DEFAULT_CONFIG);
    setAttachments([]);
    setIsNewScenario(true);
    setCreateMode("manual");
    setShowGenerateForm(false);
    setGenerateForm({
      scenario_name: "",
      scenario_description: "",
      primary_goal: "",
      channel: "website_widget",
      tone: "",
      allowed_actions: ["#product_request", "#New_meeting_time", "#handover"],
    });
    setError(null);
    setSuccess(null);
  };

  const handleGenerateFormChange = (field, value) => {
    setGenerateForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleAllowedAction = (actionTag) => {
    setGenerateForm((prev) => {
      const exists = prev.allowed_actions.includes(actionTag);
      return {
        ...prev,
        allowed_actions: exists
          ? prev.allowed_actions.filter((a) => a !== actionTag)
          : [...prev.allowed_actions, actionTag],
      };
    });
  };

  const handleGenerateWithAI = async () => {
    if (!generateForm.scenario_name.trim()) {
      setError("Scenario name is required for AI generation");
      return;
    }
    if (!generateForm.scenario_description.trim()) {
      setError("Scenario description is required for AI generation");
      return;
    }
    if (!generateForm.primary_goal.trim()) {
      setError("Primary goal is required for AI generation");
      return;
    }
    if (generateForm.allowed_actions.length === 0) {
      setError("Select at least one allowed action");
      return;
    }

    try {
      setGenerating(true);
      setError(null);

      const generatedDraft = await api.llm.generateConfig({
        scenario_name: generateForm.scenario_name.trim(),
        scenario_description: generateForm.scenario_description.trim(),
        primary_goal: generateForm.primary_goal.trim(),
        channel: generateForm.channel,
        tone: generateForm.tone.trim() || undefined,
        allowed_actions: generateForm.allowed_actions,
        business_type: "general",
        goals: [generateForm.primary_goal.trim()],
      });

      const generatedConfig = generatedDraft.config || generatedDraft;
      const generatedName =
        generatedDraft.scenario_name || generateForm.scenario_name.trim();
      const generatedDescription =
        generatedDraft.scenario_summary ||
        generateForm.scenario_description.trim();

      if (generatedDraft.master_prompt) {
        generatedConfig.system_prompts = generatedConfig.system_prompts || {};
        if (!generatedConfig.system_prompts.main) {
          generatedConfig.system_prompts.main = generatedDraft.master_prompt;
        }
      }

      generatedConfig.ai_generation = {
        scenario_id: generatedDraft.scenario_id || null,
        required_slots: generatedDraft.required_slots || [],
        actions: generatedDraft.actions || generateForm.allowed_actions,
        stages: generatedDraft.stages || [],
        followup_strategy: generatedDraft.followup_strategy || [],
        primary_goal: generateForm.primary_goal.trim(),
        channel: generateForm.channel,
      };

      const savedScenario = await api.scenarios.create({
        name: generatedName,
        description: generatedDescription,
        config: generatedConfig,
      });

      setSelectedScenario(savedScenario);
      setScenarioName(savedScenario.name);
      setScenarioDescription(savedScenario.description || generatedDescription);
      setConfig(savedScenario.config || generatedConfig);
      setIsNewScenario(false);
      setCreateMode("manual");
      setShowGenerateForm(false);

      await loadScenarios();

      setSuccess(
        "AI scenario draft generated and saved. You can now edit stages, tasks, prompts, actions, and slots.",
      );
      setTimeout(() => setSuccess(null), 6000);
    } catch (err) {
      setError("Failed to generate scenario with AI: " + err.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleSystemPromptsChange = (prompts) => {
    setConfig((prev) => ({
      ...prev,
      system_prompts: prompts,
    }));
  };

  const handleConfigChange = (newConfig) => {
    setConfig(newConfig);
  };

  const handleAttachmentsChange = (newAttachments) => {
    setAttachments(newAttachments);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Scenario Configuration
          </h1>
          <p className="text-gray-600">
            Configure AI conversation scenarios with LLM-powered enhancements
          </p>
        </div>

        {/* Alert Messages */}
        {loading && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            Loading scenario data...
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              ×
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {h.scenarioId ? "Edit Scenario" : "New Scenario"}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {h.isPublished ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" /> Published (v{h.version}
                    )
                  </span>
                ) : (
                  <span className="text-slate-400">Draft (v{h.version})</span>
                )}
                {h.dirty && (
                  <span className="ml-2 text-amber-500">• Unsaved changes</span>
                )}
              </p>
            </div>
            <button
              onClick={() => setSuccess(null)}
              className="text-green-400 hover:text-green-600"
            >
              ×
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedScenario?.id || ""}
              onChange={(e) =>
                e.target.value
                  ? loadScenario(e.target.value)
                  : handleNewScenario()
              }
            >
              <option value="">+ New Scenario</option>
              {scenarios.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.is_published ? "✓" : "(draft)"}
                </option>
              ))}
            </select>
            <Button variant="ghost" size="sm" onClick={handleNewScenario}>
              New
            </Button>
            {isNewScenario && (
              <select
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={createMode}
                onChange={(e) => {
                  const nextMode = e.target.value;
                  setCreateMode(nextMode);
                  setShowGenerateForm(nextMode === "ai");
                }}
              >
                <option value="manual">Manual Setup</option>
                <option value="ai">Generate with AI</option>
              </select>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              className="gap-1.5 text-xs border-violet-200 text-violet-600 hover:bg-violet-50"
              onClick={() => setShowGenerateModal(true)}
            >
              <Wand2 className="w-3.5 h-3.5" />
              Generate with AI
            </Button>

            <Button
              variant="outline"
              className="gap-1.5 text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
              onClick={h.enhanceConfig}
              disabled={h.enhancing}
            >
              {h.enhancing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5" />
              )}
              Enhance Config
            </Button>

            {h.scenarioId && (
              <Button
                variant="outline"
                className="gap-1.5 text-xs"
                onClick={() => setShowSimulator(true)}
              >
                <Play className="w-3.5 h-3.5" />
                Simulate
              </Button>
            )}

            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white gap-1.5 text-xs shadow-lg shadow-blue-500/20"
              onClick={h.handleSave}
              disabled={h.saving}
            >
              {h.saving ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              Save Draft
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handlePublish}
              disabled={saving || isNewScenario}
            >
              <Play className="w-4 h-4 mr-2" />
              Publish
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {isNewScenario && showGenerateForm && (
              <Card>
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  Generate Scenario with AI
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scenario Name *
                    </label>
                    <input
                      type="text"
                      value={generateForm.scenario_name}
                      onChange={(e) =>
                        handleGenerateFormChange(
                          "scenario_name",
                          e.target.value,
                        )
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Ecommerce Product Consultation"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Scenario Description *
                    </label>
                    <textarea
                      value={generateForm.scenario_description}
                      onChange={(e) =>
                        handleGenerateFormChange(
                          "scenario_description",
                          e.target.value,
                        )
                      }
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Describe the chatbot behavior, stage flow expectations, and conversion logic..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Primary Goal *
                      </label>
                      <input
                        type="text"
                        value={generateForm.primary_goal}
                        onChange={(e) =>
                          handleGenerateFormChange(
                            "primary_goal",
                            e.target.value,
                          )
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="e.g., Book consultation"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Channel *
                      </label>
                      <select
                        value={generateForm.channel}
                        onChange={(e) =>
                          handleGenerateFormChange("channel", e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="website_widget">Website Widget</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="instagram">Instagram</option>
                        <option value="telegram">Telegram</option>
                        <option value="multichannel">Multi-channel</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tone (optional)
                    </label>
                    <input
                      type="text"
                      value={generateForm.tone}
                      onChange={(e) =>
                        handleGenerateFormChange("tone", e.target.value)
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Helpful and sales-oriented"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Allowed Actions *
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {[
                        "#product_request",
                        "#New_meeting_time",
                        "#handover",
                        "#stop_script",
                      ].map((actionTag) => (
                        <label
                          key={actionTag}
                          className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                          <input
                            type="checkbox"
                            checked={generateForm.allowed_actions.includes(
                              actionTag,
                            )}
                            onChange={() => toggleAllowedAction(actionTag)}
                          />
                          <span className="text-sm text-gray-800">
                            {actionTag}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCreateMode("manual");
                        setShowGenerateForm(false);
                      }}
                    >
                      Back to Manual
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleGenerateWithAI}
                      disabled={generating}
                    >
                      {generating ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Generating Draft...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Generate & Create Draft
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Basic Info */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Basic Information
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Scenario Name *
                  </label>
                  <input
                    type="text"
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Lead Qualification Flow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={scenarioDescription}
                    onChange={(e) => setScenarioDescription(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Describe the purpose and flow of this scenario..."
                  />
                </div>
              </div>
            </Card>

            {h.scenarioId && h.isAdmin && (
              <Button
                variant="outline"
                className="gap-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  if (
                    window.confirm(
                      "Delete this scenario? This action cannot be undone.",
                    )
                  ) {
                    h.handleDelete();
                  }
                }}
                disabled={h.deleting}
                title={
                  h.isPublished
                    ? "Published scenarios cannot be deleted."
                    : "Delete scenario"
                }
              >
                {h.deleting ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                Delete
              </Button>
            )}

            {h.scenarioId && h.isAdmin && (
              <Button
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white gap-1.5 text-xs shadow-lg shadow-emerald-500/20"
                onClick={h.handlePublish}
                disabled={h.publishing}
              >
                {h.publishing ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                Publish
              </Button>
            )}
          </div>
        </div>

        {/* Save / error messages */}
        {h.saveMessage && (
          <div
            className={`mt-3 px-4 py-2 rounded-xl text-sm flex items-center gap-2 ${
              h.saveMessage.type === "success"
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : h.saveMessage.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
            }`}
          >
            {h.saveMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            {h.saveMessage.text}
          </div>
        )}
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-6">
        <div className="flex gap-1 overflow-x-auto no-scrollbar -mb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Content area ────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {TAB_MAP[activeTab]?.(h)}
        </div>
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────── */}
      {showGenerateModal && (
        <ScenarioGenerateModal
          onClose={() => setShowGenerateModal(false)}
          onGenerate={async (payload) => {
            const ok = await h.generateConfig(payload);
            if (ok) setShowGenerateModal(false);
          }}
          generating={h.generating}
        />
      )}

      {showSimulator && h.scenarioId && (
        <ScenarioSimulator
          scenario={{ id: h.scenarioId, name: h.name, config: h.config }}
          onClose={() => setShowSimulator(false)}
        />
      )}
    </div>
  );
}

export default ScenarioConfiguration;
