import {
  FileText, Settings2, ListChecks, Zap, Layers,
  MessageSquare, BrainCircuit, Clock, Code2,
} from 'lucide-react';

// ─── Default scenario config template ─────────────────────────────────────────
export const DEFAULT_CONFIG = {
  version: '1.0',
  rules: {
    one_question_rule: true,
    max_sentences: 2,
    max_chars: { default: 420, outbound: 520, followup: 520 },
    facts_only: true,
    forbid: ['I think', 'probably', 'maybe'],
    emoji: { allowed: false },
  },
  slots_schema: {
    industry: { type: 'string', required: false },
    role: { type: 'string', required: false },
    email: { type: 'string', required: false },
  },
  actions_catalog: {
    '#handover': { type: 'handover_to_human', payload_schema: {} },
    '#product_request': { type: 'send_products', payload_schema: {} },
  },
  prompts: {
    main: 'You are a professional AI assistant for lead qualification. Be concise and helpful.',
  },
  stages: [
    {
      stage_id: 'stage_0_outbound',
      priority: 100,
      entry_condition: { type: 'first_message' },
      instruction: 'Deliver a trust-building welcome and begin qualification.',
      fallback_phrases: ['Hi, welcome! How can I help you today?'],
      tasks: [
        {
          task_id: 'task_0_hello',
          priority: 100,
          criteria: { type: 'always' },
          instruction: 'Send the best possible first hello message.',
          approved_phrases: ['Hi, welcome! How can I help you today?'],
        },
      ],
    },
  ],
  llm_config: {
    model: 'google/gemini-2.5-flash',
    temperature: 0.7,
    max_tokens: 2000,
  },
  settings: { kb_only_strict: false },
};

export const FIXED_LLM_MODEL = 'google/gemini-2.5-flash';

export const DEFAULT_LLM_CONFIG = {
  model: FIXED_LLM_MODEL,
  temperature: 0.7,
  max_tokens: 2000,
};

// ─── Tab definitions ──────────────────────────────────────────────────────────
export const TABS = [
  { id: 'general', label: 'General', icon: FileText },
  { id: 'rules', label: 'Rules', icon: Settings2 },
  { id: 'slots', label: 'Slots', icon: ListChecks },
  { id: 'actions', label: 'Actions', icon: Zap },
  { id: 'stages', label: 'Stages', icon: Layers },
  { id: 'prompts', label: 'Prompts', icon: MessageSquare },
  { id: 'llm_config', label: 'LLM Config', icon: BrainCircuit },
  { id: 'followups', label: 'Follow-ups', icon: Clock },
  { id: 'json', label: 'JSON Editor', icon: Code2 },
];

// ─── Prompt templates ─────────────────────────────────────────────────────────
export const PROMPT_TEMPLATES = {
  main: 'You are a professional AI assistant. Be concise, helpful, and factual. Never speculate or invent information. Ask one question at a time.',
  qualification: 'Your goal is to qualify leads efficiently. Collect industry, role, and key interests. Keep messages short and professional.',
  outbound: 'You are initiating a conversation. Introduce yourself, explain the value proposition briefly, and ask permission to continue.',
  meeting_booking: 'Your goal is to book a meeting. Propose a clear agenda, collect date/time preferences and timezone, then confirm.',
  followup: 'This is a follow-up message. Be polite, reference the previous conversation, and provide value to re-engage.',
};

// ─── Action type options ──────────────────────────────────────────────────────
export const ACTION_TYPES = [
  { value: 'handover_to_human', label: 'Handover to Human' },
  { value: 'send_products', label: 'Send Products' },
  { value: 'book_meeting', label: 'Book Meeting' },
  { value: 'photo_upload', label: 'Photo Upload (Phlastic)' },
  { value: 'stop_automation', label: 'Stop Automation' },
  { value: 'custom', label: 'Custom' },
];

// ─── Slot type options ────────────────────────────────────────────────────────
export const SLOT_TYPES = [
  { value: 'string', label: 'string' },
  { value: 'number', label: 'number' },
  { value: 'boolean', label: 'boolean' },
  { value: 'datetime', label: 'datetime' },
  { value: 'email', label: 'email' },
];

// ─── Condition type options ───────────────────────────────────────────────────
export const CONDITION_TYPES = [
  { value: 'always', label: 'Always' },
  { value: 'first_message', label: 'First Message' },
  { value: 'all', label: 'All (AND)' },
  { value: 'any', label: 'Any (OR)' },
  { value: 'none', label: 'None' },
];
