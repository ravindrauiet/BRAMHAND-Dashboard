'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, PlaySquare, Share2, MoreVertical, Trash2, CheckCircle2, Search, X, Clock, Calendar } from 'lucide-react';
import { removeFromHistory } from './actions';

interface HistoryItem {
    id: number;
    createdAt: string;
    lastPosition: number;
    video: {
        id: number;
        title: string;
        thumbnailUrl: string;
        duration: number;
        viewsCount: number;
        creator: { fullName: string };
    };
}

interface HistoryListProps {
    initialHistory: HistoryItem[];
}

const GROUP_ORDER = ['Today', 'Yesterday', 'This Week', 'This Month', 'Earlier'] as const;
type Group = typeof GROUP_ORDER[number];

function getGroup(dateStr: string): Group {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return 'This Week';
    if (diffDays <= 30) return 'This Month';
    return 'Earlier';
}

export default function HistoryList({ initialHistory }: HistoryListProps) {
    const [history, setHistory] = useState(initialHistory);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
    const [searchQuery, setSearchQuery] = useState(''); // Fix #18

    const showToast = (msg: string, ok: boolean) => {
        setToast({ msg, ok });
        setTimeout(() => setToast(null), 3000);
    };

    // Fix #18: filter by search query
    const filtered = useMemo(() => {
        const q = searchQuery.toLowerCase().trim();
        if (!q) return history;
        return history.filter(
            (item) =>
                item.video.title.toLowerCase().includes(q) ||
                item.video.creator.fullName.toLowerCase().includes(q)
        );
    }, [history, searchQuery]);

    // Fix #18: group by date
    const grouped = useMemo(() => {
        const map: Record<Group, HistoryItem[]> = {
            Today: [],
            Yesterday: [],
            'This Week': [],
            'This Month': [],
            Earlier: [],
        };
        filtered.forEach((item) => {
            map[getGroup(item.createdAt)].push(item);
        });
        return map;
    }, [filtered]);

    const handleShare = async (video: HistoryItem['video']) => {
        const url = `${window.location.origin}/watch/${video.id}`;
        try {
            if (navigator.share) {
                await navigator.share({ title: video.title, text: `Watch: ${video.title}`, url });
            } else {
                await navigator.clipboard.writeText(url);
                showToast('Link copied!', true);
            }
        } catch {
            // user cancelled share
        }
    };

    // Fix #1: properly check result.success (was checking object truthiness before)
    const handleRemove = async (viewId: number) => {
        const result = await removeFromHistory(viewId);
        if (result?.success) {
            setHistory((prev) => prev.filter((item) => item.id !== viewId));
            showToast('Removed from history', true);
        } else {
            showToast('Failed to remove', false);
        }
        setActiveMenu(null);
    };

    return (
        <div className="space-y-6 relative">

            {/* Fix #18: Search bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search history by title or creator…"
                    className="w-full pl-11 pr-10 py-3.5 bg-white/70 dark:bg-white/5 backdrop-blur-xl border border-slate-200/60 dark:border-white/10 rounded-2xl focus:ring-2 focus:ring-indigo-500/50 outline-none text-slate-900 dark:text-white font-medium text-sm placeholder:text-slate-400 transition-all"
                />
                {searchQuery && (
                    <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </div>

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
                    <div className={`backdrop-blur-xl px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 border text-sm font-black uppercase tracking-widest ${toast.ok
                        ? 'bg-slate-900/90 dark:bg-white/90 text-white dark:text-black border-white/10 dark:border-black/10'
                        : 'bg-rose-900/90 text-white border-rose-500/20'
                        }`}>
                        <CheckCircle2 className={`w-4 h-4 flex-shrink-0 ${toast.ok ? 'text-emerald-400' : 'text-rose-400'}`} />
                        {toast.msg}
                    </div>
                </div>
            )}

            {/* Fix #18: no results */}
            {filtered.length === 0 && (
                <div className="py-20 bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-[40px] text-center border border-dashed border-slate-200 dark:border-white/10">
                    {searchQuery ? (
                        <>
                            <Search className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                            <p className="font-bold text-slate-500 uppercase tracking-tight">No results for &ldquo;{searchQuery}&rdquo;</p>
                        </>
                    ) : (
                        <>
                            <PlaySquare className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                            <p className="font-bold text-slate-500 uppercase tracking-tight">Your watch history is empty.</p>
                        </>
                    )}
                </div>
            )}

            {/* Fix #18: grouped sections */}
            {GROUP_ORDER.map((group) => {
                const items = grouped[group];
                if (!items.length) return null;
                return (
                    <section key={group}>
                        {/* Group header */}
                        <div className="flex items-center gap-3 mb-4 px-1">
                            <div className="flex items-center gap-2">
                                {group === 'Today' || group === 'Yesterday'
                                    ? <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                    : <Calendar className="w-3.5 h-3.5 text-slate-400" />}
                                <span className={`text-xs font-black uppercase tracking-[0.18em] ${group === 'Today' ? 'text-indigo-500' : group === 'Yesterday' ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}`}>
                                    {group}
                                </span>
                            </div>
                            <div className="flex-1 h-px bg-slate-200 dark:bg-white/5" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{items.length}</span>
                        </div>

                        <div className="space-y-3">
                            {items.map((view) => (
                                <div
                                    key={view.id}
                                    className="bg-white/70 dark:bg-white/5 backdrop-blur-xl flex flex-col md:flex-row gap-4 p-4 rounded-[24px] hover:bg-white dark:hover:bg-white/10 transition-all duration-500 border border-slate-200/60 dark:border-white/10 hover:border-indigo-500/30 group shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 relative"
                                >
                                    {/* Thumbnail */}
                                    <Link href={`/watch/${view.video.id}`} className="relative w-full md:w-52 aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                                        <Image
                                            src={view.video.thumbnailUrl || '/placeholder-thumb.jpg'}
                                            alt={view.video.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                        {view.video.duration > 0 && (
                                            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/40 backdrop-blur-sm">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                                                    style={{ width: `${Math.min((view.lastPosition / view.video.duration) * 100, 100)}%` }}
                                                />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 scale-90 group-hover:scale-100 transition-transform duration-300">
                                                <PlaySquare className="w-5 h-5 text-white fill-white" />
                                            </div>
                                        </div>
                                    </Link>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                                        <div>
                                            <div className="flex items-start justify-between gap-3 mb-1.5">
                                                <Link href={`/watch/${view.video.id}`}>
                                                    <h3 className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight text-sm line-clamp-2 cursor-pointer leading-tight">
                                                        {view.video.title}
                                                    </h3>
                                                </Link>
                                                <span className="text-[10px] font-black px-2 py-1 bg-slate-100 dark:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap flex-shrink-0">
                                                    {new Date(view.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                </span>
                                            </div>
                                            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                                                <span className="flex items-center gap-1 text-emerald-500"><Eye className="w-3.5 h-3.5" />{view.video.viewsCount.toLocaleString()}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700" />
                                                <span>{view.video.creator.fullName}</span>
                                            </p>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <Link
                                                href={`/watch/${view.video.id}`}
                                                className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
                                            >
                                                <PlaySquare className="w-3.5 h-3.5" /> Resume
                                            </Link>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleShare(view.video)}
                                                    className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 transition-all bg-slate-100 dark:bg-white/5 rounded-xl border border-transparent hover:border-indigo-500/20"
                                                    title="Share"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                </button>

                                                <div className="relative">
                                                    <button
                                                        onClick={() => setActiveMenu(activeMenu === view.id ? null : view.id)}
                                                        className={`p-2.5 transition-all bg-slate-100 dark:bg-white/5 rounded-xl border border-transparent ${activeMenu === view.id ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/20 border-indigo-500/30' : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10'}`}
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </button>

                                                    {activeMenu === view.id && (
                                                        <>
                                                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                                                            <div className="absolute bottom-full right-0 mb-2 w-52 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-2 z-20 animate-in fade-in zoom-in-95 duration-150">
                                                                <button
                                                                    onClick={() => handleRemove(view.id)}
                                                                    className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all text-left"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                    <span className="text-[10px] font-black uppercase tracking-widest">Remove from History</span>
                                                                </button>
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })}
        </div>
    );
}
