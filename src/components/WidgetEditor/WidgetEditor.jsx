import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { Button } from '../Button';
import { Card } from '../Card';
import CodeBlock from '../CodeBlock/CodeBlock';
import DomainManagement from '../DomainManagement/DomainManagement';
import WidgetSimulator from '../WidgetSimulator/WidgetSimulator';

function WidgetEditor({ workspaceId = 'workspace_demo_123', workspaceName = 'My Workspace' }) {
  const navigate = useNavigate();
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displayMode, setDisplayMode] = useState('bubble'); // bubble or inline
  const [fallbackMessage, setFallbackMessage] = useState('Please leave your details and our team will contact you shortly.');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [domains, setDomains] = useState(['example.com', 'yourdomain.com']);

  // Generate embed snippet based on workspace
  const generateSnippet = () => {
    const serializedFallbackMessage = JSON.stringify(fallbackMessage);

    return `<script>
  (function(w,d){
    var widgetMode = '${displayMode}';
    var fallbackMessage = ${serializedFallbackMessage};
    var sessionEndpoint = '/v1/widget/session';
    var fallbackEndpoint = '/v1/widget/fallback-lead';
    var timeoutMs = 12000;
    var initialized = false;
    var fallbackRendered = false;

    function createCorrelationId() {
      return 'cid_' + Date.now() + '_' + Math.random().toString(36).slice(2, 10);
    }

    function renderFallback(reason, error) {
      if (fallbackRendered) return;
      fallbackRendered = true;

      var correlationId = createCorrelationId();
      var mount = widgetMode === 'inline'
        ? d.getElementById('sellrise-widget')
        : null;

      if (!mount) {
        mount = d.createElement('div');
        mount.style.position = 'fixed';
        mount.style.right = '16px';
        mount.style.bottom = '16px';
        mount.style.width = '320px';
        mount.style.maxWidth = 'calc(100vw - 32px)';
        mount.style.zIndex = '2147483646';
        d.body.appendChild(mount);
      }

      mount.innerHTML = '';

      var card = d.createElement('div');
      card.style.fontFamily = "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif";
      card.style.background = '#ffffff';
      card.style.border = '1px solid #e5e7eb';
      card.style.borderRadius = '12px';
      card.style.boxShadow = '0 10px 30px rgba(0,0,0,.12)';
      card.style.padding = '16px';
      card.innerHTML =
        '<h4 style="margin:0 0 8px;font-size:16px;font-weight:600;color:#111827;">We are here to help</h4>' +
        '<p style="margin:0 0 12px;font-size:14px;line-height:1.4;color:#374151;">' + fallbackMessage + '</p>' +
        '<form id="sellrise-fallback-form" style="display:grid;gap:8px">' +
          '<input name="name" required placeholder="Your name" style="padding:10px;border:1px solid #d1d5db;border-radius:8px;font-size:14px" />' +
          '<input type="email" name="email" required placeholder="Email" style="padding:10px;border:1px solid #d1d5db;border-radius:8px;font-size:14px" />' +
          '<input name="phone" placeholder="Phone (optional)" style="padding:10px;border:1px solid #d1d5db;border-radius:8px;font-size:14px" />' +
          '<button type="submit" style="padding:10px 12px;background:#111827;color:#fff;border:none;border-radius:8px;font-size:14px;cursor:pointer">Submit</button>' +
        '</form>' +
        '<p id="sellrise-fallback-status" style="margin:8px 0 0;font-size:12px;color:#6b7280"></p>';

      mount.appendChild(card);

      var form = card.querySelector('#sellrise-fallback-form');
      var status = card.querySelector('#sellrise-fallback-status');

      form.addEventListener('submit', function(evt) {
        evt.preventDefault();
        var formData = new FormData(form);
        var payload = {
          name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone') || null,
          reason: reason,
          correlation_id: correlationId,
          page_url: w.location.href,
        };

        status.textContent = 'Submitting...';

        fetch(fallbackEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
          .then(function(res) {
            if (!res.ok) throw new Error('Fallback submission failed');
            status.textContent = 'Thanks. We received your details.';
            form.reset();
          })
          .catch(function() {
            status.textContent = 'Could not submit right now. Please try again.';
          });
      });

      console.error('[Sellrise] Fallback triggered', {
        reason: reason,
        correlation_id: correlationId,
        error: error ? String(error) : null,
      });
    }

    var js = d.createElement('script');
    js.src = 'https://cdn.sellrise.ai/widget.js';
    js.async = true;

    js.onload = function() {
      try {
        if (typeof w.sellrise !== 'function') {
          renderFallback('session_failure');
          return;
        }

        fetch(sessionEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            domain: w.location.hostname,
            page_url: w.location.href,
            referrer: d.referrer || null,
            utm_source: new URLSearchParams(w.location.search).get('utm_source'),
            utm_medium: new URLSearchParams(w.location.search).get('utm_medium'),
            utm_campaign: new URLSearchParams(w.location.search).get('utm_campaign'),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }),
        })
          .then(function(res) {
            if (!res.ok) throw new Error('Session handshake failed');
            return res.json();
          })
          .then(function(session) {
            w.sellrise('init', {
              workspace: '${workspaceId}',
              displayMode: '${displayMode}',
              position: 'bottom-right',
              sessionId: session.session_id,
              scenario: session.scenario_json || session.scenario || null,
              branding: session.branding || null,
            });

            initialized = true;
          })
          .catch(function(err) {
            renderFallback('session_failure', err);
          });
      } catch (err) {
        renderFallback('session_failure', err);
      }
    };

    js.onerror = function() {
      renderFallback('session_failure');
    };

    d.head.appendChild(js);

    w.setTimeout(function() {
      if (!initialized) {
        renderFallback('timeout');
      }
    }, timeoutMs);
  })(window, document);
</script>`;
  };

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(workspaceId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleAddDomain = (domain) => {
    setDomains([...domains, domain]);
  };

  const handleRemoveDomain = (domain) => {
    setDomains(domains.filter(d => d !== domain));
  };

  const handlePreviewWidget = () => {
    navigate(`/preview/widget/${workspaceId}`);
  };

  const handleOpenSimulator = () => {
    setIsSimulatorOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Workspace Public Key Section */}
      <Card>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Workspace Public Key</h3>
              <p className="mt-1 text-sm text-gray-600">
                Use this key to authenticate your widget sessions
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowKey(!showKey)}
              className="gap-2"
            >
              {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              {showKey ? 'Hide' : 'Show'}
            </Button>
          </div>

          <div className="relative rounded-lg bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-4">
              <code className={`flex-1 text-sm font-mono ${
                showKey ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {showKey ? workspaceId : '••••••••••••••••••••••••••'}
              </code>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyKey}
                className="gap-2 whitespace-nowrap"
              >
                {copied ? (
                  <>
                    <Check size={16} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={16} />
                    Copy Key
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="rounded-lg bg-blue-50 p-3 text-sm text-blue-900">
            💡 Keep this key safe! It identifies your workspace and appears in the embed snippet.
          </div>
        </div>
      </Card>

      {/* Display Mode Configuration */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Display Mode</h3>
            <p className="mt-1 text-sm text-gray-600">
              Choose how the widget appears on your website
            </p>
          </div>

          <div className="grid gap-3">
            <label className="flex items-center gap-3 rounded-lg border-2 border-gray-200 p-4 transition-all hover:border-blue-300"
              style={{ borderColor: displayMode === 'bubble' ? '#3b82f6' : undefined, backgroundColor: displayMode === 'bubble' ? '#eff6ff' : undefined }}
            >
              <input
                type="radio"
                name="displayMode"
                value="bubble"
                checked={displayMode === 'bubble'}
                onChange={(e) => setDisplayMode(e.target.value)}
                className="h-4 w-4"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Floating Bubble</p>
                <p className="text-sm text-gray-600">Chat bubble appears bottom-right</p>
              </div>
              <div className="text-2xl">💬</div>
            </label>

            <label className="flex items-center gap-3 rounded-lg border-2 border-gray-200 p-4 transition-all hover:border-blue-300"
              style={{ borderColor: displayMode === 'inline' ? '#3b82f6' : undefined, backgroundColor: displayMode === 'inline' ? '#eff6ff' : undefined }}
            >
              <input
                type="radio"
                name="displayMode"
                value="inline"
                checked={displayMode === 'inline'}
                onChange={(e) => setDisplayMode(e.target.value)}
                className="h-4 w-4"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">Inline Embed</p>
                <p className="text-sm text-gray-600">Embed directly in webpage element</p>
              </div>
              <div className="text-2xl">📌</div>
            </label>
          </div>

          {displayMode === 'inline' && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
              📝 For inline mode, add a container element with id="sellrise-widget" where you want the widget to appear.
            </div>
          )}
        </div>
      </Card>

      {/* Embed Snippet */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Fallback Configuration</h3>
            <p className="mt-1 text-sm text-gray-600">
              This message appears when widget session fails or times out.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">Fallback Message</label>
            <input
              type="text"
              value={fallbackMessage}
              onChange={(e) => setFallbackMessage(e.target.value)}
              maxLength={140}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
              placeholder="Please leave your details and our team will contact you shortly."
            />
            <p className="mt-1 text-xs text-gray-500">
              {fallbackMessage.length}/140 characters
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900">Embed Snippet</h3>
            <p className="mt-1 text-sm text-gray-600">
              Copy and paste this code into your website's HTML
            </p>
          </div>

          <CodeBlock
            code={generateSnippet()}
            language="html"
            title="JavaScript Embed Code"
          />

          <div className="rounded-lg bg-green-50 p-4">
            <h4 className="mb-2 font-medium text-green-900">✅ Installation Steps</h4>
            <ol className="space-y-2 text-sm text-green-800">
              <li>1. Copy the code above</li>
              <li>2. Paste it before the closing &lt;/body&gt; tag in your HTML</li>
              <li className={displayMode === 'inline' ? 'block' : 'hidden'}>
                3. Add a container: &lt;div id="sellrise-widget"&gt;&lt;/div&gt;
              </li>
              <li>4. The widget will load automatically on page visit</li>
            </ol>
          </div>

          <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
            Fallback is hardcoded in this snippet with timeout/session-failure handling and submits to <code>/v1/widget/fallback-lead</code>.
          </div>
        </div>
      </Card>

      {/* Domain Configuration Info */}
      <Card>
        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Domain Configuration</h3>
            <p className="mt-1 text-sm text-gray-600">
              Configure which domains can load this widget
            </p>
          </div>
          {domains.length > 0 && (
            <div className="rounded-lg bg-green-50 p-3 border border-green-200">
              <p className="text-sm text-green-900 font-medium mb-2">✅ {domains.length} domain(s) registered:</p>
              <div className="flex flex-wrap gap-2">
                {domains.map(domain => (
                  <span key={domain} className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                    {domain}
                  </span>
                ))}
              </div>
            </div>
          )}
          <Button 
            variant="outline" 
            className="w-full justify-start gap-2"
            onClick={() => setIsModalOpen(true)}
          >
            ⚙️ Manage Domains
          </Button>
          <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
            Register your domain in settings to enable the widget. The widget validates the domain origin for security.
          </div>
        </div>
      </Card>

      {/* Preview & Testing */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Testing & Preview</h3>
            <p className="mt-1 text-sm text-gray-600">
              Test your widget before deploying to production
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <Button variant="outline" className="gap-2" onClick={handleOpenSimulator}>
              🧪 Test in Simulator
            </Button>
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={handlePreviewWidget}
            >
              👁️ Preview Widget
            </Button>
          </div>
        </div>
      </Card>

      {/* Domain Management Modal */}
      <DomainManagement 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        domains={domains}
        onAddDomain={handleAddDomain}
        onRemoveDomain={handleRemoveDomain}
      />

      <WidgetSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        workspaceName={workspaceName}
        fallbackMessage={fallbackMessage}
      />
    </div>
  );
}

export default WidgetEditor;
