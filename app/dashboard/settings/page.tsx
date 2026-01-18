import { SettingsView } from './SettingsView';

export default function SettingsPage() {
    return (
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 transition-colors duration-300">Settings</h1>
                <p className="text-slate-500 dark:text-slate-400">Configure your workspace and manage your account.</p>
            </div>

            <SettingsView />
        </div>
    );
}
