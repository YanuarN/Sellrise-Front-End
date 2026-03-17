import { useState, useEffect, useRef } from 'react';
import { AlertCircle, CheckCircle, Sparkles, Loader } from 'lucide-react';
import api from '../../../services/api';

const validateScenarioConfig = (parsed) => {
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return 'Configuration must be a JSON object';
  }

  if (parsed.entry_step_id || parsed.steps) {
    if (!parsed.entry_step_id) {
      return 'Missing entry_step_id';
    }

    if (!parsed.steps || typeof parsed.steps !== 'object' || Array.isArray(parsed.steps)) {
      return 'Missing or invalid steps object';
    }

    if (!parsed.steps[parsed.entry_step_id]) {
      return `Entry step "${parsed.entry_step_id}" not found in steps`;
    }

    for (const [stepId, step] of Object.entries(parsed.steps)) {
      if (!step?.next) {
        continue;
      }

      if (typeof step.next === 'string') {
        if (!parsed.steps[step.next]) {
          return `Step "${stepId}" references non-existent step "${step.next}"`;
        }
      } else if (typeof step.next === 'object') {
        for (const nextStep of Object.values(step.next)) {
          if (!parsed.steps[nextStep]) {
            return `Step "${stepId}" references non-existent step "${nextStep}"`;
          }
        }
      }
    }
  }

  return null;
};

function JsonEditor({ value, onChange }) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const [enhancing, setEnhancing] = useState(false);
  // Track whether the change originated from user typing (internal) so we
  // can skip the useEffect sync and avoid overwriting the textarea content.
  const isInternalEdit = useRef(false);

  // Sync from parent value only when the change came from outside (e.g.
  // loading a scenario, AI enhancement from parent, system prompt change).
  useEffect(() => {
    if (isInternalEdit.current) {
      isInternalEdit.current = false;
      return;
    }
    try {
      setJsonText(JSON.stringify(value, null, 2));
      setError(null);
      setIsValid(true);
    } catch (err) {
      setError('Invalid JSON structure');
      setIsValid(false);
    }
  }, [value]);

  const handleChange = (e) => {
    const newText = e.target.value;
    setJsonText(newText);

    try {
      const parsed = JSON.parse(newText);

      // ALWAYS propagate valid JSON to parent — never block onChange.
      // Structural validation is shown as a warning but does NOT prevent saving.
      isInternalEdit.current = true;
      onChange(parsed);

      const validationWarning = validateScenarioConfig(parsed);
      if (validationWarning) {
        setError(validationWarning);
        setIsValid(true); // JSON itself is valid, warning is structural only
      } else {
        setError(null);
        setIsValid(true);
      }
    } catch (err) {
      // JSON.parse failed — genuine syntax error, don't propagate
      setError(err.message);
      setIsValid(false);
    }
  };

  const handleFormat = () => {
    try {
      const parsed = JSON.parse(jsonText);
      const formatted = JSON.stringify(parsed, null, 2);
      setJsonText(formatted);
      setError(null);
      setIsValid(true);
    } catch (err) {
      setError('Cannot format invalid JSON');
    }
  };

  const handleEnhance = async () => {
    try {
      setEnhancing(true);
      setError(null);

      const response = await api.llm.enhance({
        config: value,
        type: 'config',
        context: 'scenario_configuration'
      });

      if (response.enhanced_config) {
        const formatted = JSON.stringify(response.enhanced_config, null, 2);
        setJsonText(formatted);
        isInternalEdit.current = true;
        onChange(response.enhanced_config);
        setIsValid(true);
      } else if (response.suggestions && response.suggestions.length > 0) {
        setError('Suggestions received, but could not auto-apply. Check the response.');
      }
    } catch (err) {
      setError('Failed to enhance configuration: ' + err.message);
    } finally {
      setEnhancing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          {isValid ? (
            <CheckCircle className="w-4 h-4 text-green-600" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600" />
          )}
          <span className="text-sm text-gray-600">
            {isValid ? 'Valid JSON' : 'Invalid JSON'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleEnhance}
            disabled={enhancing || !isValid}
            className="flex items-center gap-1 text-xs px-3 py-1 text-purple-600 hover:bg-purple-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {enhancing ? (
              <>
                <Loader className="w-3 h-3 animate-spin" />
                Enhancing...
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                Enhance with AI
              </>
            )}
          </button>
          <button
            onClick={handleFormat}
            className="text-xs px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
          >
            Format
          </button>
        </div>
      </div>

      <div className="relative">
        <textarea
          value={jsonText}
          onChange={handleChange}
          className={`w-full h-[400px] px-4 py-3 font-mono text-sm border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
            isValid
              ? 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              : 'border-red-300 focus:ring-red-500 focus:border-red-500 bg-red-50'
          }`}
          placeholder="Enter JSON configuration..."
          spellCheck={false}
        />
      </div>

      {error && !isValid && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">JSON Syntax Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {error && isValid && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800">Structural Warning (config will still be saved)</p>
              <p className="text-sm text-yellow-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Contract:</strong> Backend accepts any JSON object in <code>config</code>.
          <br />
          <strong>Optional validation:</strong> If you use legacy <code>entry_step_id</code>/<code>steps</code> flow, all step references must exist.
        </p>
      </div>
    </div>
  );
}

export default JsonEditor;
