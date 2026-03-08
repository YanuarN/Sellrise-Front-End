import { useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Users, CreditCard, Loader2 } from 'lucide-react';
import { Button, PageHeader, SettingsNavItem } from '../../components';
import useAuthStore from '../../stores/authStore';

const NAV_ITEMS = [
    { key: 'workspace', label: 'Workspace', icon: SettingsIcon },
    { key: 'profile', label: 'My Profile', icon: Users },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'billing', label: 'Billing API', icon: CreditCard },
];

export default function Settings() {
    const [activeNav, setActiveNav] = useState('workspace');
    const user = useAuthStore((s) => s.user);
    const logout = useAuthStore((s) => s.logout);

    return (
        <div className="flex flex-col h-full bg-slate-50 rounded-2xl p-8 overflow-hidden">
            <PageHeader
                title="Settings"
                description="Manage your workspace configuration, users, and billing details."
                className="mb-8"
            />

            <div className="flex gap-10 flex-1 overflow-hidden">
                {/* Sidebar Nav */}
                <div className="w-64 shrink-0 flex flex-col gap-2">
                    {NAV_ITEMS.map(({ key, label, icon }) => (
                        <SettingsNavItem
                            key={key}
                            label={label}
                            icon={icon}
                            isActive={activeNav === key}
                            onClick={() => setActiveNav(key)}
                        />
                    ))}
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-y-auto pr-4 space-y-8 pb-10">
                    {activeNav === 'workspace' && (
                      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Workspace Details</h2>

                        <div className="space-y-6 max-w-xl">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Workspace Name</label>
                                <input type="text" defaultValue="Acme Corp Widget" className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 shadow-sm" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Timezone</label>
                                <select className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 shadow-sm">
                                    <option>UTC-08:00 Pacific Time (US &amp; Canada)</option>
                                    <option>UTC-05:00 Eastern Time (US &amp; Canada)</option>
                                    <option>UTC+00:00 London</option>
                                    <option>UTC+07:00 Jakarta (WIB)</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg w-32">
                                    Save
                                </Button>
                            </div>
                        </div>
                      </div>
                    )}

                    {activeNav === 'profile' && (
                      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">My Profile</h2>

                        <div className="space-y-6 max-w-xl">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                                    {(user?.full_name || 'U')[0].toUpperCase()}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800">{user?.full_name || 'Unknown User'}</h3>
                                    <p className="text-sm text-slate-500">{user?.email || '—'}</p>
                                    <span className="inline-block mt-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 capitalize">{user?.role || 'viewer'}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
                                <input type="text" defaultValue={user?.full_name || ''} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 shadow-sm" readOnly />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                                <input type="email" defaultValue={user?.email || ''} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 shadow-sm" readOnly />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Role</label>
                                <input type="text" defaultValue={user?.role || 'viewer'} className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 shadow-sm capitalize" readOnly />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Workspace ID</label>
                                <input type="text" defaultValue={user?.workspace_id || '—'} className="w-full bg-slate-50 border border-slate-200 text-slate-400 text-sm rounded-xl block p-3 shadow-sm font-mono" readOnly />
                            </div>
                        </div>
                      </div>
                    )}

                    {activeNav === 'security' && (
                      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Security</h2>
                        <p className="text-slate-500 text-sm">Password management and two-factor authentication settings will be available here.</p>
                      </div>
                    )}

                    {activeNav === 'notifications' && (
                      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Notifications</h2>
                        <p className="text-slate-500 text-sm">Email and push notification preferences will be available here.</p>
                      </div>
                    )}

                    {activeNav === 'billing' && (
                      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Billing & API</h2>
                        <p className="text-slate-500 text-sm">Subscription and API key management will be available here.</p>
                      </div>
                    )}

                    <div className="bg-white border text-red-600 border-red-200 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow group">
                        <h2 className="text-xl font-bold mb-2">Danger Zone</h2>
                        <p className="text-sm text-slate-500 mb-6 max-w-xl">Once you delete your workspace, there is no going back. All scenarios, leads, and analytics will be permanently destroyed.</p>
                        <button className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white rounded-xl font-semibold transition-all shadow-sm">
                            Delete Workspace
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
