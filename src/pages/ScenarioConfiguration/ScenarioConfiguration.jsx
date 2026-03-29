/**
 * ScenarioConfiguration – slim page orchestrator.
 *
 * All heavy logic lives in:
 *   hooks/useScenarioConfig  – state, CRUD, LLM helpers
 *   src/components/*         – one folder per component + barrel exports
 *   constants                – tabs, defaults, templates
 */
import { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, Save, Send, Loader2, Sparkles, Play, Trash2,
  CheckCircle2, AlertCircle, Wand2,
} from 'lucide-react';
import {
  Button,
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
  SpotlightOnboarding,
} from '../../components';
import useScenarioConfig from './hooks/useScenarioConfig';
import { TABS } from './constants';

// ─── Onboarding: intro tour (shown once on first visit) ───────────────────────
const INTRO_ONBOARDING_STEPS = [
  {
    target: 'editor-header',
    title: 'Your Scenario Editor 📝',
    description:
      'This is where you customise everything about your chatbot flow. Don\'t worry — we\'ll walk you through each part!',
  },
  {
    target: 'editor-actions',
    title: 'Quick Actions',
    description:
      'Use these buttons to save your work, generate content with AI, test your scenario, or publish it when you\'re ready.',
  },
  {
    target: 'tab-bar',
    title: 'Tabs = Sections',
    description:
      'Each tab is a different part of your scenario. Click any tab to see a quick guide for that section!',
  },
];

// ─── Onboarding: per-tab tours (shown once per tab) ───────────────────────────
const TAB_ONBOARDING = {
  general: [
    {
      target: 'general-name',
      title: 'Give It a Name',
      description: 'Pick a clear name so you can find this scenario later. Example: "Lead Qualification" or "Product Demo".',
    },
    {
      target: 'general-description',
      title: 'Add a Short Description',
      description: 'What does this chatbot flow do? A one-liner helps your team know what it\'s for.',
    },
    {
      target: 'general-version',
      title: 'Version Number',
      description: 'Bump this whenever you make a big change. It helps you keep track of updates.',
    },
  ],
  rules: [
    {
      target: 'rules-toggles',
      title: 'Behaviour Switches',
      description: 'Turn these on or off to control how the bot speaks — one question at a time, facts only, emojis, etc.',
    },
    {
      target: 'rules-char-limits',
      title: 'Message Length Limits',
      description: 'Set the maximum characters per message. Shorter = punchier replies.',
    },
    {
      target: 'rules-forbidden',
      title: 'Words to Avoid',
      description: 'List any words or phrases the bot should never say. Separate them with commas.',
    },
  ],
  slots: [
    {
      target: 'slots-section',
      title: 'Data You Want to Collect',
      description: 'Each slot is a piece of info from the visitor — name, email, industry, etc. Hit "Add Slot" to create one, pick a type, and mark it required if you must have it.',
    },
  ],
  actions: [
    {
      target: 'actions-section',
      title: 'What Can the Bot Do?',
      description: 'Actions are things that happen behind the scenes: hand off to a human, send products, book meetings. Click "Add Action" to set one up.',
    },
  ],
  stages: [
    {
      target: 'stages-section',
      title: 'Build the Conversation Step-by-Step',
      description: 'Stages define the order of your chat. Each stage has tasks inside it. Higher priority = runs first. Click a stage to expand it and add tasks.',
    },
  ],
  prompts: [
    {
      target: 'prompts-section',
      title: 'Tell the AI How to Talk',
      description: 'Prompts are instructions for the AI tone and personality. Pick a template to get started, or write your own. You can also hit "Enhance" to let AI improve it.',
    },
  ],
  llm_config: [
    {
      target: 'llm-model-settings',
      title: 'AI Model Settings',
      description: 'Temperature controls creativity (lower = more predictable). Max tokens limits reply length. The model itself is locked for consistency.',
    },
    {
      target: 'llm-kb-setting',
      title: 'Knowledge Base Mode',
      description: 'Turn this on if you only want the bot to answer from your uploaded documents — no guessing!',
    },
  ],
  followups: [
    {
      target: 'followups-section',
      title: 'Auto-Follow-Up Messages',
      description: 'If the visitor stops replying, these messages go out after a delay you set. Click "Add Sequence" to create a chain of reminders.',
    },
  ],
  json: [
    {
      target: 'json-ai-editor',
      title: 'AI-Powered Edits',
      description: 'Describe what you want in plain English — like "add a new stage for product demos" — and hit Apply. The AI edits the JSON for you.',
    },
    {
      target: 'json-raw-editor',
      title: 'Raw JSON',
      description: 'This is the full configuration as code. Power users can edit it directly. Click "Format" to tidy it up.',
    },
  ],
};

// ─── Tab renderer map ──────────────────────────────────────────────────────
const TAB_MAP = {
  general: (h) => (
    <ScenarioGeneralTab
      name={h.name}
      setName={(v) => { h.setName(v); }}
      description={h.description}
      setDescription={(v) => { h.setDescription(v); }}
      version={h.version}
      setVersion={(v) => { h.setVersion(v); }}
    />
  ),
  rules:      (h) => <ScenarioRulesTab config={h.config} updateConfig={h.updateConfig} />,
  slots:      (h) => <ScenarioSlotsTab config={h.config} updateConfig={h.updateConfig} />,
  actions:    (h) => <ScenarioActionsTab config={h.config} updateConfig={h.updateConfig} />,
  stages:     (h) => <ScenarioStagesTab config={h.config} updateConfig={h.updateConfig} />,
  prompts:    (h) => (
    <ScenarioPromptsTab
      config={h.config}
      updateConfig={h.updateConfig}
      enhancePrompt={h.enhancePrompt}
      enhancingField={h.enhancingField}
    />
  ),
  llm_config: (h) => <ScenarioLLMConfigTab config={h.config} updateConfig={h.updateConfig} />,
  followups:  (h) => <ScenarioFollowupsTab config={h.config} updateConfig={h.updateConfig} />,
  json:       (h) => (
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

// ═══════════════════════════════════════════════════════════════════════════════
export default function ScenarioConfiguration() {
  const h = useScenarioConfig();
  const [activeTab, setActiveTab] = useState('general');
  const [showSimulator, setShowSimulator] = useState(false);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const onboardingRef = useRef(null);

  // Sync JSON text when switching to "json" tab
  useEffect(() => {
    if (activeTab === 'json') h.syncJsonText();
  }, [activeTab, h.config]);

  // ─── Loading state ─────────────────────────────────────────────────────
  if (h.loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-50/50 rounded-2xl overflow-hidden">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="shrink-0 px-6 pt-6 pb-4 border-b border-slate-200 bg-white" data-onboarding="editor-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => h.navigate('/scenarios')}
              className="w-9 h-9 rounded-xl border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:border-slate-300 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                {h.scenarioId ? 'Edit Scenario' : 'New Scenario'}
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                {h.isPublished ? (
                  <span className="inline-flex items-center gap-1 text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" /> Published (v{h.version})
                  </span>
                ) : (
                  <span className="text-slate-400">Draft (v{h.version})</span>
                )}
                {h.dirty && <span className="ml-2 text-amber-500">• Unsaved changes</span>}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2" data-onboarding="editor-actions">
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
              {h.enhancing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
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
              {h.saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Draft
            </Button>

            {h.scenarioId && h.isAdmin && (
              <Button
                variant="outline"
                className="gap-1.5 text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => {
                  if (window.confirm('Delete this scenario? This action cannot be undone.')) {
                    h.handleDelete();
                  }
                }}
                disabled={h.deleting}
                title={h.isPublished ? 'Published scenarios cannot be deleted.' : 'Delete scenario'}
              >
                {h.deleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                Delete
              </Button>
            )}

            {h.scenarioId && h.isAdmin && (
              <Button
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white gap-1.5 text-xs shadow-lg shadow-emerald-500/20"
                onClick={h.handlePublish}
                disabled={h.publishing}
              >
                {h.publishing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Publish
              </Button>
            )}
          </div>
        </div>

        {/* Save / error messages */}
        {h.saveMessage && (
          <div
            className={`mt-3 px-4 py-2 rounded-xl text-sm flex items-center gap-2 ${
              h.saveMessage.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : h.saveMessage.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-blue-50 text-blue-700 border border-blue-200'
            }`}
          >
            {h.saveMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            {h.saveMessage.text}
          </div>
        )}
      </div>

      {/* ── Tab bar ─────────────────────────────────────────────────────── */}
      <div className="shrink-0 border-b border-slate-200 bg-white px-6" data-onboarding="tab-bar">
        <div className="flex gap-1 overflow-x-auto no-scrollbar -mb-px">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                data-onboarding={`tab-${tab.id}`}
                className={`flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
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
      <div className="flex-1 overflow-y-auto p-6" data-onboarding="editor-content">
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

      {/* ── Guided Tours ──────────────────────────────────────────────── */}
      {/* Intro tour: header, actions, tab bar (once) */}
      <SpotlightOnboarding
        steps={INTRO_ONBOARDING_STEPS}
        storageKey="scenario_editor_intro_seen"
      />
      {/* Per-tab tour: triggers when user switches to a tab */}
      {TAB_ONBOARDING[activeTab] && (
        <SpotlightOnboarding
          key={activeTab}
          ref={onboardingRef}
          steps={TAB_ONBOARDING[activeTab]}
          storageKey={`scenario_tab_${activeTab}_seen`}
          showHint
        />
      )}
    </div>
  );
}
