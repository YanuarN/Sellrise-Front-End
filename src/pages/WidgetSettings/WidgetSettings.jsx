import { Code2, Zap, Settings } from 'lucide-react';
import WidgetEditor from '../../components/WidgetEditor/WidgetEditor';

function WidgetSettings() {
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

      {/* Main Content */}
      <div className="max-w-4xl">
        <WidgetEditor
          workspaceId="workspace_abc123def456"
          workspaceName="Sales Demo"
        />
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
