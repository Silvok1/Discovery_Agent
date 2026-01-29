'use client';

import { useState } from 'react';
import {
  Settings,
  User,
  Bell,
  Shield,
  Database,
  Users,
  Plus,
  Trash2,
  Edit2,
  Mail,
  ChevronDown,
  Check,
  X,
  Loader2,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

type TabId = 'profile' | 'users' | 'notifications' | 'security' | 'data';

type UserRole = 'admin' | 'editor' | 'viewer';

interface TeamUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'pending' | 'inactive';
  lastActive?: string;
  createdAt: string;
}

const TABS = [
  { id: 'profile' as TabId, label: 'Profile', icon: User },
  { id: 'users' as TabId, label: 'User Management', icon: Users },
  { id: 'notifications' as TabId, label: 'Notifications', icon: Bell },
  { id: 'security' as TabId, label: 'Security', icon: Shield },
  { id: 'data' as TabId, label: 'Data & Storage', icon: Database },
];

const ROLE_INFO = {
  admin: {
    label: 'Administrator',
    description: 'Full access to all features and settings',
    color: 'bg-red-100 text-red-700',
  },
  editor: {
    label: 'Editor',
    description: 'Can create and manage projects and interviews',
    color: 'bg-blue-100 text-blue-700',
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to assigned projects',
    color: 'bg-gray-100 text-gray-700',
  },
};

// Mock data - replace with API calls
const MOCK_USERS: TeamUser[] = [
  {
    id: '1',
    email: 'admin@discovery.local',
    name: 'Admin User',
    role: 'admin',
    status: 'active',
    lastActive: '2026-01-27T10:30:00Z',
    createdAt: '2025-12-01T00:00:00Z',
  },
  {
    id: '2',
    email: 'sarah.jones@company.com',
    name: 'Sarah Jones',
    role: 'editor',
    status: 'active',
    lastActive: '2026-01-26T15:45:00Z',
    createdAt: '2026-01-15T00:00:00Z',
  },
  {
    id: '3',
    email: 'mike.chen@company.com',
    name: 'Mike Chen',
    role: 'viewer',
    status: 'pending',
    createdAt: '2026-01-25T00:00:00Z',
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabId>('profile');
  const [users, setUsers] = useState<TeamUser[]>(MOCK_USERS);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editingUser, setEditingUser] = useState<TeamUser | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // New user form state
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('viewer');

  const handleAddUser = async () => {
    if (!newUserEmail.trim() || !newUserName.trim()) return;

    setIsLoading(true);
    try {
      // TODO: Call API to create user
      const newUser: TeamUser = {
        id: Date.now().toString(),
        email: newUserEmail,
        name: newUserName,
        role: newUserRole,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      setUsers([...users, newUser]);
      setShowAddUser(false);
      setNewUserEmail('');
      setNewUserName('');
      setNewUserRole('viewer');
    } catch (error) {
      console.error('Failed to add user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: UserRole) => {
    setIsLoading(true);
    try {
      // TODO: Call API to update user role
      setUsers(users.map(u =>
        u.id === userId ? { ...u, role: newRole } : u
      ));
    } catch (error) {
      console.error('Failed to update role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this user?')) return;

    setIsLoading(true);
    try {
      // TODO: Call API to delete user
      setUsers(users.filter(u => u.id !== userId));
    } catch (error) {
      console.error('Failed to delete user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendInvite = async (userId: string) => {
    setIsLoading(true);
    try {
      // TODO: Call API to resend invitation
      console.log('Resending invite to user:', userId);
      alert('Invitation sent!');
    } catch (error) {
      console.error('Failed to resend invite:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Settings</h1>
        <p className="text-gray-500">Manage your account, team, and application preferences.</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6 overflow-x-auto" aria-label="Settings tabs">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition-colors whitespace-nowrap',
                  activeTab === tab.id
                    ? 'border-brand-teal text-brand-dark'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="max-w-2xl">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Profile Information</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="profile-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="profile-name"
                    type="text"
                    defaultValue="Admin User"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  />
                </div>
                <div>
                  <label htmlFor="profile-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="profile-email"
                    type="email"
                    defaultValue="admin@discovery.local"
                    disabled
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 text-sm text-gray-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">Contact support to change your email</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <span className={cn('inline-block rounded-full px-3 py-1 text-sm font-medium', ROLE_INFO.admin.color)}>
                    {ROLE_INFO.admin.label}
                  </span>
                </div>
                <div className="pt-4 border-t">
                  <button
                    type="button"
                    className="rounded-lg bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Team Members</h2>
                <p className="text-sm text-gray-500">
                  Manage who has access to your Discovery Agent workspace.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddUser(true)}
                className="flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
              >
                <UserPlus className="h-4 w-4" />
                Add User
              </button>
            </div>

            {/* Role Legend */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Access Levels</h3>
              <div className="grid gap-3 sm:grid-cols-3">
                {(Object.keys(ROLE_INFO) as UserRole[]).map((role) => (
                  <div key={role} className="flex items-start gap-2">
                    <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', ROLE_INFO[role].color)}>
                      {ROLE_INFO[role].label}
                    </span>
                    <span className="text-xs text-gray-500">{ROLE_INFO[role].description}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Users List */}
            <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200">
                            <User className="h-5 w-5 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <RoleSelector
                          value={user.role}
                          onChange={(role) => handleUpdateRole(user.id, role)}
                          disabled={user.id === '1'} // Can't change own role
                        />
                      </td>
                      <td className="px-4 py-4">
                        <span className={cn(
                          'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                          user.status === 'active' ? 'bg-green-100 text-green-700' :
                          user.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                          'bg-gray-100 text-gray-600'
                        )}>
                          {user.status === 'active' && <span className="mr-1 h-1.5 w-1.5 rounded-full bg-green-500" />}
                          {user.status.charAt(0).toUpperCase() + user.status.slice(1)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {user.lastActive
                          ? new Date(user.lastActive).toLocaleDateString()
                          : 'Never'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {user.status === 'pending' && (
                            <button
                              type="button"
                              onClick={() => handleResendInvite(user.id)}
                              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-blue-600"
                              aria-label="Resend invite"
                              title="Resend invite"
                            >
                              <Mail className="h-4 w-4" />
                            </button>
                          )}
                          {user.id !== '1' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id)}
                              className="rounded p-1.5 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                              aria-label="Remove user"
                              title="Remove user"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="max-w-2xl">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Notification Preferences</h2>
              <div className="space-y-4">
                <NotificationToggle
                  id="notify-interview-complete"
                  label="Interview Completed"
                  description="Receive email when a participant completes an interview"
                  defaultChecked={true}
                />
                <NotificationToggle
                  id="notify-deadline"
                  label="Deadline Reminders"
                  description="Get notified when interview deadlines are approaching"
                  defaultChecked={true}
                />
                <NotificationToggle
                  id="notify-insights"
                  label="New Insights"
                  description="Alert when AI identifies significant patterns"
                  defaultChecked={false}
                />
                <NotificationToggle
                  id="notify-weekly"
                  label="Weekly Digest"
                  description="Summary of all interview activity"
                  defaultChecked={true}
                />
              </div>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Password
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                    New Password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  />
                </div>
                <div>
                  <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                  />
                </div>
                <button
                  type="button"
                  className="rounded-lg bg-brand-teal px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                >
                  Update Password
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h2>
              <div className="flex items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <Shield className="h-5 w-5 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-600">
                    Add an extra layer of security to your account by enabling two-factor authentication.
                  </p>
                  <button
                    type="button"
                    className="mt-3 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Enable 2FA
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Data Tab */}
        {activeTab === 'data' && (
          <div className="max-w-2xl space-y-6">
            <div className="rounded-lg border border-gray-200 bg-white p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Export Data</h2>
              <p className="text-sm text-gray-600 mb-4">
                Download all your projects, interviews, and insights in a portable format.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Export as JSON
                </button>
                <button
                  type="button"
                  className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Export as CSV
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-6">
              <h2 className="text-lg font-semibold text-red-900 mb-2">Danger Zone</h2>
              <p className="text-sm text-red-700 mb-4">
                Permanently delete your account and all associated data. This action cannot be undone.
              </p>
              <button
                type="button"
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete Account
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light">
                <UserPlus className="h-5 w-5 text-brand-teal" />
              </div>
              <h2 className="text-xl font-bold text-brand-dark">Add Team Member</h2>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label htmlFor="new-user-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  id="new-user-name"
                  type="text"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
              </div>
              <div>
                <label htmlFor="new-user-email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  id="new-user-email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="john@company.com"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                />
              </div>
              <div>
                <label htmlFor="new-user-role" className="block text-sm font-medium text-gray-700 mb-1">
                  Access Level
                </label>
                <select
                  id="new-user-role"
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as UserRole)}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-brand-teal focus:outline-none focus:ring-1 focus:ring-brand-teal"
                >
                  <option value="viewer">Viewer - Read-only access</option>
                  <option value="editor">Editor - Create and manage content</option>
                  <option value="admin">Administrator - Full access</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg bg-blue-50 p-3 mb-4">
              <div className="flex gap-2">
                <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <p className="text-sm text-blue-700">
                  An invitation email will be sent to the user with instructions to set up their account.
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowAddUser(false);
                  setNewUserEmail('');
                  setNewUserName('');
                  setNewUserRole('viewer');
                }}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddUser}
                disabled={!newUserEmail.trim() || !newUserName.trim() || isLoading}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white',
                  !newUserEmail.trim() || !newUserName.trim() || isLoading
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-brand-teal hover:bg-teal-700'
                )}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="h-4 w-4" />
                )}
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Role Selector Component
function RoleSelector({
  value,
  onChange,
  disabled = false,
}: {
  value: UserRole;
  onChange: (role: UserRole) => void;
  disabled?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (disabled) {
    return (
      <span className={cn('rounded-full px-2.5 py-1 text-xs font-medium', ROLE_INFO[value].color)}>
        {ROLE_INFO[value].label}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium',
          ROLE_INFO[value].color
        )}
      >
        {ROLE_INFO[value].label}
        <ChevronDown className="h-3 w-3" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-20 mt-1 w-48 rounded-lg border border-gray-200 bg-white py-1 shadow-lg">
            {(Object.keys(ROLE_INFO) as UserRole[]).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => {
                  onChange(role);
                  setIsOpen(false);
                }}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-gray-50"
              >
                <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', ROLE_INFO[role].color)}>
                  {ROLE_INFO[role].label}
                </span>
                {value === role && <Check className="h-4 w-4 text-green-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Notification Toggle Component
function NotificationToggle({
  id,
  label,
  description,
  defaultChecked,
}: {
  id: string;
  label: string;
  description: string;
  defaultChecked: boolean;
}) {
  const [isEnabled, setIsEnabled] = useState(defaultChecked);

  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
      <div>
        <span id={`${id}-label`} className="font-medium text-gray-900">{label}</span>
        <p id={`${id}-desc`} className="text-sm text-gray-500">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => setIsEnabled(!isEnabled)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
          isEnabled ? 'bg-brand-teal' : 'bg-gray-200'
        )}
        role="switch"
        aria-checked={isEnabled ? 'true' : 'false'}
        aria-labelledby={`${id}-label`}
        aria-describedby={`${id}-desc`}
      >
        <span
          className={cn(
            'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
            isEnabled ? 'translate-x-6' : 'translate-x-1'
          )}
        />
      </button>
    </div>
  );
}
