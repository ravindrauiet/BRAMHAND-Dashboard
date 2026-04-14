'use client';

import { useState } from 'react';
import {
    Send, Bell, Mail, Users, User, CheckCircle2, AlertCircle,
    BarChart3, TrendingUp, Eye, Smartphone, Clock, Megaphone,
} from 'lucide-react';
import { sendPushNotification, sendEmailNotification } from './actions';

interface User { id: number; full_name: string; email: string; mobile_number?: string; }
interface Summary {
    total_sent: number; total_read: number; unique_recipients: number;
    sent_today: number; fcm_users: number; read_rate: string;
}
interface HistoryItem {
    title: string; type: string; sent_at: string;
    recipients: number; read_count: number;
}
interface AutoStat { type: string; total: number; read_count: number; }

interface Props {
    analytics: { summary: Summary | null; history: HistoryItem[]; auto_stats: AutoStat[] };
    users: User[];
}

type Tab = 'send' | 'analytics';
type SendMode = 'push' | 'email';
type Target = 'all' | 'specific';

export function NotificationCenter({ analytics, users }: Props) {
    const [tab, setTab] = useState<Tab>('send');
    const [mode, setMode] = useState<SendMode>('push');
    const [target, setTarget] = useState<Target>('all');
    const [userId, setUserId] = useState('');
    const [userSearch, setUserSearch] = useState('');

    // Push fields
    const [pushTitle, setPushTitle] = useState('');
    const [pushBody, setPushBody] = useState('');

    // Email fields
    const [emailSubject, setEmailSubject] = useState('');
    const [emailBody, setEmailBody] = useState('');

    const [isSending, setIsSending] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const filteredUsers = users.filter(u => {
        if (!userSearch) return true;
        const q = userSearch.toLowerCase();
        return u.full_name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q);
    }).slice(0, 50);

    const handleSend = async () => {
        setIsSending(true);
        setStatus(null);

        const selectedUserId = target === 'specific' && userId ? Number(userId) : undefined;

        let result: any;
        if (mode === 'push') {
            if (!pushTitle || !pushBody) { setIsSending(false); return; }
            result = await sendPushNotification({
                ...(selectedUserId ? { user_id: selectedUserId } : {}),
                title: pushTitle,
                body: pushBody,
            });
        } else {
            if (!emailSubject || !emailBody) { setIsSending(false); return; }
            result = await sendEmailNotification({
                ...(selectedUserId ? { user_id: selectedUserId } : {}),
                subject: emailSubject,
                message: emailBody,
            });
        }

        setIsSending(false);
        if (result.success) {
            setStatus({ type: 'success', msg: result.message || 'Sent successfully!' });
            setPushTitle(''); setPushBody(''); setEmailSubject(''); setEmailBody('');
            setTimeout(() => setStatus(null), 4000);
        } else {
            setStatus({ type: 'error', msg: result.error || 'Failed to send' });
        }
    };

    const s = analytics.summary;
    const canSend = mode === 'push'
        ? pushTitle.trim() && pushBody.trim() && (target === 'all' || userId)
        : emailSubject.trim() && emailBody.trim() && (target === 'all' || userId);

    const autoLabels: Record<string, string> = {
        comment: 'New Comment', follow: 'New Follower', new_episode: 'New Episode', GENERAL: 'General',
    };

    return (
        <div>
            {/* Tab Bar */}
            <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-fit mb-8">
                {(['send', 'analytics'] as Tab[]).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t
                            ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                        }`}>
                        {t === 'send' ? '✉ Compose & Send' : '📊 Analytics'}
                    </button>
                ))}
            </div>

            {/* ── SEND TAB ── */}
            {tab === 'send' && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-6">

                        {/* Mode Toggle */}
                        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Channel</p>
                            <div className="flex gap-3">
                                <button onClick={() => setMode('push')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all ${mode === 'push'
                                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                                    }`}>
                                    <Smartphone className="w-4 h-4" /> Push Notification
                                </button>
                                <button onClick={() => setMode('email')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border-2 font-medium text-sm transition-all ${mode === 'email'
                                        ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                                    }`}>
                                    <Mail className="w-4 h-4" /> Email
                                </button>
                            </div>
                        </div>

                        {/* Target */}
                        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Target Audience</p>
                            <div className="flex gap-3 mb-4">
                                <button onClick={() => setTarget('all')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${target === 'all'
                                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                                    }`}>
                                    <Users className="w-4 h-4" /> All Users
                                </button>
                                <button onClick={() => setTarget('specific')}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 font-medium text-sm transition-all ${target === 'specific'
                                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
                                        : 'border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-300'
                                    }`}>
                                    <User className="w-4 h-4" /> Specific User
                                </button>
                            </div>

                            {target === 'specific' && (
                                <div className="space-y-2">
                                    <input
                                        type="text"
                                        placeholder="Search by name or email..."
                                        value={userSearch}
                                        onChange={e => { setUserSearch(e.target.value); setUserId(''); }}
                                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                                    />
                                    {userSearch && (
                                        <div className="max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-700">
                                            {filteredUsers.length === 0 && (
                                                <p className="text-sm text-slate-400 p-3 text-center">No users found</p>
                                            )}
                                            {filteredUsers.map(u => (
                                                <button key={u.id} onClick={() => { setUserId(String(u.id)); setUserSearch(u.full_name || u.email); }}
                                                    className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${userId === String(u.id) ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}>
                                                    <p className="font-medium text-slate-900 dark:text-white">{u.full_name}</p>
                                                    <p className="text-slate-400 text-xs">{u.email || u.mobile_number}</p>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    {userId && (
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                                            <CheckCircle2 className="w-3 h-3" /> User selected (ID: {userId})
                                        </p>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Compose */}
                        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-gray-200 dark:border-slate-800 rounded-2xl p-6 space-y-4">
                            <h2 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                <Megaphone className="w-5 h-5 text-blue-500" />
                                {mode === 'push' ? 'Push Notification' : 'Email Message'}
                            </h2>

                            {mode === 'push' ? (
                                <>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Title</label>
                                        <input value={pushTitle} onChange={e => setPushTitle(e.target.value)}
                                            placeholder="e.g. New content available!"
                                            className="mt-1 w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Message</label>
                                        <textarea value={pushBody} onChange={e => setPushBody(e.target.value)}
                                            rows={3} placeholder="Keep it short and engaging..."
                                            className="mt-1 w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white resize-none" />
                                        <p className={`text-right text-xs mt-1 ${pushBody.length > 100 ? 'text-amber-500' : 'text-slate-400'}`}>
                                            {pushBody.length} chars
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</label>
                                        <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                                            placeholder="e.g. Exciting update from Tirhuta"
                                            className="mt-1 w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Body</label>
                                        <textarea value={emailBody} onChange={e => setEmailBody(e.target.value)}
                                            rows={6} placeholder="Write your message here..."
                                            className="mt-1 w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white resize-none" />
                                    </div>
                                </>
                            )}

                            <button onClick={handleSend} disabled={isSending || !canSend}
                                className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl font-medium text-sm transition-all ${isSending || !canSend
                                    ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                    : mode === 'push'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25'
                                        : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25'
                                }`}>
                                {isSending ? (
                                    <><div className="w-4 h-4 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" /> Sending...</>
                                ) : (
                                    <><Send className="w-4 h-4" /> Send {target === 'all' ? 'to All Users' : 'to Selected User'}</>
                                )}
                            </button>

                            {status && (
                                <div className={`flex items-center gap-2 text-sm p-3 rounded-lg ${status.type === 'success'
                                    ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                                    : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10'
                                }`}>
                                    {status.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    {status.msg}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Live Preview */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-8">
                            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-4 text-center">Live Preview</p>
                            <div className="relative mx-auto rounded-[3rem] border-8 border-slate-900 bg-slate-900 overflow-hidden shadow-2xl max-w-[300px]">
                                <div className="absolute top-0 inset-x-0 h-6 bg-slate-900 z-10 flex justify-center">
                                    <div className="w-28 h-4 bg-black rounded-b-xl" />
                                </div>
                                <div className="h-[580px] w-full bg-slate-100 dark:bg-slate-950 pt-10">
                                    {mode === 'push' ? (
                                        <div className="mx-3 mt-4 bg-white/95 dark:bg-slate-800 shadow-xl rounded-2xl p-4">
                                            <div className="flex gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center shrink-0">
                                                    <Bell className="w-5 h-5 text-white" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between">
                                                        <p className="font-semibold text-xs text-slate-900 dark:text-white">Tirhuta</p>
                                                        <span className="text-[10px] text-slate-400">now</span>
                                                    </div>
                                                    <p className="font-medium text-xs text-slate-900 dark:text-white mt-0.5 truncate">
                                                        {pushTitle || 'Notification Title'}
                                                    </p>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                                                        {pushBody || 'Your message will appear here on the user\'s device.'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="mx-3 mt-4 bg-white dark:bg-slate-800 shadow-xl rounded-2xl p-4 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center shrink-0">
                                                    <Mail className="w-4 h-4 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-semibold text-slate-900 dark:text-white">Tirhuta</p>
                                                    <p className="text-[10px] text-slate-400">no-reply@tirhuta.com</p>
                                                </div>
                                            </div>
                                            <p className="text-xs font-bold text-slate-900 dark:text-white">
                                                {emailSubject || 'Email Subject'}
                                            </p>
                                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-4">
                                                {emailBody || 'Your email message will appear here.'}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── ANALYTICS TAB ── */}
            {tab === 'analytics' && (
                <div className="space-y-8">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                            { label: 'Total Sent', value: s?.total_sent ?? 0, icon: Send, color: 'blue' },
                            { label: 'Total Read', value: s?.total_read ?? 0, icon: Eye, color: 'emerald' },
                            { label: 'Read Rate', value: `${s?.read_rate ?? '0.0'}%`, icon: TrendingUp, color: 'amber' },
                            { label: 'FCM Users', value: s?.fcm_users ?? 0, icon: Smartphone, color: 'indigo' },
                            { label: 'Sent Today', value: s?.sent_today ?? 0, icon: Clock, color: 'rose' },
                            { label: 'Unique Recipients', value: s?.unique_recipients ?? 0, icon: Users, color: 'purple' },
                        ].map(({ label, value, icon: Icon, color }) => (
                            <div key={label} className="bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-gray-200 dark:border-slate-800 rounded-2xl p-5">
                                <div className={`w-9 h-9 rounded-xl bg-${color}-50 dark:bg-${color}-900/20 flex items-center justify-center mb-3`}>
                                    <Icon className={`w-5 h-5 text-${color}-500`} />
                                </div>
                                <p className="text-2xl font-bold text-slate-900 dark:text-white">{value.toLocaleString?.() ?? value}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{label}</p>
                            </div>
                        ))}
                    </div>

                    {/* Automated Notifications Stats */}
                    {analytics.auto_stats.length > 0 && (
                        <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
                            <h2 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-blue-500" /> Automated Trigger Stats
                            </h2>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                {analytics.auto_stats.map(stat => {
                                    const rate = stat.total > 0 ? ((stat.read_count / stat.total) * 100).toFixed(1) : '0.0';
                                    return (
                                        <div key={stat.type} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
                                            <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                                {autoLabels[stat.type] || stat.type}
                                            </p>
                                            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.total}</p>
                                            <div className="flex items-center justify-between mt-2">
                                                <span className="text-xs text-slate-500">{stat.read_count} read</span>
                                                <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{rate}% rate</span>
                                            </div>
                                            <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${rate}%` }} />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Broadcast History Table */}
                    <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur border border-gray-200 dark:border-slate-800 rounded-2xl p-6">
                        <h2 className="font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                            <Bell className="w-5 h-5 text-amber-500" /> Broadcast History
                        </h2>
                        {analytics.history.length === 0 ? (
                            <div className="text-center py-12 text-slate-400">
                                <Bell className="w-10 h-10 mx-auto mb-2 opacity-20" />
                                <p>No broadcasts sent yet</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="text-xs text-slate-500 uppercase tracking-wider border-b border-slate-200 dark:border-slate-700">
                                            <th className="text-left py-3 pr-4">Title</th>
                                            <th className="text-left py-3 pr-4">Type</th>
                                            <th className="text-left py-3 pr-4">Sent</th>
                                            <th className="text-right py-3 pr-4">Recipients</th>
                                            <th className="text-right py-3 pr-4">Read</th>
                                            <th className="text-right py-3">Rate</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                        {analytics.history.map((item, i) => {
                                            const rate = item.recipients > 0
                                                ? ((item.read_count / item.recipients) * 100).toFixed(1)
                                                : '0.0';
                                            return (
                                                <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="py-3 pr-4 font-medium text-slate-900 dark:text-white max-w-[200px] truncate">
                                                        {item.title}
                                                    </td>
                                                    <td className="py-3 pr-4">
                                                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${item.type === 'ADMIN'
                                                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                                                            : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                                                        }`}>{item.type}</span>
                                                    </td>
                                                    <td className="py-3 pr-4 text-slate-500 text-xs">
                                                        {new Date(item.sent_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                    </td>
                                                    <td className="py-3 pr-4 text-right text-slate-700 dark:text-slate-300">{item.recipients}</td>
                                                    <td className="py-3 pr-4 text-right text-slate-700 dark:text-slate-300">{item.read_count}</td>
                                                    <td className="py-3 text-right">
                                                        <span className={`font-semibold ${Number(rate) >= 50 ? 'text-emerald-600 dark:text-emerald-400' : Number(rate) >= 20 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                                            {rate}%
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
