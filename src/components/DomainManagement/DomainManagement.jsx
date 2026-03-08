import { useState } from 'react';
import { X, Plus, Trash2, Globe } from 'lucide-react';
import { Button } from '../Button';
import { Input } from '../Input';
import { Card } from '../Card';

function DomainManagement({ isOpen, onClose, domains = [], onAddDomain, onRemoveDomain }) {
  const [newDomain, setNewDomain] = useState('');
  const [error, setError] = useState('');
  const [devMode, setDevMode] = useState(false);

  const validateDomain = (domain) => {
    if (!domain) {
      setError('Domain cannot be empty');
      return false;
    }

    // Simple domain validation regex (basic check)
    const domainRegex = /^([a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$|^localhost(:\d+)?$/;

    if (!domainRegex.test(domain)) {
      setError('Please enter a valid domain (e.g., example.com or localhost)');
      return false;
    }

    if (domains.includes(domain)) {
      setError('This domain is already registered');
      return false;
    }

    return true;
  };

  const handleAddDomain = () => {
    if (validateDomain(newDomain)) {
      onAddDomain?.(newDomain);
      setNewDomain('');
      setError('');
    }
  };

  const handleRemoveDomain = (domain) => {
    onRemoveDomain?.(domain);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddDomain();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-blue-100 p-2">
              <Globe size={20} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Manage Domains</h2>
              <p className="text-sm text-gray-600">
                Register which domains are allowed to load your widget
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-gray-100 transition-colors"
          >
            <X size={24} className="text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Add Domain Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">Add New Domain</h3>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Domain Name
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  placeholder="example.com or localhost:3000"
                  value={newDomain}
                  onChange={(e) => {
                    setNewDomain(e.target.value);
                    setError('');
                  }}
                  onKeyPress={handleKeyPress}
                  className="flex-1"
                />
                <Button
                  onClick={handleAddDomain}
                  variant="primary"
                  className="gap-2 whitespace-nowrap"
                >
                  <Plus size={16} />
                  Add Domain
                </Button>
              </div>
              {error && (
                <p className="text-sm text-red-600 flex items-center gap-2">
                  ⚠️ {error}
                </p>
              )}
            </div>

            {/* Dev Mode Toggle */}
            <label className="flex items-center gap-3 rounded-lg border border-gray-200 p-3 cursor-pointer hover:bg-gray-50 transition-colors">
              <input
                type="checkbox"
                checked={devMode}
                onChange={(e) => setDevMode(e.target.checked)}
                className="h-4 w-4"
              />
              <div>
                <p className="font-medium text-gray-900">Development Mode</p>
                <p className="text-sm text-gray-600">
                  Allow widget on localhost for testing
                </p>
              </div>
            </label>
          </div>

          {/* Registered Domains */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">
                Registered Domains ({domains.length})
              </h3>
            </div>

            {domains.length === 0 ? (
              <div className="rounded-lg bg-gray-50 p-6 text-center">
                <Globe size={32} className="mx-auto mb-2 text-gray-300" />
                <p className="text-gray-600">No domains registered yet</p>
                <p className="text-sm text-gray-500">
                  Add your first domain to enable widget sessions
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {domains.map((domain) => (
                  <div
                    key={domain}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Globe size={18} className="text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-900">{domain}</p>
                        <p className="text-xs text-gray-500">
                          Widget enabled on this domain
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveDomain(domain)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove domain"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="rounded-lg bg-blue-50 p-4 text-sm text-blue-900 border border-blue-200">
            <p className="font-medium mb-1">🛡️ Security Note</p>
            <p>
              Only domains you register here can load the widget. This prevents unauthorized usage and protects your data.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 flex justify-end gap-3 p-6 bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DomainManagement;
