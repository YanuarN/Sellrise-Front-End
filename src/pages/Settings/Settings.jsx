import { useEffect, useState } from 'react';
import { Settings as SettingsIcon, Shield, Bell, Users, CreditCard, Loader2 } from 'lucide-react';
import { Button, PageHeader, SettingsNavItem } from '../../components';
import useAuthStore from '../../stores/authStore';
import { workspaceService, userService } from '../../services';

const NAV_ITEMS = [
    { key: 'workspace', label: 'Workspace', icon: SettingsIcon },
    { key: 'team', label: 'Team', icon: Users },
    { key: 'profile', label: 'My Profile', icon: Users },
    { key: 'security', label: 'Security', icon: Shield },
    { key: 'notifications', label: 'Notifications', icon: Bell },
    { key: 'billing', label: 'Billing API', icon: CreditCard },
];

export default function Settings() {
    const [activeNav, setActiveNav] = useState('workspace');
    const [workspace, setWorkspace] = useState(null);
    const [workspaceName, setWorkspaceName] = useState('');
    const [loadingWorkspace, setLoadingWorkspace] = useState(true);
    const [savingWorkspace, setSavingWorkspace] = useState(false);
    const [workspaceMessage, setWorkspaceMessage] = useState('');

    const [users, setUsers] = useState([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [usersError, setUsersError] = useState('');
    const [updatingUserId, setUpdatingUserId] = useState('');

    const user = useAuthStore((s) => s.user);
    const isAdmin = user?.role === 'admin';

    useEffect(() => {
        const fetchWorkspace = async () => {
            setLoadingWorkspace(true);
            setWorkspaceMessage('');
            try {
                let data = null;
                if (user?.workspace_id) {
                    data = await workspaceService.getWorkspace(user.workspace_id);
                } else {
                    data = await workspaceService.getCurrentWorkspace();
                }
                setWorkspace(data);
                setWorkspaceName(data?.name || '');
            } catch (err) {
                setWorkspaceMessage(err.message || 'Failed to load workspace details.');
            } finally {
                setLoadingWorkspace(false);
            }
        };

        const fetchUsers = async () => {
            setLoadingUsers(true);
            setUsersError('');
            try {
                const data = await userService.listUsers();
                setUsers(Array.isArray(data) ? data : []);
            } catch (err) {
                setUsersError(err.message || 'Failed to load team members.');
            } finally {
                setLoadingUsers(false);
            }
        };

        fetchWorkspace();
        fetchUsers();
    }, [user?.workspace_id]);

    const handleSaveWorkspace = async () => {
        if (!workspace?.id || !workspaceName.trim()) return;

        setSavingWorkspace(true);
        setWorkspaceMessage('');

        try {
            const updated = await workspaceService.updateWorkspace(workspace.id, {
                name: workspaceName.trim(),
            });
            setWorkspace(updated);
            setWorkspaceName(updated.name);
            setWorkspaceMessage('Workspace updated successfully.');
        } catch (err) {
            setWorkspaceMessage(err.message || 'Failed to update workspace.');
        } finally {
            setSavingWorkspace(false);
        }
    };

    const handleRoleChange = async (targetUserId, role) => {
        setUpdatingUserId(targetUserId);
        setUsersError('');

        try {
            const updated = await userService.updateUser(targetUserId, { role });
            setUsers((prev) => prev.map((u) => (u.id === targetUserId ? { ...u, role: updated.role } : u)));
        } catch (err) {
            setUsersError(err.message || 'Failed to update user role.');
        } finally {
            setUpdatingUserId('');
        }
    };

    const handleDeactivateUser = async (targetUserId) => {
        if (!confirm('Deactivate this user?')) return;

        setUpdatingUserId(targetUserId);
        setUsersError('');

        try {
            await userService.deactivateUser(targetUserId);
            setUsers((prev) => prev.map((u) => (u.id === targetUserId ? { ...u, is_active: false } : u)));
        } catch (err) {
            setUsersError(err.message || 'Failed to deactivate user.');
        } finally {
            setUpdatingUserId('');
        }
    };

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
                                <input
                                    type="text"
                                    value={workspaceName}
                                    onChange={(e) => setWorkspaceName(e.target.value)}
                                    disabled={loadingWorkspace || !isAdmin}
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl focus:ring-indigo-500 focus:border-indigo-500 block p-3 shadow-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Workspace Slug</label>
                                <input
                                    type="text"
                                    value={workspace?.slug || '—'}
                                    readOnly
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-500 text-sm rounded-xl block p-3 shadow-sm font-mono"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">Workspace ID</label>
                                <input
                                    type="text"
                                    value={workspace?.id || user?.workspace_id || '—'}
                                    readOnly
                                    className="w-full bg-slate-50 border border-slate-200 text-slate-500 text-sm rounded-xl block p-3 shadow-sm font-mono"
                                />
                            </div>

                            <div className="pt-4 flex justify-end">
                                <Button
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg w-32"
                                    onClick={handleSaveWorkspace}
                                    disabled={!isAdmin || savingWorkspace || loadingWorkspace || !workspaceName.trim()}
                                >
                                    {savingWorkspace ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Save'}
                                </Button>
                            </div>

                            {workspaceMessage && (
                                <p className={`text-sm ${workspaceMessage.toLowerCase().includes('success') ? 'text-green-600' : 'text-red-600'}`}>
                                    {workspaceMessage}
                                </p>
                            )}
                        </div>
                      </div>
                    )}

                    {activeNav === 'team' && (
                      <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-slate-800 mb-6 border-b border-slate-100 pb-4">Team Management</h2>

                        {usersError && <p className="text-sm text-red-600 mb-4">{usersError}</p>}

                        {loadingUsers ? (
                            <div className="py-8 flex justify-center">
                                <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {users.map((u) => (
                                    <div key={u.id} className="border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                                        <div>
                                            <p className="font-semibold text-slate-800">{u.full_name || 'Unnamed User'}</p>
                                            <p className="text-sm text-slate-500">{u.email}</p>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${u.is_active ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-600'}`}>
                                                {u.is_active ? 'active' : 'inactive'}
                                            </span>

                                            <select
                                                value={u.role}
                                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                                disabled={!isAdmin || updatingUserId === u.id || !u.is_active}
                                                className="bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-xl p-2 capitalize"
                                            >
                                                <option value="admin">admin</option>
                                                <option value="agent">agent</option>
                                                <option value="viewer">viewer</option>
                                            </select>

                                            {isAdmin && u.is_active && u.id !== user?.id && (
                                                <Button
                                                    variant="outline"
                                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                                    disabled={updatingUserId === u.id}
                                                    onClick={() => handleDeactivateUser(u.id)}
                                                >
                                                    {updatingUserId === u.id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Deactivate'}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {users.length === 0 && (
                                    <p className="text-sm text-slate-500">No users found in this workspace.</p>
                                )}
                            </div>
                        )}
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
