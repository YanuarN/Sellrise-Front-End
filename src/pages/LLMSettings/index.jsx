import { useState, useEffect } from 'react';
import { Settings, Zap, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import MainLayout from '../../layout/MainLayout';
import Card from '../../components/Card';

function LLMSettings() {
  const [llmConfig, setLlmConfig] = useState({
    provider: 'openrouter',
    primary_model: 'deepseek/deepseek-chat',
    fallback_model: 'anthropic/claude-3.5-sonnet',
    temperature: 0.7,
    max_tokens: 2000,
    timeout_seconds: 30,
  });

  const [metrics, setMetrics] = useState({
    total_calls: 0,
    successful_calls: 0,
    failed_calls: 0,
    fallback_calls: 0,
    avg_latency_ms: 0,
    p95_latency_ms: 0,
    cost_estimate_today: 0.00,
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  useEffect(() => {
    // Load LLM config and metrics
    fetchLLMConfig();
    fetchMetrics();
  }, []);

  const fetchLLMConfig = async () => {
    try {
      const response = await fetch('/api/v1/workspaces/me/llm-config', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLlmConfig(data);
      }
    } catch (error) {
      console.error('Failed to fetch LLM config:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/v1/analytics/llm-metrics', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveMessage('');

    try {
      const response = await fetch('/api/v1/workspaces/me/llm-config', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(llmConfig)
      });

      if (response.ok) {
        setSaveMessage('✓ Settings saved successfully');
        setTimeout(() => setSaveMessage(''), 3000);
      } else {
        setSaveMessage('✗ Failed to save settings');
      }
    } catch (error) {
      setSaveMessage('✗ Error saving settings');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const successRate = metrics.total_calls > 0 
    ? ((metrics.successful_calls / metrics.total_calls) * 100).toFixed(1)
    : 0;

  const fallbackRate = metrics.total_calls > 0 
    ? ((metrics.fallback_calls / metrics.total_calls) * 100).toFixed(1)
    : 0;

  return (
    <MainLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Zap className="w-8 h-8 text-blue-600" />
              LLM Configuration
            </h1>
            <p className="text-gray-600 mt-1">Manage AI model settings and monitor performance</p>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Mode</p>
                <p className="text-lg font-bold text-gray-900 mt-1">Production</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{successRate}%</p>
              </div>
              <TrendingUp className="w-6 h-6 text-blue-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Latency</p>
                <p className="text-lg font-bold text-gray-900 mt-1">{metrics.avg_latency_ms}ms</p>
              </div>
              <Zap className="w-6 h-6 text-amber-500" />
            </div>
          </Card>

          <Card className="p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600">Cost Today</p>
                <p className="text-lg font-bold text-gray-900 mt-1">${metrics.cost_estimate_today.toFixed(2)}</p>
              </div>
              <Zap className="w-6 h-6 text-green-500" />
            </div>
          </Card>
        </div>

        {/* Model Configuration */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Model Configuration
          </h2>

          <div className="space-y-6">
            {/* Provider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                LLM Provider
              </label>
              <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-700">OpenRouter (Managed via backend)</span>
              </div>
              <p className="text-xs text-gray-500 mt-2">Backend-only provider for security. API keys are stored server-side.</p>
            </div>

            {/* Primary Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Model (Runtime)
              </label>
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-700">DeepSeek (deepseek/deepseek-chat)</p>
                  <p className="text-xs text-green-600">Configured for widget chatbot processing</p>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">This model is used for all widget message processing and is optimized for lead qualification.</p>
            </div>

            {/* Fallback Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fallback Model
              </label>
              <select
                value={llmConfig.fallback_model}
                onChange={(e) => setLlmConfig({ ...llmConfig, fallback_model: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet (Anthropic via OpenRouter)</option>
                <option value="openai/gpt-4">GPT-4 (OpenAI via OpenRouter)</option>
                <option value="openai/gpt-3.5-turbo">GPT-3.5 Turbo (OpenAI via OpenRouter)</option>
              </select>
              <p className="text-xs text-gray-500 mt-2">Used if primary model is unavailable. Fallback is automatic and logged.</p>
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Temperature (Creativity): {llmConfig.temperature.toFixed(1)}
              </label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={llmConfig.temperature}
                onChange={(e) => setLlmConfig({ ...llmConfig, temperature: parseFloat(e.target.value) })}
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-2">Lower = more deterministic. 0.7 recommended for factual lead qualification.</p>
            </div>

            {/* Max Tokens */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Tokens (Response Length)
              </label>
              <input
                type="number"
                value={llmConfig.max_tokens}
                onChange={(e) => setLlmConfig({ ...llmConfig, max_tokens: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">2000 tokens ≈ 1500 words. Higher = more cost and latency.</p>
            </div>

            {/* Timeout */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Request Timeout (seconds)
              </label>
              <input
                type="number"
                value={llmConfig.timeout_seconds}
                onChange={(e) => setLlmConfig({ ...llmConfig, timeout_seconds: parseInt(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-2">If inference takes longer, fallback response is returned.</p>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-6 flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
            >
              {isSaving ? 'Saving...' : 'Save Configuration'}
            </button>
            {saveMessage && (
              <span className={`text-sm ${saveMessage.includes('✓') ? 'text-green-600' : 'text-red-600'}`}>
                {saveMessage}
              </span>
            )}
          </div>
        </Card>

        {/* Performance Metrics */}
        <Card className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Performance Metrics (Last 24h)</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">Total Calls</p>
              <p className="text-2xl font-bold text-gray-900">{metrics.total_calls}</p>
            </div>
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-gray-600">Successful</p>
              <p className="text-2xl font-bold text-green-600">{metrics.successful_calls}</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg">
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">{metrics.failed_calls}</p>
            </div>
            <div className="p-4 bg-amber-50 rounded-lg">
              <p className="text-sm text-gray-600">Fallback Used</p>
              <p className="text-2xl font-bold text-amber-600">{fallbackRate}%</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">Avg Latency</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.avg_latency_ms}ms</p>
            </div>
            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600">P95 Latency</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.p95_latency_ms}ms</p>
            </div>
            <div className="col-span-2 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">Cost Estimate Today</p>
              <p className="text-2xl font-bold text-purple-600">${metrics.cost_estimate_today.toFixed(2)}</p>
            </div>
          </div>
        </Card>

        {/* Information Box */}
        <Card className="p-6 border-l-4 border-blue-600 bg-blue-50">
          <div className="flex gap-4">
            <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900">API Key Security</h3>
              <p className="text-sm text-blue-800 mt-1">
                Your OpenRouter API key is securely stored on the backend and never exposed to the browser or widget. All LLM calls are made server-to-server for maximum security and privacy.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </MainLayout>
  );
}

export default LLMSettings;
