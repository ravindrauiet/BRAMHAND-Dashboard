'use client';

import { useState } from 'react';
import {
    Send,
    Bell,
    Smartphone,
    Clock,
    CheckCircle2,
    AlertCircle,
    History,
    Megaphone
} from 'lucide-react';
import { sendNotification } from './actions';

interface NotificationComposerProps {
    initialHistory: any[];
}

export function NotificationComposer({ initialHistory }: NotificationComposerProps) {
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSend = async () => {
        if (!title || !message) return;

        setIsSending(true);
        setStatus('idle');

        // Create FormData to match server action signature if needed, or just call a wrapper
        // Since actions.ts expects FormData, let's stick to that or change actions.ts. 
        // For simplicity and compatibility with existing server action pattern:
        const formData = new FormData();
        formData.append('title', title);
        formData.append('message', message);

        const result = await sendNotification(formData);

        setIsSending(false);
        if (result && result.success) {
            setStatus('success');
            setTitle('');
            setMessage('');
            setTimeout(() => setStatus('idle'), 3000);
        } else {
            setStatus('error');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Input Form Section */}
            <div className="lg:col-span-7 space-y-6">
                <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
                            <Megaphone className="w-5 h-5" />
                        </div>
                        Compose Broadcast
                    </h2>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Notification Title</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. New Features Available!"
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 transition-all font-medium"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Message Content</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                rows={4}
                                placeholder="Keep it short and engaging..."
                                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white placeholder-slate-400 transition-all resize-none"
                            />
                            <div className="flex justify-end">
                                <span className={`text-xs ${message.length > 100 ? 'text-amber-500' : 'text-slate-400'}`}>
                                    {message.length} characters
                                </span>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                onClick={handleSend}
                                disabled={isSending || !title || !message}
                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-all ${isSending
                                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 active:scale-[0.99]'
                                    }`}
                            >
                                {isSending ? (
                                    <>
                                        <div className="w-5 h-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5" />
                                        Send Broadcast
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Status Messages */}
                        {status === 'success' && (
                            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 p-3 rounded-lg animate-in fade-in slide-in-from-top-2">
                                <CheckCircle2 className="w-4 h-4" />
                                Broadcast sent successfully! (Check history below to verify update)
                            </div>
                        )}
                        {status === 'error' && (
                            <div className="flex items-center gap-2 text-sm text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10 p-3 rounded-lg animate-in fade-in slide-in-from-top-2">
                                <AlertCircle className="w-4 h-4" />
                                Failed to send broadcast. Please try again.
                            </div>
                        )}
                    </div>
                </div>

                {/* History Section */}
                <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl p-8 shadow-sm">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-6 flex items-center gap-3">
                        <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-600 dark:text-amber-400">
                            <History className="w-5 h-5" />
                        </div>
                        Recent History
                    </h2>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {initialHistory.map((item, idx) => (
                            <div key={idx} className="group p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600 transition-colors">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</h3>
                                    <span className="text-xs font-medium text-slate-400 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-100 dark:border-slate-700">
                                        {new Date(item.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.message}</p>
                            </div>
                        ))}
                        {initialHistory.length === 0 && (
                            <div className="text-center py-8 text-slate-400">
                                <History className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p>No broadcast history found</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Section */}
            <div className="lg:col-span-5">
                <div className="sticky top-8">
                    <h3 className="text-lg font-semibold text-slate-500 dark:text-slate-400 mb-4 text-center">Live Preview</h3>
                    <div className="relative mx-auto rounded-[3rem] border-8 border-slate-900 bg-slate-900 overflow-hidden shadow-2xl max-w-[320px]">
                        {/* Notch */}
                        <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 z-10 flex justify-center">
                            <div className="w-32 h-4 bg-black rounded-b-xl"></div>
                        </div>

                        {/* Screen Content */}
                        <div className="h-[640px] w-full bg-slate-50 dark:bg-slate-950 relative pt-12">
                            {/* Fake Status Bar */}
                            <div className="absolute top-2 right-6 flex gap-1 items-center">
                                <div className="w-4 h-3 bg-white/20 rounded-sm"></div>
                                <div className="w-3 h-3 bg-white/20 rounded-full"></div>
                            </div>

                            {/* Notification Banner */}
                            <div className="mx-4 mt-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur shadow-lg rounded-2xl p-4 animate-in slide-in-from-top-10 duration-500">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                                        <Bell className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">Admin Dashboard</p>
                                            <span className="text-[10px] text-slate-400">Now</span>
                                        </div>
                                        <p className="font-medium text-xs text-slate-900 dark:text-slate-200 mt-0.5 truncate">{title || 'Notification Title'}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                            {message || 'This is how your notification message will appear on a users device.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
