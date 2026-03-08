import { useEffect, useMemo, useState } from 'react';
import { Card } from '../Card';
import { Button } from '../Button';
import { RotateCcw } from 'lucide-react';

function BrandingCustomizer({ initialBranding, onBrandingChange }) {
  const defaultBranding = useMemo(() => ({
    primaryColor: '#3b82f6',
    bubbleColor: '#3b82f6',
    bubbleIcon: '💬',
    welcomeMessage: 'Hi! How can we help?',
    position: 'bottom-right',
    logoUrl: '',
    borderRadius: '16',
    bubbleSize: 'large',
  }), []);

  const [branding, setBranding] = useState({
    ...defaultBranding,
    ...(initialBranding || {}),
  });

  useEffect(() => {
    if (!initialBranding) {
      return;
    }

    setBranding({
      ...defaultBranding,
      ...initialBranding,
    });
  }, [defaultBranding, initialBranding]);

  const handleChange = (field, value) => {
    const updated = { ...branding, [field]: value };
    setBranding(updated);
    onBrandingChange?.(updated);
  };

  const handleReset = () => {
    const defaults = defaultBranding;
    setBranding(defaults);
    onBrandingChange?.(defaults);
  };

  const positions = [
    { value: 'bottom-right', label: 'Bottom Right', icon: '↘️' },
    { value: 'bottom-left', label: 'Bottom Left', icon: '↙️' },
    { value: 'top-right', label: 'Top Right', icon: '↗️' },
    { value: 'top-left', label: 'Top Left', icon: '↖️' },
  ];

  const sizes = [
    { value: 'small', label: 'Small', width: '40px' },
    { value: 'medium', label: 'Medium', width: '50px' },
    { value: 'large', label: 'Large', width: '60px' },
  ];

  const commonColors = [
    '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
    '#ec4899', '#06b6d4', '#64748b', '#000000', '#ffffff'
  ];

  const commonEmojis = ['💬', '👋', '✉️', '❓', '🎯', '💡', '🤝', '⭐', '📞', '🛑'];

  return (
    <div className="space-y-6">
      {/* Preview Panel */}
      <Card className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="gap-2 text-xs"
            >
              <RotateCcw size={14} />
              Reset to Default
            </Button>
          </div>

          {/* Preview Area */}
          <div className="relative bg-white rounded-lg h-64 border border-gray-200 overflow-hidden shadow-sm">
            {/* Mock Website */}
            <div className="w-full h-full p-4 bg-gradient-to-b from-blue-50 to-white flex flex-col">
              <div className="bg-white p-3 rounded border border-gray-200 mb-2">
                <p className="text-xs font-semibold text-gray-600">Website Preview</p>
              </div>

              {/* Logo if provided */}
              {branding.logoUrl && (
                <div className="mb-3">
                  <img
                    src={branding.logoUrl}
                    alt="Logo"
                    className="h-8 w-8 rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              )}

              <p className="text-sm text-gray-700 flex-1">Your website content goes here...</p>

              {/* Widget Bubble Preview */}
              <div
                className={`absolute flex items-center justify-center shadow-lg hover:shadow-xl transition-all cursor-pointer`}
                style={{
                  width: sizes.find(s => s.value === branding.bubbleSize)?.width || '60px',
                  height: sizes.find(s => s.value === branding.bubbleSize)?.width || '60px',
                  backgroundColor: branding.bubbleColor,
                  borderRadius: `${branding.borderRadius}%`,
                  [branding.position.includes('right') ? 'right' : 'left']: '16px',
                  [branding.position.includes('bottom') ? 'bottom' : 'top']: '16px',
                }}
              >
                <span className="text-2xl">{branding.bubbleIcon}</span>
              </div>

              {/* Tooltip Preview */}
              {branding.position.includes('bottom') && branding.position.includes('right') && (
                <div className="absolute bottom-20 right-4 bg-white rounded-lg shadow-lg p-3 border border-gray-200 max-w-xs">
                  <p className="text-sm font-medium text-gray-900">{branding.welcomeMessage}</p>
                  <div
                    className="w-2 h-2 absolute rounded-full"
                    style={{
                      backgroundColor: branding.primaryColor,
                      bottom: '-6px',
                      right: '20px',
                    }}
                  ></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Primary Color */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Primary Color</h3>
            <p className="mt-1 text-sm text-gray-600">Used for chat window header and buttons</p>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Color Picker</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={branding.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="w-16 h-10 rounded cursor-pointer border border-gray-300"
                />
                <code className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-2 rounded">
                  {branding.primaryColor}
                </code>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Quick Colors</p>
            <div className="flex flex-wrap gap-2">
              {commonColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleChange('primaryColor', color)}
                  className="w-8 h-8 rounded border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: branding.primaryColor === color ? '#000' : '#e5e7eb',
                    borderWidth: branding.primaryColor === color ? '3px' : '1px',
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Bubble Color */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bubble Color</h3>
            <p className="mt-1 text-sm text-gray-600">Color of the floating chat bubble</p>
          </div>

          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Color Picker</label>
              <div className="flex gap-3 items-center">
                <input
                  type="color"
                  value={branding.bubbleColor}
                  onChange={(e) => handleChange('bubbleColor', e.target.value)}
                  className="w-16 h-10 rounded cursor-pointer border border-gray-300"
                />
                <code className="text-sm font-mono text-gray-600 bg-gray-50 px-3 py-2 rounded">
                  {branding.bubbleColor}
                </code>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Quick Colors</p>
            <div className="flex flex-wrap gap-2">
              {commonColors.map((color) => (
                <button
                  key={color}
                  onClick={() => handleChange('bubbleColor', color)}
                  className="w-8 h-8 rounded border-2 transition-all hover:scale-110"
                  style={{
                    backgroundColor: color,
                    borderColor: branding.bubbleColor === color ? '#000' : '#e5e7eb',
                    borderWidth: branding.bubbleColor === color ? '3px' : '1px',
                  }}
                  title={color}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Bubble Icon */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bubble Icon</h3>
            <p className="mt-1 text-sm text-gray-600">Emoji displayed in the chat bubble</p>
          </div>

          <div className="flex gap-3 items-end">
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700 mb-2">Current</label>
              <div className="w-16 h-16 bg-gray-50 rounded border border-gray-300 flex items-center justify-center text-4xl">
                {branding.bubbleIcon}
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">Or type custom emoji</label>
              <input
                type="text"
                maxLength="2"
                value={branding.bubbleIcon}
                onChange={(e) => handleChange('bubbleIcon', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-3xl text-center"
                placeholder="💬"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-700 mb-2">Popular Emojis</p>
            <div className="grid grid-cols-5 gap-2">
              {commonEmojis.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleChange('bubbleIcon', emoji)}
                  className="p-2 text-2xl bg-gray-50 hover:bg-gray-100 rounded border-2 transition-all"
                  style={{
                    borderColor: branding.bubbleIcon === emoji ? '#3b82f6' : '#e5e7eb',
                  }}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Welcome Message */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Welcome Message</h3>
            <p className="mt-1 text-sm text-gray-600">Shown when visitor hovers over the bubble</p>
          </div>

          <input
            type="text"
            maxLength="50"
            value={branding.welcomeMessage}
            onChange={(e) => handleChange('welcomeMessage', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Hi! How can we help?"
          />

          <div className="text-xs text-gray-500">
            {branding.welcomeMessage.length}/50 characters
          </div>
        </div>
      </Card>

      {/* Logo URL */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Logo URL</h3>
            <p className="mt-1 text-sm text-gray-600">Optional logo to display in the chat window</p>
          </div>

          <input
            type="url"
            value={branding.logoUrl}
            onChange={(e) => handleChange('logoUrl', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            placeholder="https://example.com/logo.png"
          />

          {branding.logoUrl && (
            <div className="relative bg-gray-50 p-4 rounded border border-gray-200">
              <p className="text-xs font-medium text-gray-600 mb-2">Preview</p>
              <img
                src={branding.logoUrl}
                alt="Logo"
                className="h-12 w-12 rounded object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          )}
        </div>
      </Card>

      {/* Position */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Widget Position</h3>
            <p className="mt-1 text-sm text-gray-600">Where the chat bubble appears on the page</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {positions.map((pos) => (
              <button
                key={pos.value}
                onClick={() => handleChange('position', pos.value)}
                className="p-3 rounded-lg border-2 transition-all text-sm font-medium"
                style={{
                  borderColor: branding.position === pos.value ? '#3b82f6' : '#e5e7eb',
                  backgroundColor: branding.position === pos.value ? '#eff6ff' : '#f9fafb',
                  color: branding.position === pos.value ? '#1e40af' : '#374151',
                }}
              >
                <div className="text-lg mb-1">{pos.icon}</div>
                {pos.label}
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Bubble Size */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Bubble Size</h3>
            <p className="mt-1 text-sm text-gray-600">Diameter of the floating bubble</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {sizes.map((size) => (
              <button
                key={size.value}
                onClick={() => handleChange('bubbleSize', size.value)}
                className="p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2"
                style={{
                  borderColor: branding.bubbleSize === size.value ? '#3b82f6' : '#e5e7eb',
                  backgroundColor: branding.bubbleSize === size.value ? '#eff6ff' : '#f9fafb',
                }}
              >
                <div
                  className="rounded-full bg-blue-500"
                  style={{
                    width: size.width,
                    height: size.width,
                  }}
                ></div>
                <span
                  className="text-sm font-medium"
                  style={{
                    color: branding.bubbleSize === size.value ? '#1e40af' : '#374151',
                  }}
                >
                  {size.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </Card>

      {/* Border Radius */}
      <Card>
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Corner Style</h3>
            <p className="mt-1 text-sm text-gray-600">Roundness of the chat window corners</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Border Radius: {branding.borderRadius}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={branding.borderRadius}
                onChange={(e) => handleChange('borderRadius', e.target.value)}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Preview of different radius */}
            <div className="flex gap-4 items-center justify-center p-4 bg-gray-50 rounded-lg">
              {[0, 25, 50, 100].map((radius) => (
                <div
                  key={radius}
                  className="w-12 h-12 bg-blue-500 shadow flex items-center justify-center"
                  style={{
                    borderRadius: `${radius}%`,
                  }}
                >
                  <span className="text-white text-xs font-bold">{radius}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Summary Card */}
      <Card className="bg-green-50 border border-green-200">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-green-900">✅ Configuration Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-green-700 font-medium">Primary Color</p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: branding.primaryColor }}
                ></div>
                <code>{branding.primaryColor}</code>
              </div>
            </div>
            <div>
              <p className="text-xs text-green-700 font-medium">Bubble Color</p>
              <div className="flex items-center gap-2 mt-1">
                <div
                  className="w-6 h-6 rounded"
                  style={{ backgroundColor: branding.bubbleColor }}
                ></div>
                <code>{branding.bubbleColor}</code>
              </div>
            </div>
            <div>
              <p className="text-xs text-green-700 font-medium">Bubble Icon</p>
              <p className="text-2xl mt-1">{branding.bubbleIcon}</p>
            </div>
            <div>
              <p className="text-xs text-green-700 font-medium">Position</p>
              <p className="text-gray-900 font-medium capitalize mt-1">{branding.position.replace('-', ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-green-700 font-medium">Size</p>
              <p className="text-gray-900 font-medium capitalize mt-1">{branding.bubbleSize}</p>
            </div>
            <div>
              <p className="text-xs text-green-700 font-medium">Corner Radius</p>
              <p className="text-gray-900 font-medium mt-1">{branding.borderRadius}%</p>
            </div>
            <div>
              <p className="text-xs text-green-700 font-medium">Logo</p>
              <p className="text-gray-900 font-medium mt-1">{branding.logoUrl ? 'Configured' : 'Not set'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-green-700 font-medium">Welcome Message</p>
              <p className="text-gray-900 font-medium mt-1">{branding.welcomeMessage || '-'}</p>
            </div>
          </div>
          <p className="text-xs text-green-800 pt-2 border-t border-green-200">
            This summary reflects your current widget appearance settings for this workspace.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default BrandingCustomizer;
