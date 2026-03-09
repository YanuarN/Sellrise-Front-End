import { useState } from 'react';
import { Code2, Palette, Settings as SettingsIcon } from 'lucide-react';
import WidgetEditor from '../../components/WidgetEditor/WidgetEditor';
import BrandingCustomizer from '../../components/BrandingCustomizer/BrandingCustomizer';
import useAuthStore from '../../stores/authStore';
import domainService from '../../services/domainService';

function WidgetSettings() {
  const { user } = useAuthStore();
  const workspaceId = user?.workspace_id || '';
  const workspaceName = user?.full_name ? `${user.full_name}'s Workspace` : 'My Workspace';

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
  const [isSavingBranding, setIsSavingBranding] = useState(false);
  const [brandingSaveMsg, setBrandingSaveMsg] = useState(null);

  // Persist branding to all registered domains in this workspace
  const handleSaveBranding = async (branding) => {
    setIsSavingBranding(true);
    setBrandingSaveMsg(null);
    try {
      const domains = await domainService.getDomains();
      if (!domains || domains.length === 0) {
        setBrandingSaveMsg({ type: 'warn', text: 'No domains registered yet. Register a domain first.' });
        return;
      }
      await Promise.all(
        domains.map((d) =>
          domainService.updateDomain(d.id, {
            brand_primary_color: branding.primaryColor,
            bubble_color: branding.bubbleColor,
            bubble_icon: branding.bubbleIcon,
            welcome_message: branding.welcomeMessage,
            brand_logo_url: branding.logoUrl || null,
            position: branding.position,
            border_radius: branding.borderRadius,
            bubble_size: branding.bubbleSize,
          })
        )
      );
      setBrandingSaveMsg({ type: 'success', text: '✅ Branding saved successfully.' });
    } catch (err) {
      setBrandingSaveMsg({ type: 'error', text: `Failed to save: ${err.message}` });
    } finally {
      setIsSavingBranding(false);
      setTimeout(() => setBrandingSaveMsg(null), 4000);
    }
  };

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
            workspaceId={workspaceId}
            workspaceName={workspaceName}
          />
        )}

        {activeTab === 'appearance' && (
          <>
            {brandingSaveMsg && (
              <div className={`mb-4 rounded-lg p-3 text-sm ${
                brandingSaveMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
                brandingSaveMsg.type === 'warn'    ? 'bg-amber-50 text-amber-800 border border-amber-200' :
                'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {brandingSaveMsg.text}
              </div>
            )}
            <BrandingCustomizer
              initialBranding={brandingConfig}
              onBrandingChange={(branding) => setBrandingConfig(branding)}
              onSave={handleSaveBranding}
              isSaving={isSavingBranding}
            />
          </>
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
