'use client';

import { useState } from 'react';
import {
    User,
    Settings,
    Shield,
    Bell,
    Moon,
    Sun,
    Monitor,
    LogOut,
    Save,
    CreditCard,
    HelpCircle,
    Info,
    Mail,
    Lock,
    Globe,
    Clock
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { signOut } from 'next-auth/react';

export function SettingsView() {
    const { theme, setTheme } = useTheme();
    const [activeTab, setActiveTab] = useState('general');
    const [isLoading, setIsLoading] = useState(false);

    // Mock User Data
    const [userData, setUserData] = useState({
        name: 'Admin User',
        email: 'admin@tirhuta.com',
        role: 'Super Admin'
    });

    const handleSave = () => {
        setIsLoading(true);
        // Simulate API saving
        setTimeout(() => {
            setIsLoading(false);
            alert('Settings saved successfully!');
        }, 1500);
    };

    const tabs = [
        { id: 'general', label: 'General', icon: Settings },
        { id: 'account', label: 'Account', icon: User },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'about', label: 'About', icon: Info },
    ];

    return (
        <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 flex-shrink-0">
                <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm sticky top-8">
                    <nav className="space-y-1">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </nav>

                    <div className="mt-8 pt-8 border-t border-gray-200 dark:border-slate-800">
                        <button
                            onClick={() => signOut({ callbackUrl: `${window.location.origin}/login` })}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            Sign Out
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
                <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm min-h-[600px]">

                    {/* General Tab */}
                    {activeTab === 'general' && (
                        <div className="space-y-8 animate-in fade-in cursor-default">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">General Settings</h2>
                                <p className="text-slate-500 dark:text-slate-400">Manage your workspace appearance and preferences.</p>
                            </div>

                            <div className="space-y-6">
                                <section>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Appearance</h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                        <button
                                            onClick={() => setTheme('light')}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'light'
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}
                                        >
                                            <div className="p-2 bg-white rounded-lg shadow-sm">
                                                <Sun className="w-6 h-6 text-amber-500" />
                                            </div>
                                            <span className="font-medium">Light Mode</span>
                                        </button>
                                        <button
                                            onClick={() => setTheme('dark')}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'dark'
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}
                                        >
                                            <div className="p-2 bg-slate-800 rounded-lg shadow-sm">
                                                <Moon className="w-6 h-6 text-purple-400" />
                                            </div>
                                            <span className="font-medium">Dark Mode</span>
                                        </button>
                                        <button
                                            onClick={() => setTheme('system')}
                                            className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${theme === 'system'
                                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                                : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                                                }`}
                                        >
                                            <div className="p-2 bg-slate-200 dark:bg-slate-700 rounded-lg shadow-sm">
                                                <Monitor className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                                            </div>
                                            <span className="font-medium">System</span>
                                        </button>
                                    </div>
                                </section>

                                <div className="border-t border-gray-100 dark:border-slate-800 my-6"></div>

                                <section>
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-4">Localization</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Globe className="w-4 h-4" /> Language
                                            </label>
                                            <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                                                <option>English (US)</option>
                                                <option>Hindi (India)</option>
                                                <option>Spanish</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                <Clock className="w-4 h-4" /> Timezone
                                            </label>
                                            <select className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500">
                                                <option>UTC (Coordinated Universal Time)</option>
                                                <option>IST (Indian Standard Time)</option>
                                                <option>PST (Pacific Standard Time)</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>
                    )}

                    {/* Account Tab */}
                    {activeTab === 'account' && (
                        <div className="space-y-8 animate-in fade-in cursor-default">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Account Settings</h2>
                                <p className="text-slate-500 dark:text-slate-400">Update your personal information and contact details.</p>
                            </div>

                            <div className="flex items-center gap-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                                    {userData.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{userData.name}</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{userData.role}</p>
                                    <button className="mt-2 text-sm text-blue-600 dark:text-blue-400 font-medium hover:underline">Change Avatar</button>
                                </div>
                            </div>

                            <div className="grid gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Display Name</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="text"
                                            value={userData.name}
                                            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            type="email"
                                            value={userData.email}
                                            onChange={(e) => setUserData({ ...userData, email: e.target.value })}
                                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Security Tab */}
                    {activeTab === 'security' && (
                        <div className="space-y-8 animate-in fade-in cursor-default">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">Security</h2>
                                <p className="text-slate-500 dark:text-slate-400">Manage your password and security preferences.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Change Password</h3>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="password"
                                                placeholder="Current Password"
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="password"
                                                placeholder="New Password"
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                            <input
                                                type="password"
                                                placeholder="Confirm New Password"
                                                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                    </div>
                                    <button className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                                        Update Password
                                    </button>
                                </div>

                                <div className="border-t border-gray-100 dark:border-slate-800 my-6"></div>

                                <div className="space-y-4">
                                    <h3 className="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">Two-Factor Authentication</h3>
                                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg dark:bg-blue-900/20 dark:text-blue-400">
                                                <Shield className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-semibold text-slate-900 dark:text-white">Authenticator App</h4>
                                                <p className="text-sm text-slate-500 dark:text-slate-400">Secure your account with 2FA.</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                                            Setup
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* About Tab */}
                    {activeTab === 'about' && (
                        <div className="space-y-8 animate-in fade-in cursor-default">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">About Application</h2>
                                <p className="text-slate-500 dark:text-slate-400">System information and version details.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 text-center">
                                    <div className="w-16 h-16 bg-blue-600 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/25">
                                        <span className="text-white text-2xl font-bold">T</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tirhuta Admin</h3>
                                    <p className="text-slate-500 dark:text-slate-400 mb-6">Version 1.0.0 (Beta)</p>
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                        System Operational
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Framework</span>
                                        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Next.js 14</p>
                                    </div>
                                    <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                        <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Environment</span>
                                        <p className="text-lg font-medium text-slate-700 dark:text-slate-300">Production</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Footer / Save Action */}
                    <div className="mt-8 pt-6 border-t border-gray-100 dark:border-slate-800 flex justify-end">
                        <button
                            onClick={handleSave}
                            disabled={isLoading}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-medium text-white transition-all ${isLoading
                                ? 'bg-blue-400 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-500/25 active:scale-[0.98]'
                                }`}
                        >
                            {isLoading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-4 h-4" />
                                    Save Changes
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
