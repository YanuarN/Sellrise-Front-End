import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { scenarioService } from '../../../services';
import api from '../../../services/api';
import useAuthStore from '../../../stores/authStore';
import { DEFAULT_CONFIG, DEFAULT_LLM_CONFIG, FIXED_LLM_MODEL } from '../constants';
import { deepClone } from '../utils';

function applyScenarioDefaults(rawConfig) {
  const next =
    rawConfig && typeof rawConfig === 'object'
      ? deepClone(rawConfig)
      : deepClone(DEFAULT_CONFIG);

  next.llm_config = {
    ...DEFAULT_LLM_CONFIG,
    ...(next.llm_config || {}),
    model: FIXED_LLM_MODEL,
  };

  return next;
}

/**
 * Central hook for all ScenarioConfiguration state and actions.
 *
 * Returns everything the page and its child tabs need:
 * - scenario metadata (name, description, version, isPublished)
 * - config object + updateConfig helper
 * - CRUD actions (save, publish)
 * - LLM actions (enhancePrompt, enhanceConfig, enhanceConfigWithInstructions, generateConfig)
 * - JSON editor state
 * - UI state (loading, dirty, saveMessage, etc.)
 */
export default function useScenarioConfig() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const scenarioId = searchParams.get('id');
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'admin';

  // ─── Core state ───────────────────────────────────────────────────────
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [config, setConfig] = useState(() => applyScenarioDefaults(DEFAULT_CONFIG));
  const [version, setVersion] = useState('1.0');
  const [isPublished, setIsPublished] = useState(false);

  // ─── UI state ─────────────────────────────────────────────────────────
  const [loading, setLoading] = useState(!!scenarioId);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [enhancing, setEnhancing] = useState(false);
  const [enhancingField, setEnhancingField] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveMessage, setSaveMessage] = useState(null);

  // ─── JSON editor state ────────────────────────────────────────────────
  const [jsonText, setJsonText] = useState('');
  const [jsonError, setJsonError] = useState(null);

  // ─── Load scenario on mount ───────────────────────────────────────────
  useEffect(() => {
    if (!scenarioId) {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await scenarioService.getScenario(scenarioId);
        setName(data.name || '');
        setDescription(data.description || '');
        setConfig(applyScenarioDefaults(data.config));
        setVersion(data.version || '1.0');
        setIsPublished(data.is_published || false);
      } catch (err) {
        console.error('Failed to load scenario:', err);
        flash('error', 'Failed to load scenario.');
      } finally {
        setLoading(false);
      }
    })();
  }, [scenarioId]);

  // ─── Helpers ──────────────────────────────────────────────────────────
  const flash = useCallback((type, text, ms = 3000) => {
    setSaveMessage({ type, text });
    if (ms > 0) setTimeout(() => setSaveMessage(null), ms);
  }, []);

  const markDirty = useCallback((v) => {
    if (typeof v === 'function') v = v();
    setDirty(true);
    return v;
  }, []);

  /**
   * Update config via an updater function `(draftCopy) => modifiedCopy`.
   * Automatically deep-clones prev before calling updater, and marks dirty.
   */
  const updateConfig = useCallback((updater) => {
    setConfig((prev) => {
      const next = typeof updater === 'function' ? updater(deepClone(prev)) : updater;
      setDirty(true);
      return applyScenarioDefaults(next);
    });
  }, []);

  const setNameDirty = useCallback((v) => { setName(v); setDirty(true); }, []);
  const setDescriptionDirty = useCallback((v) => { setDescription(v); setDirty(true); }, []);
  const setVersionDirty = useCallback((v) => { setVersion(v); setDirty(true); }, []);

  // ─── Save ─────────────────────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!name.trim()) {
      flash('error', 'Name is required.');
      return;
    }
    setSaving(true);
    setSaveMessage(null);
    try {
      const payload = { name, description, config, version };
      if (scenarioId) {
        await scenarioService.updateScenario(scenarioId, payload);
      } else {
        const created = await scenarioService.createScenario(payload);
        if (created?.id) {
          navigate(`/scenario-config?id=${created.id}`, { replace: true });
        }
      }
      setDirty(false);
      flash('success', 'Saved successfully!');
    } catch (err) {
      flash('error', err.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  }, [name, description, config, version, scenarioId, navigate, flash]);

  // ─── Publish ──────────────────────────────────────────────────────────
  const handlePublish = useCallback(async () => {
    if (!scenarioId) {
      flash('error', 'Save the scenario first.');
      return;
    }
    setPublishing(true);
    try {
      await scenarioService.publishScenario(scenarioId);
      setIsPublished(true);
      flash('success', 'Published successfully!');
    } catch (err) {
      flash('error', err.message || 'Failed to publish.');
    } finally {
      setPublishing(false);
    }
  }, [scenarioId, flash]);

  // ─── Delete ───────────────────────────────────────────────────────────
  const handleDelete = useCallback(async () => {
    if (!scenarioId) {
      flash('error', 'Scenario not found.');
      return false;
    }

    if (isPublished) {
      flash('error', 'Published scenarios cannot be deleted. Publish another scenario first.');
      return false;
    }

    setDeleting(true);
    try {
      await scenarioService.deleteScenario(scenarioId);
      flash('success', 'Scenario deleted.', 1500);
      navigate('/scenarios', { replace: true });
      return true;
    } catch (err) {
      flash('error', err.message || 'Failed to delete scenario.');
      return false;
    } finally {
      setDeleting(false);
    }
  }, [scenarioId, isPublished, flash, navigate]);

  // ─── LLM: Enhance a single prompt ────────────────────────────────────
  const enhancePrompt = useCallback(async (promptKey) => {
    const currentPrompt = config.prompts?.[promptKey];
    if (!currentPrompt) return;
    setEnhancingField(promptKey);
    try {
      const res = await api.llm.enhance({
        type: 'system_prompt',
        prompt: currentPrompt,
        context: `Scenario: ${name}. Description: ${description}`,
      });
      if (res.enhanced_prompt) {
        updateConfig((c) => {
          c.prompts = c.prompts || {};
          c.prompts[promptKey] = res.enhanced_prompt;
          return c;
        });
      }
    } catch (err) {
      flash('error', `Enhancement failed: ${err.message}`);
    } finally {
      setEnhancingField(null);
    }
  }, [config, name, description, updateConfig, flash]);

  // ─── LLM: Enhance entire config ──────────────────────────────────────
  const enhanceConfig = useCallback(async () => {
    setEnhancing(true);
    try {
      const res = await api.llm.enhance({ type: 'config', config });
      if (res.enhanced_config) {
        setConfig(applyScenarioDefaults(res.enhanced_config));
        setDirty(true);
        flash('success', 'Config enhanced by AI!');
      } else if (res.suggestions?.length) {
        flash('info', res.suggestions[0].substring(0, 200), 6000);
      }
    } catch (err) {
      flash('error', `Enhancement failed: ${err.message}`);
    } finally {
      setEnhancing(false);
    }
  }, [config, flash]);

  // ─── LLM: Edit config with natural language instructions ─────────────
  const enhanceConfigWithInstructions = useCallback(async (instructions) => {
    if (!instructions?.trim()) return;
    setEnhancing(true);
    try {
      const res = await api.llm.enhance({
        type: 'config_edit',
        config,
        prompt: instructions,
      });
      if (res.enhanced_config) {
        setConfig(applyScenarioDefaults(res.enhanced_config));
        setDirty(true);
        flash('success', 'Config updated by AI!');
      }
    } catch (err) {
      flash('error', `Enhancement failed: ${err.message}`);
    } finally {
      setEnhancing(false);
    }
  }, [config, flash]);

  // ─── LLM: Generate config from description ───────────────────────────
  const generateConfig = useCallback(async ({ description: desc, business_type, goals }) => {
    if (!desc?.trim()) return;
    setGenerating(true);
    try {
      const res = await api.llm.generateConfig({
        description: desc,
        business_type: business_type || undefined,
        goals: goals || undefined,
      });
      if (res && typeof res === 'object') {
        setConfig(applyScenarioDefaults(res));
        setDirty(true);
        flash('success', 'Config generated by AI!');
        return true; // signal success so modal can close
      }
    } catch (err) {
      flash('error', `Generation failed: ${err.message}`);
    } finally {
      setGenerating(false);
    }
    return false;
  }, [flash]);

  // ─── JSON editor ──────────────────────────────────────────────────────
  const syncJsonText = useCallback(() => {
    setJsonText(JSON.stringify(config, null, 2));
    setJsonError(null);
  }, [config]);

  const handleJsonChange = useCallback((text) => {
    setJsonText(text);
    try {
      const parsed = JSON.parse(text);
      setJsonError(null);
      setConfig(applyScenarioDefaults(parsed));
      setDirty(true);
    } catch {
      setJsonError('Invalid JSON');
    }
  }, []);

  const formatJson = useCallback(() => {
    try {
      const parsed = JSON.parse(jsonText);
      setJsonText(JSON.stringify(parsed, null, 2));
      setJsonError(null);
    } catch {
      setJsonError('Cannot format: invalid JSON');
    }
  }, [jsonText]);

  return {
    // identifiers
    scenarioId,
    navigate,
    isAdmin,

    // metadata
    name, setName: setNameDirty,
    description, setDescription: setDescriptionDirty,
    version, setVersion: setVersionDirty,
    isPublished,

    // config
    config, updateConfig,

    // UI state
    loading, saving, deleting, publishing, enhancing, enhancingField, generating,
    dirty, saveMessage,

    // CRUD
    handleSave, handleDelete, handlePublish,

    // LLM actions
    enhancePrompt, enhanceConfig, enhanceConfigWithInstructions, generateConfig,

    // JSON editor
    jsonText, jsonError, syncJsonText, handleJsonChange, formatJson,
  };
}
