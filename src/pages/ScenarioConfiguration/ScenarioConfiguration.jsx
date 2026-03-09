import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Save, Play, Upload, Sparkles, FileJson, FileText, 
  Settings, AlertCircle, CheckCircle, Loader, Eye 
} from 'lucide-react';
import { Button, Card } from '../../components';
import api from '../../services/api';
import JsonEditor from './components/JsonEditor';
import SystemPromptEditor from './components/SystemPromptEditor';
import FileAttachment from './components/FileAttachment';
import ScenarioPreview from './components/ScenarioPreview';

const defaultScenarioConfig = {
  version: "1.0",
  bot_id: "sellrise_conversation_engine",
  language_default: "en",
  timezone_default: "Europe/Rome",
  rules: {
    one_question_rule: true,
    max_sentences: 2,
    max_chars: {
      default: 420,
      outbound: 520,
      followup: 520
    },
    facts_only: true,
    forbid: ["I think", "probably", "maybe"],
    emoji: {
      allowed: false
    }
  },
  slots_schema: {
    industry: { type: "string", required: false },
    role: { type: "string", required: false },
    interest_trigger: { type: "string", required: false },
    acquisition_channels: { type: "string", required: false },
    lead_handler: { type: "string", required: false },
    lead_tracking: { type: "string", required: false },
    pain_points: { type: "string", required: false },
    lost_leads_cost: { type: "string", required: false },
    meeting_datetime_candidate: { type: "datetime", required: false },
    timezone: { type: "string", required: false },
    email: { type: "string", required: false }
  },
  actions_catalog: {
    "#product_request": {
      type: "send_products",
      payload_schema: {
        segment: { type: "string", required: false }
      }
    },
    "#New_meeting_time": {
      type: "book_meeting",
      payload_schema: {
        datetime: { type: "datetime", required: true },
        timezone: { type: "string", required: false }
      }
    },
    "#stop_script": {
      type: "stop_automation",
      payload_schema: {}
    },
    "#handover": {
      type: "handover_to_human",
      payload_schema: {
        reason: { type: "string", required: false }
      }
    }
  },
  stages: [
    {
      stage_id: "stage_0_outbound",
      priority: 100,
      entry_condition: {
        type: "first_message"
      },
      required_slots: [],
      tasks: [
        {
          task_id: "task_0_1",
          priority: 100,
          criteria: {
            type: "always"
          },
          instruction: "Send an outbound intro message and request permission to ask 2 short questions.",
          approved_phrases: [
            "Hi! I'm {agent_name} from {company}. We help businesses qualify inbound leads with AI so they reply faster and lose fewer opportunities. Can I ask 2 quick questions?"
          ],
          tags: [],
          slot_questions: []
        }
      ]
    },
    {
      stage_id: "stage_1_start",
      priority: 90,
      entry_condition: {
        type: "any",
        when: [
          "slots.industry is null",
          "slots.role is null",
          "slots.interest_trigger is null"
        ]
      },
      required_slots: [],
      tasks: [
        {
          task_id: "task_1_1_user_initiated",
          priority: 100,
          criteria: {
            type: "all",
            when: ["context.user_initiated == true"]
          },
          instruction: "Greet, introduce, give value, and ask one question about what they want to improve.",
          approved_phrases: [
            "Hi! I'm {agent_name} from {company}. We use AI to qualify inbound leads and speed up response times. What are you trying to improve most: speed, conversion, or workload?"
          ],
          tags: []
        },
        {
          task_id: "task_1_2_agent_initiated",
          priority: 90,
          criteria: {
            type: "all",
            when: ["context.user_initiated == false"]
          },
          instruction: "Acknowledge response and ask one context question.",
          approved_phrases: [
            "Thanks—got it. Which channel matters most right now: website forms, WhatsApp/Telegram, Instagram, or phone calls?"
          ],
          tags: []
        }
      ]
    },
    {
      stage_id: "stage_2_quick_qualification",
      priority: 80,
      entry_condition: {
        type: "any",
        when: ["context.channel_preference == 'chat'"]
      },
      required_slots: ["industry", "role", "interest_trigger"],
      tasks: [
        {
          task_id: "task_2_1_collect_basics",
          priority: 100,
          criteria: {
            type: "any",
            when: [
              "slots.industry is null",
              "slots.role is null",
              "slots.interest_trigger is null"
            ]
          },
          instruction: "Collect industry, role, and interest trigger in one message.",
          approved_phrases: [
            "To make sure this fits: what business are you in, what's your role, and what triggered your interest (speed, conversion, or workload)?"
          ],
          tags: ["#need_more_info"]
        },
        {
          task_id: "task_2_3_offer_channel_choice",
          priority: 80,
          criteria: {
            type: "all",
            when: [
              "slots.industry is not null",
              "slots.role is not null",
              "slots.interest_trigger is not null"
            ]
          },
          instruction: "Offer to continue in chat or book a 10–15 min call.",
          approved_phrases: [
            "Great—context is clear. Do you prefer continuing here, or a quick 10–15 minute call to align requirements and show the approach?"
          ],
          tags: ["#channel_choice"]
        }
      ]
    },
    {
      stage_id: "stage_3_full_qualification",
      priority: 70,
      entry_condition: {
        type: "any",
        when: ["context.full_qualification_allowed == true"]
      },
      required_slots: [],
      tasks: [
        {
          task_id: "task_3_1_acquisition",
          priority: 100,
          criteria: {
            type: "all",
            when: ["slots.acquisition_channels is null"]
          },
          instruction: "Ask how they acquire customers and whether inbound is stable.",
          approved_phrases: [
            "How do you currently acquire customers (ads, website, social, partners)? Do you have stable inbound requests?"
          ],
          tags: ["#qualify"]
        },
        {
          task_id: "task_3_5_summary_offer_call",
          priority: 60,
          criteria: {
            type: "all",
            when: ["context.full_qualification_complete == true"]
          },
          instruction: "Summarize and propose a call/demo.",
          approved_phrases: [
            "Thanks—got it. Based on what you shared, the main bottleneck is {summary_pain}. Want to do a 15-minute demo to show the exact flow and integrations?"
          ],
          tags: ["#offer_demo"]
        }
      ]
    },
    {
      stage_id: "stage_4_meeting_booking",
      priority: 60,
      entry_condition: {
        type: "any",
        when: [
          "context.user_requested_meeting == true",
          "context.lead_qualified == true"
        ]
      },
      required_slots: [],
      tasks: [
        {
          task_id: "task_4_1_offer_meeting",
          priority: 100,
          criteria: {
            type: "all",
            when: ["context.meeting_offered == false"]
          },
          instruction: "Offer meeting and set agenda.",
          approved_phrases: [
            "Perfect. In 15 minutes we'll map your process, show the AI qualification flow for your channels, and agree next steps. What day/time works for you?"
          ],
          tags: ["#book_demo"]
        },
        {
          task_id: "task_4_4_create_and_confirm",
          priority: 70,
          criteria: {
            type: "all",
            when: [
              "slots.meeting_datetime_candidate is not null",
              "slots.email is not null",
              "context.meeting_confirmed == false"
            ]
          },
          instruction: "Confirm booking and trigger backend meeting creation.",
          approved_phrases: [
            "Done—I booked {datetime}. You'll receive the invite at {email}. If anything changes, just message me and we'll reschedule."
          ],
          tags: ["#New_meeting_time"]
        }
      ]
    },
    {
      stage_id: "stage_5_closure",
      priority: 10,
      entry_condition: {
        type: "any",
        when: [
          "context.stop_script == true",
          "context.conversation_complete == true"
        ]
      },
      required_slots: [],
      tasks: [
        {
          task_id: "task_5_1_close_after_booking",
          priority: 100,
          criteria: {
            type: "all",
            when: ["context.meeting_confirmed == true"]
          },
          instruction: "Close politely and mention reminder.",
          approved_phrases: [
            "Thanks—booked for {datetime}. I'll remind you shortly before the call. If questions come up, just message me."
          ],
          tags: ["#end"]
        },
        {
          task_id: "task_5_2_close_stop",
          priority: 90,
          criteria: {
            type: "all",
            when: ["context.stop_script == true"]
          },
          instruction: "Send value and stop automation.",
          approved_phrases: [
            "Understood. If you return to this later, just message me and I'll help with your case. Have a good day."
          ],
          tags: ["#stop_script"]
        }
      ]
    }
  ],
  followups: [
    {
      followup_id: "followups_stages_1_3",
      applies_to_stages: ["stage_1_start", "stage_2_quick_qualification", "stage_3_full_qualification"],
      steps: [
        {
          step_id: "fu_1",
          criteria: { type: "silence", min_minutes: 60 },
          approved_phrases: ["Just checking—are you still there?"],
          tags: []
        },
        {
          step_id: "fu_2",
          criteria: { type: "silence", min_minutes: 240 },
          approved_phrases: ["Did you get a chance to look at my last question?"],
          tags: []
        },
        {
          step_id: "fu_3",
          criteria: { type: "silence", min_minutes: 1440 },
          approved_phrases: [
            "If you want, we can do a quick 15-minute call to answer everything for your exact situation—no commitment. When would be convenient?"
          ],
          tags: ["#offer_demo"]
        },
        {
          step_id: "fu_4",
          criteria: { type: "silence", min_minutes: 4320 },
          approved_phrases: [
            "No worries—here are useful resources: {resources_links}. If you have questions later, just message me."
          ],
          tags: ["#stop_script"]
        }
      ]
    },
    {
      followup_id: "followups_stages_4_5",
      applies_to_stages: ["stage_4_meeting_booking", "stage_5_closure"],
      steps: [
        {
          step_id: "fu_1",
          criteria: { type: "silence", min_minutes: 1440 },
          approved_phrases: [
            "Sharing useful links in case helpful: {resources_links}. If you want to continue later, just message me."
          ],
          tags: ["#stop_script"]
        }
      ]
    }
  ],
  system_prompts: {
    main: "You are an AI conversation agent for lead qualification. Follow all rules strictly: max 1 question per message, max 2 sentences, max 420 characters. Never use phrases like 'I think', 'probably', or 'maybe'. State facts only from the knowledge base—never invent information. Be professional, direct, and helpful.",
    qualification: "Your goal is to efficiently qualify leads by collecting required information (industry, role, interest trigger) through one question at a time. Keep responses concise (max 2 sentences, 420 chars). Guide the conversation toward either a quick chat qualification or booking a 15-minute demo call.",
    outbound: "When initiating outbound contact, introduce yourself and the company value proposition in one sentence, then request permission to ask 2 short questions. Keep total message under 520 characters. Be respectful of their time.",
    meeting_booking: "When booking meetings, be specific about the agenda (15-minute call to map process, show AI flow, agree next steps). Collect datetime and email efficiently. Confirm booking clearly with all details. Handle objections by offering flexible alternatives without repeating the same close.",
    followup: "For follow-up messages after silence, be brief and non-pushy. First check in (60 min silence), then remind (4 hours), offer demo (24 hours), or send resources and soft close (3 days). Max 520 characters per followup message."
  },
  llm_config: {
    model: "anthropic/claude-3.5-sonnet",
    temperature: 0.7,
    max_tokens: 2000
  }
};

function ScenarioConfiguration() {
  const [searchParams] = useSearchParams();
  const [scenarios, setScenarios] = useState([]);
  const [selectedScenario, setSelectedScenario] = useState(null);
  const [scenarioName, setScenarioName] = useState('');
  const [scenarioDescription, setScenarioDescription] = useState('');
  const [config, setConfig] = useState(defaultScenarioConfig);
  const [attachments, setAttachments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isNewScenario, setIsNewScenario] = useState(true);

  // Load all scenarios once on mount.
  useEffect(() => {
    loadScenarios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-load a specific scenario when ?id= param is present or changes.
  useEffect(() => {
    const idParam = searchParams.get('id');
    if (idParam) {
      loadScenario(idParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const loadScenarios = async () => {
    try {
      setLoading(true);
      const data = await api.scenarios.list();
      setScenarios(data);
    } catch (err) {
      setError('Failed to load scenarios: ' + err.message);
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
      setScenarioDescription(data.description || '');
      setConfig(data.config || defaultScenarioConfig);
      setIsNewScenario(false);
      setError(null);
    } catch (err) {
      setError('Failed to load scenario: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      
      if (!scenarioName.trim()) {
        setError('Scenario name is required');
        return;
      }

      const payload = {
        name: scenarioName,
        description: scenarioDescription,
        config: {
          ...config,
          attachments: attachments.map(a => ({ id: a.id, name: a.name, url: a.url }))
        }
      };

      let savedScenario;
      if (isNewScenario) {
        savedScenario = await api.scenarios.create(payload);
        setSuccess('Scenario created successfully!');
      } else {
        savedScenario = await api.scenarios.update(selectedScenario.id, payload);
        setSuccess('Scenario updated successfully!');
      }

      setSelectedScenario(savedScenario);
      setIsNewScenario(false);
      await loadScenarios();
      
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to save scenario: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!selectedScenario) {
      setError('Please save the scenario first');
      return;
    }

    try {
      setSaving(true);
      setError(null);
      await api.scenarios.publish(selectedScenario.id);
      setSuccess('Scenario published successfully!');
      await loadScenarios();
      await loadScenario(selectedScenario.id);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Failed to publish scenario: ' + err.message);
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
        type: 'config',
        context: 'full_scenario',
        attachments: attachments.map(a => ({ id: a.id, url: a.url }))
      });

      if (response.enhanced_config) {
        setConfig(response.enhanced_config);
        setSuccess('✨ Configuration enhanced by AI! Review the changes and save when ready.');
        setTimeout(() => setSuccess(null), 5000);
      } else if (response.suggestions && response.suggestions.length > 0) {
        setError('AI provided suggestions but could not auto-apply them. Please check the JSON editor.');
      }
    } catch (err) {
      setError('Failed to enhance with AI: ' + err.message);
    } finally {
      setEnhancing(false);
    }
  };

  const handleNewScenario = () => {
    setSelectedScenario(null);
    setScenarioName('');
    setScenarioDescription('');
    setConfig(defaultScenarioConfig);
    setAttachments([]);
    setIsNewScenario(true);
    setError(null);
    setSuccess(null);
  };

  const handleSystemPromptsChange = (prompts) => {
    setConfig(prev => ({
      ...prev,
      system_prompts: prompts
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Scenario Configuration</h1>
          <p className="text-gray-600">Configure AI conversation scenarios with LLM-powered enhancements</p>
        </div>

        {/* Alert Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              ×
            </button>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">Success</p>
              <p className="text-sm text-green-700">{success}</p>
            </div>
            <button onClick={() => setSuccess(null)} className="text-green-400 hover:text-green-600">
              ×
            </button>
          </div>
        )}

        {/* Toolbar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedScenario?.id || ''}
              onChange={(e) => e.target.value ? loadScenario(e.target.value) : handleNewScenario()}
            >
              <option value="">+ New Scenario</option>
              {scenarios.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} {s.is_published ? '✓' : '(draft)'}
                </option>
              ))}
            </select>
            <Button variant="ghost" size="sm" onClick={handleNewScenario}>
              New
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {showPreview ? 'Hide' : 'Show'} Preview
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEnhanceWithLLM}
              disabled={enhancing}
              title="AI will analyze and improve the entire scenario configuration"
            >
              {enhancing ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              Enhance All with AI
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Save className="w-4 h-4 mr-2" />
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

            {/* System Prompts */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5" />
                System Prompts
              </h2>
              <SystemPromptEditor
                prompts={config.system_prompts}
                onChange={handleSystemPromptsChange}
              />
            </Card>

            {/* JSON Configuration */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileJson className="w-5 h-5" />
                Configuration JSON
              </h2>
              <JsonEditor
                value={config}
                onChange={handleConfigChange}
              />
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* File Attachments */}
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" />
                LLM Grounding Files
              </h2>
              <FileAttachment
                attachments={attachments}
                onChange={handleAttachmentsChange}
              />
            </Card>

            {/* Scenario Info */}
            {selectedScenario && (
              <Card>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Scenario Info</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Version:</span>
                    <span className="font-medium">{selectedScenario.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`font-medium ${selectedScenario.is_published ? 'text-green-600' : 'text-yellow-600'}`}>
                      {selectedScenario.is_published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Created:</span>
                    <span className="font-medium">
                      {new Date(selectedScenario.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Updated:</span>
                    <span className="font-medium">
                      {new Date(selectedScenario.updated_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Preview Modal */}
        {showPreview && (
          <ScenarioPreview
            config={config}
            onClose={() => setShowPreview(false)}
          />
        )}
      </div>
    </div>
  );
}

export default ScenarioConfiguration;
