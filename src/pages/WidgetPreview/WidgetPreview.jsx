import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { X, Copy, Check } from 'lucide-react';

function WidgetPreview() {
  const { workspaceId } = useParams();
  const navigate = useNavigate();
  const [displayMode, setDisplayMode] = useState('bubble');
  const [copied, setCopied] = useState(false);

  // Dummy workspace ID if not provided
  const wsId = workspaceId || 'workspace_demo_123';

  // Generate the embed snippet
  const generateSnippet = () => {
    return `<script>
  (function(w,d,s,o,f,js,fjs){
    w['SellriseWidget']=o;w[o]=w[o]||function(){(w[o].q=w[o].q||[]).push(arguments)};
    js=d.createElement(s),fjs=d.getElementsByTagName(s)[0];
    js.id=o;js.src=f;js.async=1;fjs.parentNode.insertBefore(js,fjs);
  }(window,document,'script','sellrise','https://cdn.sellrise.ai/widget.js'));
  
  sellrise('init', {
    workspace: '${wsId}',
    displayMode: '${displayMode}',
    position: 'bottom-right'
  });
</script>`;
  };

  const handleCopySnippet = async () => {
    try {
      await navigator.clipboard.writeText(generateSnippet());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Control Panel */}
      <div className="w-80 flex-shrink-0 border-r border-gray-300 bg-white p-6 overflow-y-auto shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Widget Preview</h2>
          <button
            onClick={() => navigate(-1)}
            className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Display Mode Selection */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Display Mode</h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all"
                style={{
                  borderColor: displayMode === 'bubble' ? '#3b82f6' : '#e5e7eb',
                  backgroundColor: displayMode === 'bubble' ? '#eff6ff' : '#f9fafb'
                }}
              >
                <input
                  type="radio"
                  name="displayMode"
                  value="bubble"
                  checked={displayMode === 'bubble'}
                  onChange={(e) => setDisplayMode(e.target.value)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-gray-900">Floating Bubble</p>
                  <p className="text-xs text-gray-600">Bottom-right corner</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all"
                style={{
                  borderColor: displayMode === 'inline' ? '#3b82f6' : '#e5e7eb',
                  backgroundColor: displayMode === 'inline' ? '#eff6ff' : '#f9fafb'
                }}
              >
                <input
                  type="radio"
                  name="displayMode"
                  value="inline"
                  checked={displayMode === 'inline'}
                  onChange={(e) => setDisplayMode(e.target.value)}
                  className="w-4 h-4"
                />
                <div>
                  <p className="font-medium text-gray-900">Inline Embed</p>
                  <p className="text-xs text-gray-600">In page element</p>
                </div>
              </label>
            </div>
          </div>

          {/* Workspace Info */}
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-600 font-medium mb-2">WORKSPACE ID</p>
            <code className="text-sm text-blue-900 font-mono break-all">{wsId}</code>
          </div>

          {/* Embed Code Preview */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Embed Code</h3>
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-3 rounded-lg text-xs overflow-auto max-h-40 font-mono">
{generateSnippet()}</pre>
              <button
                onClick={handleCopySnippet}
                className="absolute top-2 right-2 bg-gray-800 hover:bg-gray-700 text-white px-2 py-1 rounded text-xs flex items-center gap-1 transition-colors"
              >
                {copied ? (
                  <>
                    <Check size={14} /> Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} /> Copy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
            <p className="text-xs text-amber-900">
              <strong>💡 Tip:</strong> This preview shows how your widget will appear on your website. Test different interactions to see how it behaves.
            </p>
          </div>

          {displayMode === 'inline' && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-xs text-green-900">
                <strong>✅ Inline Mode:</strong> Look for the widget container in the preview below. Ensure you add <code className="bg-green-100 px-1 rounded text-xs">id="sellrise-widget"</code> to your page.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto">
        {displayMode === 'bubble' ? (
          <BubblePreview wsId={wsId} />
        ) : (
          <InlinePreview wsId={wsId} />
        )}
      </div>
    </div>
  );
}

// Dummy Website with Bubble Widget
function BubblePreview({ wsId }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
            <span className="font-bold text-lg">Acme Store</span>
          </div>
          <nav className="flex gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Products</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">About</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Contact</a>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Premium Products for Modern Living</h1>
          <p className="text-xl text-gray-600 mb-8">Discover our curated collection of high-quality items</p>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium">
            Shop Now
          </button>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Featured Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gray-200 h-48"></div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900">Product {i}</h3>
                  <p className="text-sm text-gray-600 mt-1">Premium quality item</p>
                  <p className="text-lg font-bold text-gray-900 mt-3">${99 + i * 10}</p>
                  <button className="w-full mt-3 bg-blue-100 text-blue-600 px-4 py-2 rounded hover:bg-blue-200 text-sm font-medium">
                    Learn More
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {['How do I place an order?', 'What is the return policy?', 'Do you offer shipping?', 'How can I contact support?'].map((q, i) => (
              <div key={i} className="bg-white p-4 rounded-lg border border-gray-200">
                <p className="font-medium text-gray-900">{q}</p>
                <p className="text-sm text-gray-600 mt-2">We're here to help! Click the chat widget to get instant answers.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm">&copy; 2026 Acme Store. All rights reserved.</p>
        </div>
      </footer>

      {/* Widget Bubble (Dummy) */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="bg-blue-600 rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-110 transition-transform cursor-pointer">
          <span className="text-white text-2xl">💬</span>
        </div>
      </div>

      {/* Watermark */}
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded text-xs font-medium z-50">
        🔍 Widget Preview
      </div>
    </div>
  );
}

// Dummy Website with Inline Widget
function InlinePreview({ wsId }) {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
            <span className="font-bold text-lg">Support Center</span>
          </div>
          <nav className="flex gap-6">
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Docs</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Help</a>
            <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Community</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">How can we help?</h1>
        <p className="text-lg text-gray-600 mb-12">Our support team is here to answer your questions</p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Getting Started</h2>
              <div className="space-y-4">
                <article className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-semibold text-gray-900">How to set up your account</h3>
                  <p className="text-sm text-gray-600 mt-1">Follow these simple steps to get started...</p>
                </article>
                <article className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-semibold text-gray-900">Understanding our pricing</h3>
                  <p className="text-sm text-gray-600 mt-1">Learn about our flexible pricing plans...</p>
                </article>
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Popular Topics</h2>
              <div className="grid grid-cols-2 gap-4">
                {['API Reference', 'Integrations', 'Security', 'FAQ'].map((topic) => (
                  <div key={topic} className="bg-gray-50 p-4 rounded-lg border border-gray-200 cursor-pointer hover:border-blue-300 transition-colors">
                    <p className="font-medium text-gray-900 text-sm">{topic}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Widget Container - Right Column */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div id="sellrise-widget" className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border-2 border-dashed border-blue-300 p-8 text-center">
                <div className="text-4xl mb-3">💬</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Widget Container</h3>
                <p className="text-sm text-gray-600 mb-4">
                  This is where the Sellrise widget will be embedded when you add the embed code to your page.
                </p>
                <p className="text-xs text-blue-600 font-mono bg-blue-100 p-2 rounded">
                  id="sellrise-widget"
                </p>
              </div>

              {/* Example Notice */}
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-xs text-amber-900">
                  <strong>📌 Note:</strong> In inline mode, the widget loads into the container shown above. Make sure it has <code className="bg-amber-100 px-1 rounded">id="sellrise-widget"</code> in your HTML.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Content */}
        <div className="mt-16 border-t border-gray-200 pt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Still need help?</h2>
          <div className="bg-blue-50 rounded-lg p-8 border border-blue-200">
            <p className="text-gray-700 mb-4">
              Can't find what you're looking for? Our support team is ready to help! Use the widget to chat with us in real-time.
            </p>
            <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 font-medium text-sm">
              Start a conversation
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-gray-400 text-sm">&copy; 2026 Support Center. All rights reserved.</p>
        </div>
      </footer>

      {/* Watermark */}
      <div className="fixed top-4 right-4 bg-yellow-100 border border-yellow-400 text-yellow-800 px-3 py-2 rounded text-xs font-medium z-50">
        🔍 Widget Preview (Inline Mode)
      </div>
    </div>
  );
}

export default WidgetPreview;
