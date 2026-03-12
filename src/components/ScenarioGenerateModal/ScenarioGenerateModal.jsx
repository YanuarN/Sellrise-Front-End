import { useState } from 'react';
import { Wand2, X, Loader2 } from 'lucide-react';
import Button from '../Button';

export default function ScenarioGenerateModal({ onClose, onGenerate, generating }) {
  const [form, setForm] = useState({ description: '', business_type: '', goals: '' });

  const handleGenerate = () => {
    onGenerate({
      description: form.description,
      business_type: form.business_type || undefined,
      goals: form.goals
        ? form.goals.split(',').map((goal) => goal.trim()).filter(Boolean)
        : undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 animate-[fadeIn_0.2s_ease-out]">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">Generate Config with AI</h2>
              <p className="text-xs text-slate-400">
                Describe your business and goals — AI will generate a complete scenario.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Business Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 resize-none h-28"
              placeholder="e.g. We are a cosmetic tourism company in Turkey connecting clients with verified surgeons..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Business Type</label>
            <input
              type="text"
              value={form.business_type}
              onChange={(e) => setForm({ ...form, business_type: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              placeholder="e.g. SaaS, E-commerce, Tourism, Healthcare..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Goals (comma-separated)</label>
            <input
              type="text"
              value={form.goals}
              onChange={(e) => setForm({ ...form, goals: e.target.value })}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
              placeholder="e.g. qualify leads, book meetings, collect emails"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button
            className="bg-violet-600 hover:bg-violet-700 text-white gap-1.5"
            onClick={handleGenerate}
            disabled={generating || !form.description.trim()}
          >
            {generating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
            Generate
          </Button>
        </div>
      </div>
    </div>
  );
}
