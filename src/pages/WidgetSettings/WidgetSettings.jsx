import { useState } from 'react';
import { Code2, Palette, Settings as SettingsIcon } from 'lucide-react';
import WidgetEditor from '../../components/WidgetEditor/WidgetEditor';
import BrandingCustomizer from '../../components/BrandingCustomizer/BrandingCustomizer';

function WidgetSettings() {
  const [activeTab, setActiveTab] = useState('embed');
  const [brandingConfig, setBrandingConfig] = useState({
    primaryColor: '#3b82f6',
    bubbleColor: '#3b82f6',
    bubbleIcon: '💬',
    welcomeMessage: 'Hi! How can we help?',
    position: 'bottom-right',
    logoUrl: '',
    borderRadius: '16',
    bubbleSize: 'large',
  });

  const tabs = [
    { id: 'embed', label: 'Embed Code', icon: Code2 },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="h-full bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-blue-100 p-2">
            <Code2 size={24} className="text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Widget Configuration</h1>
            <p className="mt-1 text-gray-600">
              Embed Sellrise on your website and customize its appearance
            </p>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6 flex border-b border-gray-200 bg-white rounded-t-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 font-medium text-sm transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content */}
      <div className="max-w-4xl">
        {activeTab === 'embed' && (
          <WidgetEditor
            workspaceId="workspace_abc123def456"
            workspaceName="Sales Demo"
          />
        )}

        {activeTab === 'appearance' && (
          <BrandingCustomizer
            initialBranding={brandingConfig}
            onBrandingChange={(branding) => {
              setBrandingConfig(branding);
              // TODO: Persist branding with backend API when endpoint is ready.
            }}
          />
        )}

        {activeTab === 'settings' && (
          <div className="rounded-lg bg-white p-8 shadow-sm">
            <div className="text-center py-12">
              <SettingsIcon size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Advanced Settings</h3>
              <p className="text-gray-600">
                Additional configuration options coming soon...
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="mt-12 border-t border-gray-200 pt-8">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Need Help?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <a href="#" className="rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <p className="font-medium text-gray-900">📚 Documentation</p>
            <p className="mt-1 text-sm text-gray-600">Setup guide & troubleshooting</p>
          </a>
          <a href="#" className="rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <p className="font-medium text-gray-900">⚡ API Reference</p>
            <p className="mt-1 text-sm text-gray-600">Widget API methods & events</p>
          </a>
          <a href="#" className="rounded-lg bg-white p-4 shadow-sm transition-all hover:shadow-md">
            <p className="font-medium text-gray-900">💬 Support</p>
            <p className="mt-1 text-sm text-gray-600">Chat with support team</p>
          </a>
        </div>
      </div>
    </div>
  );
}

export default WidgetSettings;
