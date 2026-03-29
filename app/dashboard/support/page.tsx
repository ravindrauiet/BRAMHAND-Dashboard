'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Trash2, MessageSquare, CheckCircle, Clock, XCircle,
    Search, StickyNote, ChevronDown, RefreshCw, User, Mail, Phone, Star
} from 'lucide-react';

type SupportMsg = {
    id: number;
    type: 'contact' | 'feedback';
    name: string | null;
    email_or_mobile: string | null;
    subject: string | null;
    message: string;
    feedback_type: string | null;
    rating: number | null;
    status: string;
    admin_notes: string | null;
    created_at: string;
    user_name: string | null;
    user_email: string | null;
    user_mobile: string | null;
};

const STATUS_OPTIONS = ['pending', 'in_review', 'resolved', 'closed'];

const STATUS_CONFIG: Record<string, { label: string; icon: any; bg: string; text: string }> = {
    pending:   { label: 'Pending',   icon: Clock,        bg: 'bg-yellow-100 dark:bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-400' },
    in_review: { label: 'In Review', icon: Search,       bg: 'bg-blue-100 dark:bg-blue-500/10',    text: 'text-blue-700 dark:text-blue-400' },
    resolved:  { label: 'Resolved',  icon: CheckCircle,  bg: 'bg-green-100 dark:bg-green-500/10',  text: 'text-green-700 dark:text-green-400' },
    closed:    { label: 'Closed',    icon: XCircle,      bg: 'bg-slate-100 dark:bg-slate-700',     text: 'text-slate-600 dark:text-slate-400' },
};

export default function SupportPage() {
    const [messages, setMessages] = useState<SupportMsg[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [search, setSearch] = useState('');
    const [expandedId, setExpandedId] = useState<number | null>(null);
    const [notes, setNotes] = useState<Record<number, string>>({});
    const [savingId, setSavingId] = useState<number | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);

    const loadMessages = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const url = filterType ? `/api/support-proxy?type=${filterType}` : '/api/support-proxy';
            const res = await fetch(url);
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
            } else {
                setError(data.message || 'Failed to load messages');
            }
        } catch (err: any) {
            setError('Failed to load support messages. Please try again.');
        } finally {
            setLoading(false);
        }
    }, [filterType]);

    useEffect(() => { loadMessages(); }, [loadMessages]);

    const handleStatusChange = async (id: number, status: string) => {
        setSavingId(id);
        const msg = messages.find(m => m.id === id);
        try {
            const res = await fetch(`/api/support-proxy?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, admin_notes: notes[id] ?? msg?.admin_notes ?? '' }),
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
            }
        } finally {
            setSavingId(null);
        }
    };

    const handleSaveNotes = async (id: number) => {
        setSavingId(id);
        const msg = messages.find(m => m.id === id);
        try {
            const res = await fetch(`/api/support-proxy?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: msg?.status || 'pending', admin_notes: notes[id] ?? '' }),
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => prev.map(m => m.id === id ? { ...m, admin_notes: notes[id] } : m));
                setExpandedId(null);
            }
        } finally {
            setSavingId(null);
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm('Delete this message permanently?')) return;
        setDeletingId(id);
        try {
            await fetch(`/api/support-proxy?id=${id}`, { method: 'DELETE' });
            setMessages(prev => prev.filter(m => m.id !== id));
        } finally {
            setDeletingId(null);
        }
    };

    const filtered = messages.filter(msg => {
        if (filterStatus && msg.status !== filterStatus) return false;
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            msg.message.toLowerCase().includes(q) ||
            (msg.subject || '').toLowerCase().includes(q) ||
            (msg.user_name || msg.name || '').toLowerCase().includes(q) ||
            (msg.user_email || msg.email_or_mobile || '').toLowerCase().includes(q)
        );
    });

    const counts = {
        all: messages.length,
        pending: messages.filter(m => m.status === 'pending').length,
        in_review: messages.filter(m => m.status === 'in_review').length,
        resolved: messages.filter(m => m.status === 'resolved').length,
    };

    const getUserName = (msg: SupportMsg) => msg.user_name || msg.name || 'Anonymous';
    const getUserContact = (msg: SupportMsg) => msg.user_email || msg.user_mobile || msg.email_or_mobile || '';

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                    Support & Feedback
                </h1>
                <button
                    onClick={loadMessages}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-sm font-medium transition-all border-none cursor-pointer disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
                </button>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'Total', count: counts.all, color: 'blue' },
                    { label: 'Pending', count: counts.pending, color: 'yellow' },
                    { label: 'In Review', count: counts.in_review, color: 'indigo' },
                    { label: 'Resolved', count: counts.resolved, color: 'green' },
                ].map(({ label, count, color }) => (
                    <div key={label} className="glass-card p-4">
                        <div className={`text-2xl font-bold text-${color}-600 dark:text-${color}-400`}>{count}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{label}</div>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="glass-card p-4 flex flex-wrap gap-3 items-center">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by name, email, message..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Type filter */}
                <div className="flex gap-1">
                    {[['', 'All'], ['contact', 'Contact'], ['feedback', 'Feedback']].map(([val, label]) => (
                        <button key={val} onClick={() => setFilterType(val)}
                            className={`px-3 py-2 rounded-xl text-sm font-medium transition-all border-none cursor-pointer ${filterType === val ? 'bg-blue-600 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Status filter */}
                <select
                    value={filterStatus}
                    onChange={e => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer"
                >
                    <option value="">All Statuses</option>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
            </div>

            {/* Error */}
            {error && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-xl text-red-600 dark:text-red-400 text-sm">
                    ⚠️ {error}
                </div>
            )}

            {/* Table */}
            <div className="glass-card overflow-hidden">
                <div className="p-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
                    <h2 className="font-semibold text-slate-800 dark:text-white">Messages</h2>
                    <span className="text-sm px-3 py-1 bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full font-medium">
                        {filtered.length} result{filtered.length !== 1 ? 's' : ''}
                    </span>
                </div>

                {loading ? (
                    <div className="p-12 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-3" />
                        <p className="text-slate-500">Loading messages...</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-12 text-center flex flex-col items-center">
                        <MessageSquare className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" />
                        <p className="text-slate-500">No messages found.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-100 dark:divide-slate-800/50">
                        {filtered.map(msg => {
                            const statusCfg = STATUS_CONFIG[msg.status] || STATUS_CONFIG.pending;
                            const StatusIcon = statusCfg.icon;
                            const isExpanded = expandedId === msg.id;

                            return (
                                <div key={msg.id} className={`transition-colors ${deletingId === msg.id ? 'opacity-40' : ''}`}>
                                    {/* Main row */}
                                    <div className="p-5 flex gap-4 items-start">
                                        {/* Type badge */}
                                        <div className="shrink-0 pt-0.5">
                                            <span className={`inline-flex px-2.5 py-1 text-xs font-bold rounded-lg ${
                                                msg.type === 'feedback'
                                                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400'
                                                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400'
                                            }`}>
                                                {msg.type === 'feedback' ? 'FEEDBACK' : 'CONTACT'}
                                            </span>
                                            {msg.rating && (
                                                <div className="flex items-center gap-0.5 mt-2 justify-center">
                                                    {[...Array(5)].map((_, i) => (
                                                        <Star key={i} className={`w-3 h-3 ${i < msg.rating! ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} />
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {/* Main content */}
                                        <div className="flex-1 min-w-0">
                                            {/* User info */}
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
                                                <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800 dark:text-white">
                                                    <User className="w-3.5 h-3.5 text-slate-400" />
                                                    {getUserName(msg)}
                                                </div>
                                                {getUserContact(msg) && (
                                                    <div className="flex items-center gap-1 text-xs text-slate-500">
                                                        {(msg.user_email || msg.email_or_mobile)?.includes('@')
                                                            ? <Mail className="w-3 h-3" />
                                                            : <Phone className="w-3 h-3" />
                                                        }
                                                        {getUserContact(msg)}
                                                    </div>
                                                )}
                                                <span className="text-xs text-slate-400">
                                                    {new Date(msg.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                                                </span>
                                            </div>

                                            {/* Subject */}
                                            {msg.subject && (
                                                <div className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-1">{msg.subject}</div>
                                            )}
                                            {msg.feedback_type && (
                                                <div className="text-xs text-slate-500 mb-1">Category: <span className="font-medium">{msg.feedback_type}</span></div>
                                            )}

                                            {/* Message */}
                                            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-3">
                                                {msg.message}
                                            </p>

                                            {/* Admin notes preview */}
                                            {msg.admin_notes && (
                                                <div className="mt-2 flex items-start gap-1.5 text-xs text-blue-600 dark:text-blue-400">
                                                    <StickyNote className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                                    <span className="line-clamp-1">{msg.admin_notes}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="shrink-0 flex flex-col gap-2 items-end">
                                            {/* Status dropdown */}
                                            <select
                                                value={msg.status || 'pending'}
                                                onChange={e => handleStatusChange(msg.id, e.target.value)}
                                                disabled={savingId === msg.id}
                                                className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg border-none cursor-pointer outline-none ${statusCfg.bg} ${statusCfg.text}`}
                                            >
                                                {STATUS_OPTIONS.map(s => (
                                                    <option key={s} value={s} className="bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200">
                                                        {s.replace('_', ' ')}
                                                    </option>
                                                ))}
                                            </select>

                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => {
                                                        setExpandedId(isExpanded ? null : msg.id);
                                                        if (!isExpanded) setNotes(prev => ({ ...prev, [msg.id]: msg.admin_notes || '' }));
                                                    }}
                                                    title="Add / Edit Notes"
                                                    className={`p-1.5 rounded-lg transition-colors border-none cursor-pointer ${isExpanded ? 'bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400' : 'text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10'}`}
                                                >
                                                    <StickyNote className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(msg.id)}
                                                    disabled={deletingId === msg.id}
                                                    title="Delete"
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors border-none cursor-pointer disabled:opacity-50"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expandable notes editor */}
                                    {isExpanded && (
                                        <div className="px-5 pb-5">
                                            <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
                                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">
                                                    Admin Notes (visible to user in app)
                                                </label>
                                                <textarea
                                                    rows={4}
                                                    placeholder="Write your response or internal notes here..."
                                                    value={notes[msg.id] ?? ''}
                                                    onChange={e => setNotes(prev => ({ ...prev, [msg.id]: e.target.value }))}
                                                    className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-700 dark:text-slate-300 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <div className="flex items-center justify-between mt-3">
                                                    <p className="text-xs text-slate-400">This note will be shown as "Admin Response" inside the user's app.</p>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => setExpandedId(null)}
                                                            className="px-3 py-1.5 text-xs rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-none cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600">
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={() => handleSaveNotes(msg.id)}
                                                            disabled={savingId === msg.id}
                                                            className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white border-none cursor-pointer transition-colors disabled:opacity-50"
                                                        >
                                                            {savingId === msg.id ? 'Saving...' : 'Save Notes'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
