import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Sparkles, Loader } from 'lucide-react';
import api from '../../../services/api';

function JsonEditor({ value, onChange }) {
  const [jsonText, setJsonText] = useState('');
  const [error, setError] = useState(null);
  const [isValid, setIsValid] = useState(true);
  const [enhancing, setEnhancing] = useState(false);

  // Initialize with formatted JSON
  useEffect(() => {
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

    // Try to parse and validate
    try {
      const parsed = JSON.parse(newText);
      
      // Validate required fields
      if (!parsed.entry_step_id) {
        throw new Error('Missing entry_step_id');
      }
      if (!parsed.steps || typeof parsed.steps !== 'object') {
        throw new Error('Missing or invalid steps object');
      }
      
      // Validate entry step exists
      if (!parsed.steps[parsed.entry_step_id]) {
        throw new Error(`Entry step "${parsed.entry_step_id}" not found in steps`);
      }

      // Validate step references
      for (const [stepId, step] of Object.entries(parsed.steps)) {
        if (step.next) {
          if (typeof step.next === 'string') {
            if (!parsed.steps[step.next]) {
              throw new Error(`Step "${stepId}" references non-existent step "${step.next}"`);
            }
          } else if (typeof step.next === 'object') {
            for (const nextStep of Object.values(step.next)) {
              if (!parsed.steps[nextStep]) {
                throw new Error(`Step "${stepId}" references non-existent step "${nextStep}"`);
              }
            }
          }
        }
      }

      setError(null);
      setIsValid(true);
      onChange(parsed);
    } catch (err) {
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

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Validation Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          <strong>Required fields:</strong> entry_step_id, steps object. All step references must exist.
          <br />
          <strong>Tip:</strong> Use "Enhance with AI" to automatically improve conversation flow, add missing steps, and optimize for lead conversion.
        </p>
      </div>
    </div>
  );
}

export default JsonEditor;
