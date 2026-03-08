import { useState } from 'react';
import { Eye, EyeOff, Copy, Check } from 'lucide-react';
import { Button } from '../Button';
import { Card } from '../Card';
import CodeBlock from '../CodeBlock/CodeBlock';

function WidgetEditor({ workspaceId = 'workspace_demo_123', workspaceName = 'My Workspace' }) {
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [displayMode, setDisplayMode] = useState('bubble'); // bubble or inline

  // Generate embed snippet based on workspace
  const generateSnippet = () => {
    return `<script>
  (function(w,d,s,o,f,js,fjs){
    w['SellriseWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','sellrise','https://cdn.sellrise.ai/widget.js'));
  
  // Initialize widget
  sellrise('init', {
    workspace: '${workspaceId}',
    displayMode: '${displayMode}',
    position: 'bottom-right'
  });
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
          <Button variant="outline" className="w-full justify-start gap-2">
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
            <Button variant="outline" className="gap-2">
              🧪 Test in Simulator
            </Button>
            <Button variant="outline" className="gap-2">
              👁️ Preview Widget
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}

export default WidgetEditor;
