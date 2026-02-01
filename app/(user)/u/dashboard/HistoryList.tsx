'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, PlaySquare, Share2, MoreVertical, Trash2, CheckCircle2 } from 'lucide-react';
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
        creator: {
            fullName: string;
        }
    }
}

interface HistoryListProps {
    initialHistory: HistoryItem[];
}

export default function HistoryList({ initialHistory }: HistoryListProps) {
    const [history, setHistory] = useState(initialHistory);
    const [activeMenu, setActiveMenu] = useState<number | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (message: string) => {
        setToast(message);
        setTimeout(() => setToast(null), 3000);
    };

    const handleShare = async (video: any) => {
        const url = `${window.location.origin}/watch/${video.id}`;
        try {
            if (navigator.share) {
                await navigator.share({
                    title: video.title,
                    text: `Check out this video: ${video.title}`,
                    url: url
                });
            } else {
                await navigator.clipboard.writeText(url);
                showToast('Link copied to clipboard! 📋');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

    const handleRemove = async (viewId: number) => {
        const success = await removeFromHistory(viewId);
        if (success) {
            setHistory(history.filter(item => item.id !== viewId));
            showToast('Removed from history 🗑️');
        } else {
            showToast('Failed to remove ❌');
        }
        setActiveMenu(null);
    };

    return (
        <div className="space-y-4 relative">
            {/* Custom Toast */}
            {toast && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-slate-900/90 dark:bg-white/90 backdrop-blur-xl text-white dark:text-black px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-2 border border-white/10 dark:border-black/10">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        <span className="text-xs font-black uppercase tracking-widest">{toast}</span>
                    </div>
                </div>
            )}

            {history.map((view) => (
                <div
                    key={view.id}
                    className="bg-white/70 dark:bg-white/5 backdrop-blur-xl flex flex-col md:flex-row gap-6 p-5 rounded-[28px] hover:bg-white dark:hover:bg-white/10 transition-all duration-500 border border-slate-200/60 dark:border-white/10 hover:border-indigo-500/30 group shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 relative"
                >
                    {/* Thumbnail */}
                    <Link href={`/watch/${view.video.id}`} className="relative w-full md:w-64 aspect-video rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0 cursor-pointer">
                        <Image
                            src={view.video.thumbnailUrl || '/placeholder-thumb.jpg'}
                            alt={view.video.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                        {/* Progress Indicator */}
                        {view.video.duration > 0 && (
                            <div className="absolute bottom-0 left-0 w-full h-1.5 bg-black/40 backdrop-blur-sm">
                                <div
                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-1000"
                                    style={{ width: `${Math.min((view.lastPosition / view.video.duration) * 100, 100)}%` }}
                                />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 scale-75 group-hover:scale-100 transition-transform duration-500">
                                <PlaySquare className="w-6 h-6 text-white fill-white" />
                            </div>
                        </div>
                    </Link>

                    {/* Content Info */}
                    <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                            <div className="flex items-start justify-between gap-4 mb-2">
                                <Link href={`/watch/${view.video.id}`}>
                                    <h3 className="font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight text-base line-clamp-1 cursor-pointer">
                                        {view.video.title}
                                    </h3>
                                </Link>
                                <span className="text-[10px] font-black px-2 py-1 bg-slate-100 dark:bg-white/10 rounded-lg text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap">
                                    {new Date(view.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                                </span>
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 flex items-center gap-3 text-[11px] font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1.5 text-emerald-500"><Eye className="w-4 h-4" /> {view.video.viewsCount.toLocaleString()} Views</span>
                                <span className="w-1 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                                <span className="text-slate-400">{view.video.creator.fullName}</span>
                            </p>
                        </div>

                        <div className="flex items-center justify-between mt-6">
                            <Link
                                href={`/watch/${view.video.id}`}
                                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all uppercase tracking-widest shadow-lg shadow-indigo-600/20 active:scale-95 flex items-center gap-2"
                            >
                                <PlaySquare className="w-4 h-4" />
                                Resume Play
                            </Link>

                            <div className="flex gap-2 relative">
                                <button
                                    onClick={() => handleShare(view.video)}
                                    className="p-2.5 text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 dark:hover:text-white transition-all bg-slate-100 dark:bg-white/5 rounded-xl border border-transparent hover:border-indigo-500/20"
                                    title="Share"
                                >
                                    <Share2 className="w-4 h-4" />
                                </button>

                                <div className="relative">
                                    <button
                                        onClick={() => setActiveMenu(activeMenu === view.id ? null : view.id)}
                                        className={`p-2.5 transition-all bg-slate-100 dark:bg-white/5 rounded-xl border border-transparent ${activeMenu === view.id ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-500/20 border-indigo-500/30' : 'text-slate-400 hover:text-indigo-500 hover:bg-indigo-500/10 dark:hover:text-white'}`}
                                        title="More"
                                    >
                                        <MoreVertical className="w-4 h-4" />
                                    </button>

                                    {activeMenu === view.id && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setActiveMenu(null)} />
                                            <div className="absolute bottom-full right-0 mb-2 w-48 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 p-2 z-20 animate-in fade-in zoom-in-95 duration-200">
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

            {history.length === 0 && (
                <div className="py-20 bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-[40px] text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-white/10">
                    <PlaySquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
                    <p className="font-medium">Your watch history is empty.</p>
                </div>
            )}
        </div>
    );
}
