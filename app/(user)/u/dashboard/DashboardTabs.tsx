'use client';

import { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    History, Heart, PlaySquare, Music, Film,
    LayoutDashboard, Plus, Settings, ChevronRight,
    Eye, Users, Bookmark, TrendingUp, Crown, Zap,
    Sparkles, Star, Loader2, CheckCircle2, AlertCircle,
    ArrowRight, X, Upload, Clock, Play, Search,
    BarChart3, Calendar, Globe,
} from 'lucide-react';
import { UserSignOutButton } from '@/components/UserSignOutButton';
import HistoryList from './HistoryList';
import ContentManagement from './ContentManagement';
import SettingsForm from '@/components/user/SettingsForm';
import { becomeCreator } from './actions';

// ─── types ────────────────────────────────────────────────────────────────────

interface TabUser {
    id: number;
    fullName: string;
    email: string;
    profileImage: string | null;
    mobileNumber?: string;
    isCreator: boolean;
    preferences?: any;
    _count: {
        totalLikes: number;
        followers: number;
        totalViews: number;
        playlists: number;
    };
    playlists: Array<{ id: number; name: string; isPublic: boolean }>;
}

interface DashboardTabsProps {
    user: TabUser;
    combinedHistory: any[];
    videos: any[];
    reels: any[];
    categories: any[];
    watchlist: any[];
    trending?: any[];
    greeting: string;
    userRole: string;
    initialTab: string;
}

type TabId = 'overview' | 'content' | 'history' | 'watchlist' | 'playlists' | 'settings';

interface NavItem {
    id: TabId;
    icon: React.ElementType;
    label: string;
    short: string;
}

interface QuickAction {
    href?: string;
    tab?: TabId;
    icon: React.ElementType;
    label: string;
    sub: string;
    gradient: string;
    bg: string;
}

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return n.toLocaleString();
}

// ─── component ───────────────────────────────────────────────────────────────

export default function DashboardTabs({
    user,
    combinedHistory,
    videos,
    reels,
    categories,
    watchlist,
    trending = [],
    greeting,
    userRole,
    initialTab,
}: DashboardTabsProps) {
    const router = useRouter();

    const safeInitial = (
        initialTab === 'content' && !user.isCreator ? 'overview' : initialTab
    ) as TabId;

    const [activeTab, setActiveTab] = useState<TabId>(safeInitial);
    const [isApplyingCreator, setIsApplyingCreator] = useState(false);
    const [creatorResult, setCreatorResult] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);

    const isAdmin = userRole === 'admin';

    // ── derived ──────────────────────────────────────────────────────────────

    const continueWatching = useMemo(() => {
        return combinedHistory
            .filter((item: any) => {
                if (!item.video?.duration || item.video.duration < 60) return false;
                const pct = (item.lastPosition / item.video.duration) * 100;
                return pct > 5 && pct < 92;
            })
            .slice(0, 6);
    }, [combinedHistory]);

    const activityDots = useMemo(() => {
        const set = new Set<string>();
        combinedHistory.forEach((item: any) => {
            set.add(new Date(item.createdAt).toDateString());
        });
        return Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            return {
                day: d.toLocaleDateString('en', { weekday: 'short' }),
                active: set.has(d.toDateString()),
                isToday: i === 6,
            };
        });
    }, [combinedHistory]);

    const streakCount = activityDots.filter(d => d.active).length;

    const topContent = useMemo(() => {
        const all = [...(videos || []), ...(reels || [])];
        const sorted = all
            .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
            .slice(0, 5);
        const maxViews = sorted[0]?.viewsCount || 1;
        return sorted.map(v => ({
            ...v,
            pct: Math.round(((v.viewsCount || 0) / maxViews) * 100),
        }));
    }, [videos, reels]);

    // ── nav ──────────────────────────────────────────────────────────────────

    const navItems: NavItem[] = [
        { id: 'overview', icon: LayoutDashboard, label: 'Overview', short: 'Home' },
        ...(user.isCreator
            ? [{ id: 'content' as TabId, icon: Film, label: 'My Content', short: 'Content' }]
            : []),
        { id: 'history', icon: History, label: 'Watch History', short: 'History' },
        { id: 'watchlist', icon: Bookmark, label: 'Watchlist', short: 'Saved' },
        { id: 'playlists', icon: PlaySquare, label: 'Playlists', short: 'Lists' },
        { id: 'settings', icon: Settings, label: 'Preferences', short: 'Settings' },
    ];

    // ── stat cards ───────────────────────────────────────────────────────────

    const statCards = [
        {
            label: 'Total Likes',
            value: user._count?.totalLikes ?? 0,
            icon: Heart,
            bg: 'bg-pink-500/10',
            color: 'text-pink-500',
            gradient: 'from-pink-500 to-rose-500',
        },
        {
            label: 'Followers',
            value: user._count?.followers ?? 0,
            icon: Users,
            bg: 'bg-amber-500/10',
            color: 'text-amber-500',
            gradient: 'from-amber-500 to-orange-500',
        },
        {
            label: 'Total Views',
            value: user._count?.totalViews ?? 0,
            icon: Eye,
            bg: 'bg-blue-500/10',
            color: 'text-blue-500',
            gradient: 'from-blue-500 to-indigo-500',
        },
        user.isCreator
            ? {
                label: 'Uploads',
                value: (videos?.length ?? 0) + (reels?.length ?? 0),
                icon: Upload,
                bg: 'bg-emerald-500/10',
                color: 'text-emerald-500',
                gradient: 'from-emerald-500 to-teal-500',
              }
            : {
                label: 'Watch Sessions',
                value: combinedHistory.length,
                icon: History,
                bg: 'bg-indigo-500/10',
                color: 'text-indigo-500',
                gradient: 'from-indigo-500 to-purple-500',
              },
    ];

    // ── quick actions ────────────────────────────────────────────────────────

    const creatorActions: QuickAction[] = [
        { href: '/u/upload-video', icon: Film, label: 'Upload Video', sub: 'Share your story', gradient: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
        { href: '/u/upload-reel', icon: PlaySquare, label: 'Post Reel', sub: 'Short-form content', gradient: 'from-pink-500 to-rose-600', bg: 'bg-pink-50 dark:bg-pink-500/10' },
        { tab: 'content', icon: BarChart3, label: 'Analytics', sub: 'Track performance', gradient: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
        { href: '/browse', icon: Search, label: 'Discover', sub: 'Find new content', gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    ];

    const viewerActions: QuickAction[] = [
        { href: '/browse', icon: Search, label: 'Discover', sub: 'Explore content', gradient: 'from-indigo-500 to-blue-600', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
        { tab: 'watchlist', icon: Bookmark, label: 'Watchlist', sub: `${watchlist.length} saved`, gradient: 'from-amber-500 to-orange-600', bg: 'bg-amber-50 dark:bg-amber-500/10' },
        { tab: 'playlists', icon: PlaySquare, label: 'Playlists', sub: `${user.playlists.length} collections`, gradient: 'from-purple-500 to-violet-600', bg: 'bg-purple-50 dark:bg-purple-500/10' },
        { tab: 'settings', icon: Settings, label: 'Preferences', sub: 'Customize app', gradient: 'from-slate-500 to-gray-600', bg: 'bg-slate-50 dark:bg-slate-500/10' },
    ];

    const quickActions = (user.isCreator || isAdmin) ? creatorActions : viewerActions;

    // ── creator handler ───────────────────────────────────────────────────────

    const handleBecomeCreator = async () => {
        setIsApplyingCreator(true);
        setCreatorResult(null);
        const result = await becomeCreator();
        if (result.success) {
            setCreatorResult({ type: 'success', msg: 'Application submitted! Refresh to see your creator tools.' });
            router.refresh();
        } else {
            setCreatorResult({ type: 'error', msg: result.error || 'Could not submit application. Please try again.' });
        }
        setIsApplyingCreator(false);
    };

    // ─────────────────────────────────────────────────────────────────────────

    return (
        <main className="min-h-screen pt-16 pb-24 lg:pb-12">
            {/* Background atmosphere */}
            <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-0 right-[-15%] w-[70%] h-[70%] bg-indigo-500/5 dark:bg-indigo-500/8 blur-[180px] rounded-full" />
                <div className="absolute bottom-0 left-[-10%] w-[55%] h-[55%] bg-purple-500/5 dark:bg-purple-500/8 blur-[160px] rounded-full" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-rose-500/3 dark:bg-rose-500/5 blur-[200px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* ══ HERO HEADER ══ */}
                <div className="pt-10 pb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

                        {/* Avatar + greeting */}
                        <div className="flex items-center gap-5">
                            <div className="relative flex-shrink-0">
                                {user.profileImage ? (
                                    <Image
                                        src={user.profileImage}
                                        alt={user.fullName}
                                        width={80}
                                        height={80}
                                        className="w-20 h-20 rounded-2xl object-cover ring-4 ring-white dark:ring-white/10 shadow-2xl"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 ring-4 ring-white dark:ring-white/10 shadow-2xl flex items-center justify-center text-white text-3xl font-black select-none">
                                        {user.fullName.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="absolute -bottom-1.5 -right-1.5 w-5 h-5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-[#0a0a0f] shadow-lg" />
                            </div>

                            <div>
                                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.25em] mb-1">{greeting}</p>
                                <h1 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                                    {user.fullName.split(' ')[0]}
                                </h1>
                                <div className="flex flex-wrap items-center gap-2 mt-2.5">
                                    {user.isCreator ? (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-amber-500/20">
                                            <Crown className="w-3 h-3" /> Creator
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-indigo-500/20">
                                            <Zap className="w-3 h-3" /> Member
                                        </span>
                                    )}
                                    {streakCount > 0 && (
                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                                            🔥 {streakCount}/7 Active Days
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-3 flex-wrap">
                            {(user.isCreator || isAdmin) && (
                                <>
                                    <Link
                                        href="/u/upload-video"
                                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95 text-xs uppercase tracking-widest"
                                    >
                                        <Film className="w-4 h-4" /> Upload Video
                                    </Link>
                                    <Link
                                        href="/u/upload-reel"
                                        className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-pink-600/20 active:scale-95 text-xs uppercase tracking-widest"
                                    >
                                        <PlaySquare className="w-4 h-4" /> Post Reel
                                    </Link>
                                </>
                            )}
                            <div className="hidden sm:block h-9 w-px bg-slate-200 dark:bg-white/10" />
                            <UserSignOutButton />
                        </div>
                    </div>
                </div>

                {/* ══ STAT CARDS ══ */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
                    {statCards.map((stat) => (
                        <div
                            key={stat.label}
                            className="relative bg-white/70 dark:bg-white/5 backdrop-blur-xl p-5 rounded-2xl border border-slate-200/60 dark:border-white/10 hover:border-slate-300/60 dark:hover:border-white/20 transition-all duration-300 group shadow-sm hover:shadow-lg overflow-hidden"
                        >
                            {/* Gradient top edge on hover */}
                            <div className={`absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                            <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                <stat.icon className="w-5 h-5" />
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-[0.15em] mb-1">{stat.label}</p>
                            <p className={`text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${stat.gradient}`}>
                                {fmt(stat.value)}
                            </p>
                        </div>
                    ))}
                </div>

                {/* ══ TWO-COLUMN LAYOUT ══ */}
                <div className="flex flex-col lg:flex-row gap-8">

                    {/* ── Desktop Sidebar ── */}
                    <div className="hidden lg:block lg:w-64 flex-shrink-0">
                        <nav className="bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-3 border border-slate-200/50 dark:border-white/5 sticky top-24 shadow-sm space-y-1">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all group text-left ${
                                        activeTab === item.id
                                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                                            : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                                    }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
                                        <span className="font-bold text-sm uppercase tracking-tight">{item.label}</span>
                                    </div>
                                    {activeTab === item.id && <ChevronRight className="w-4 h-4 text-white/70" />}
                                </button>
                            ))}

                            {/* 7-Day Activity */}
                            <div className="mt-2 p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200/50 dark:border-white/5">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em] mb-3">7-Day Activity</p>
                                <div className="flex gap-1.5 justify-between">
                                    {activityDots.map((dot, i) => (
                                        <div key={i} className="flex flex-col items-center gap-1">
                                            <div
                                                className={`w-6 h-6 rounded-lg transition-all ${
                                                    dot.active
                                                        ? 'bg-indigo-500 shadow-sm shadow-indigo-500/40'
                                                        : 'bg-slate-200 dark:bg-white/10'
                                                } ${dot.isToday ? 'ring-2 ring-offset-1 ring-indigo-500 dark:ring-offset-slate-900' : ''}`}
                                            />
                                            <span className="text-[8px] font-black text-slate-400 uppercase">{dot.day.charAt(0)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Premium CTA */}
                            <div className="mt-2 p-4 bg-gradient-to-br from-indigo-600/20 to-purple-600/20 rounded-2xl border border-indigo-500/20 relative overflow-hidden">
                                <div className="flex items-center gap-2 mb-1">
                                    <Sparkles className="w-4 h-4 text-indigo-400" />
                                    <h4 className="text-sm font-black text-slate-900 dark:text-white">Go Premium</h4>
                                </div>
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">Ad-free streaming & HD quality.</p>
                                <Link
                                    href="/premium"
                                    className="block w-full py-2 text-center bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-xl transition-colors shadow-lg shadow-indigo-600/40 uppercase tracking-widest"
                                >
                                    Upgrade Now
                                </Link>
                            </div>
                        </nav>
                    </div>

                    {/* ── Tab Content ── */}
                    <div className="flex-1 min-w-0">

                        {/* ════════════════════════════
                             OVERVIEW TAB
                        ════════════════════════════ */}
                        {activeTab === 'overview' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

                                {/* Quick Actions */}
                                <section>
                                    <h2 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-4">Quick Actions</h2>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {quickActions.map((action, i) => {
                                            const inner = (
                                                <div className={`${action.bg} rounded-2xl p-5 border border-slate-200/50 dark:border-white/5 hover:shadow-lg transition-all duration-300 cursor-pointer hover:scale-[1.02] active:scale-[0.98] h-full`}>
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-gradient-to-br ${action.gradient} shadow-lg shadow-black/10`}>
                                                        <action.icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{action.label}</p>
                                                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">{action.sub}</p>
                                                </div>
                                            );
                                            if (action.tab) {
                                                return (
                                                    <button key={i} onClick={() => setActiveTab(action.tab!)} className="text-left w-full">
                                                        {inner}
                                                    </button>
                                                );
                                            }
                                            return (
                                                <Link key={i} href={action.href!} className="block">
                                                    {inner}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </section>

                                {/* Continue Watching */}
                                {continueWatching.length > 0 && (
                                    <section>
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tight">
                                                <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                                                    <Clock className="w-4 h-4 text-indigo-500" />
                                                </div>
                                                Continue Watching
                                            </h2>
                                            <button
                                                onClick={() => setActiveTab('history')}
                                                className="text-xs text-indigo-500 hover:text-indigo-600 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                                            >
                                                Full History <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                            {continueWatching.map((item: any) => {
                                                const pct = item.video.duration
                                                    ? Math.min(Math.round((item.lastPosition / item.video.duration) * 100), 100)
                                                    : 0;
                                                return (
                                                    <Link
                                                        href={`/watch/${item.video.id}`}
                                                        key={item.id}
                                                        className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 hover:border-indigo-500/30 transition-all group shadow-sm hover:shadow-lg"
                                                    >
                                                        <div className="relative aspect-video bg-slate-200 dark:bg-slate-800">
                                                            <Image
                                                                src={item.video.thumbnailUrl || '/placeholder-thumb.jpg'}
                                                                alt={item.video.title}
                                                                fill
                                                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                            />
                                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 scale-90 group-hover:scale-100 transition-transform">
                                                                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                                                </div>
                                                            </div>
                                                            {/* Progress bar */}
                                                            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/40 backdrop-blur-sm">
                                                                <div
                                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all"
                                                                    style={{ width: `${pct}%` }}
                                                                />
                                                            </div>
                                                            <div className="absolute bottom-3 right-2 px-2 py-0.5 bg-black/70 backdrop-blur-sm rounded-md text-white text-[10px] font-black">
                                                                {pct}%
                                                            </div>
                                                        </div>
                                                        <div className="p-3">
                                                            <h3 className="font-black text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
                                                                {item.video.title}
                                                            </h3>
                                                            <p className="text-[11px] text-slate-500 mt-0.5 font-medium">{item.video.creator.fullName}</p>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}

                                {/* Creator Performance Block */}
                                {user.isCreator && (
                                    <section>
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tight">
                                                <div className="p-1.5 bg-emerald-500/10 rounded-lg">
                                                    <BarChart3 className="w-4 h-4 text-emerald-500" />
                                                </div>
                                                Creator Performance
                                            </h2>
                                            <button
                                                onClick={() => setActiveTab('content')}
                                                className="text-xs text-indigo-500 hover:text-indigo-600 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                                            >
                                                Creator Studio <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>

                                        {/* Mini stat row */}
                                        <div className="grid grid-cols-3 gap-3 mb-5">
                                            {[
                                                { label: 'Videos', value: videos?.length ?? 0, icon: Film, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                                                { label: 'Reels', value: reels?.length ?? 0, icon: PlaySquare, color: 'text-pink-500', bg: 'bg-pink-500/10' },
                                                { label: 'Total Views', value: fmt(user._count?.totalViews ?? 0), icon: Eye, color: 'text-blue-500', bg: 'bg-blue-500/10', raw: true },
                                            ].map((s) => (
                                                <div
                                                    key={s.label}
                                                    className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/60 dark:border-white/10 text-center"
                                                >
                                                    <div className={`w-8 h-8 ${s.bg} ${s.color} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                                                        <s.icon className="w-4 h-4" />
                                                    </div>
                                                    <p className="text-xl font-black text-slate-900 dark:text-white">
                                                        {(s as any).raw ? s.value : s.value}
                                                    </p>
                                                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">{s.label}</p>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Top content chart */}
                                        {topContent.length > 0 && (
                                            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/60 dark:border-white/10 mb-4">
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Top Content by Views</p>
                                                <div className="space-y-3">
                                                    {topContent.map((item: any, i: number) => (
                                                        <div key={item.id} className="flex items-center gap-3">
                                                            <span className="text-[10px] font-black text-slate-400 w-4 text-center">{i + 1}</span>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center justify-between mb-1">
                                                                    <p className="text-xs font-bold text-slate-700 dark:text-slate-300 line-clamp-1 uppercase tracking-tight">{item.title}</p>
                                                                    <span className="text-[10px] font-black text-slate-400 ml-3 flex-shrink-0 flex items-center gap-1">
                                                                        <Eye className="w-3 h-3" /> {fmt(item.viewsCount || 0)}
                                                                    </span>
                                                                </div>
                                                                <div className="h-1.5 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full transition-all duration-700 ${
                                                                            i === 0 ? 'bg-gradient-to-r from-indigo-500 to-purple-500' :
                                                                            i === 1 ? 'bg-gradient-to-r from-pink-500 to-rose-500' :
                                                                            'bg-gradient-to-r from-slate-400 to-slate-500'
                                                                        }`}
                                                                        style={{ width: `${item.pct}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                            <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-md ${
                                                                item.type === 'REEL'
                                                                    ? 'text-pink-500 bg-pink-500/10'
                                                                    : 'text-indigo-500 bg-indigo-500/10'
                                                            }`}>{item.type === 'REEL' ? 'Reel' : 'Vid'}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="flex gap-3">
                                            <Link
                                                href="/u/upload-video"
                                                className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                                            >
                                                <Film className="w-4 h-4" /> Upload Video
                                            </Link>
                                            <Link
                                                href="/u/upload-reel"
                                                className="flex-1 py-3 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-pink-600/20 active:scale-95"
                                            >
                                                <PlaySquare className="w-4 h-4" /> Post Reel
                                            </Link>
                                        </div>
                                    </section>
                                )}

                                {/* Become Creator CTA */}
                                {!user.isCreator && (
                                    <section className="relative overflow-hidden bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-rose-500/10 dark:from-amber-500/15 dark:via-orange-500/5 dark:to-rose-500/15 rounded-[32px] border border-amber-500/20 p-8 shadow-sm">
                                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-400/10 blur-[60px] rounded-full pointer-events-none" />
                                        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="p-2 bg-amber-500/20 rounded-xl">
                                                        <Crown className="w-5 h-5 text-amber-500" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-amber-600 dark:text-amber-400 uppercase tracking-[0.2em]">Creator Program</span>
                                                </div>
                                                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tight">Become a Creator</h3>
                                                <div className="grid grid-cols-2 gap-2 mb-4">
                                                    {[
                                                        '📹 Upload videos & reels',
                                                        '📊 Detailed analytics',
                                                        '👥 Grow your audience',
                                                        '💰 Monetize content',
                                                    ].map((b) => (
                                                        <p key={b} className="text-xs text-slate-600 dark:text-slate-400 font-medium">{b}</p>
                                                    ))}
                                                </div>
                                                {creatorResult && (
                                                    <div className={`flex items-center gap-2 text-xs font-bold ${creatorResult.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                        {creatorResult.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                                        {creatorResult.msg}
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={handleBecomeCreator}
                                                disabled={isApplyingCreator}
                                                className="flex-shrink-0 px-8 py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-amber-500/30 flex items-center gap-2 active:scale-95"
                                            >
                                                {isApplyingCreator ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                {isApplyingCreator ? 'Applying...' : 'Apply Now'}
                                            </button>
                                        </div>
                                    </section>
                                )}

                                {/* Recently Watched */}
                                <section>
                                    <div className="flex items-center justify-between mb-5">
                                        <h2 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tight">
                                            <div className="p-1.5 bg-indigo-500/10 rounded-lg">
                                                <History className="w-4 h-4 text-indigo-500" />
                                            </div>
                                            Recently Watched
                                        </h2>
                                        <button
                                            onClick={() => setActiveTab('history')}
                                            className="text-xs text-indigo-500 hover:text-indigo-600 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                                        >
                                            View All <ArrowRight className="w-3 h-3" />
                                        </button>
                                    </div>

                                    {combinedHistory.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {combinedHistory.slice(0, 4).map((view: any) => (
                                                <Link
                                                    href={`/watch/${view.video.id}`}
                                                    key={view.id}
                                                    className="bg-white/70 dark:bg-white/5 backdrop-blur-xl flex gap-4 p-4 rounded-2xl hover:bg-white dark:hover:bg-white/10 transition-all border border-slate-200/50 dark:border-white/5 hover:border-indigo-500/20 group shadow-sm hover:shadow-md"
                                                >
                                                    <div className="relative w-32 aspect-video rounded-xl overflow-hidden bg-slate-200 dark:bg-slate-800 flex-shrink-0">
                                                        <Image
                                                            src={view.video.thumbnailUrl || '/placeholder-thumb.jpg'}
                                                            alt={view.video.title}
                                                            fill
                                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                                        />
                                                        {view.video.duration > 0 && (
                                                            <div className="absolute bottom-0 left-0 w-full h-1 bg-black/40">
                                                                <div
                                                                    className="h-full bg-indigo-500"
                                                                    style={{ width: `${Math.min((view.lastPosition / view.video.duration) * 100, 100)}%` }}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                                        <h3 className="font-black text-slate-900 dark:text-white line-clamp-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors text-sm uppercase tracking-tight leading-tight">
                                                            {view.video.title}
                                                        </h3>
                                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{view.video.creator.fullName}</p>
                                                        <p className="text-[10px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest">
                                                            {new Date(view.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="py-16 bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-[32px] text-center border border-dashed border-slate-200 dark:border-white/10">
                                            <History className="w-12 h-12 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                                            <p className="font-bold text-slate-500 uppercase tracking-tight mb-4">No watch history yet.</p>
                                            <Link
                                                href="/browse"
                                                className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95"
                                            >
                                                Start Watching <ArrowRight className="w-3.5 h-3.5" />
                                            </Link>
                                        </div>
                                    )}
                                </section>

                                {/* Watchlist Preview */}
                                {watchlist.length > 0 && (
                                    <section>
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tight">
                                                <div className="p-1.5 bg-amber-500/10 rounded-lg">
                                                    <Bookmark className="w-4 h-4 text-amber-500" />
                                                </div>
                                                Saved for Later
                                            </h2>
                                            <button
                                                onClick={() => setActiveTab('watchlist')}
                                                className="text-xs text-indigo-500 hover:text-indigo-600 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                                            >
                                                See All ({watchlist.length}) <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                            {watchlist.slice(0, 4).map((item: any) => {
                                                const id = item.id || item.videoId;
                                                const title = item.title || item.video?.title || 'Untitled';
                                                const thumb = item.thumbnailUrl || item.video?.thumbnailUrl || '/placeholder-thumb.jpg';
                                                return (
                                                    <Link
                                                        href={`/watch/${id}`}
                                                        key={id}
                                                        className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-200/50 dark:border-white/5 hover:border-amber-500/20 transition-all group shadow-sm hover:shadow-md"
                                                    >
                                                        <div className="relative aspect-video bg-slate-200 dark:bg-slate-800">
                                                            <Image src={thumb} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <Play className="w-6 h-6 text-white fill-white drop-shadow-lg" />
                                                            </div>
                                                        </div>
                                                        <div className="p-2.5">
                                                            <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 uppercase tracking-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">{title}</p>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </section>
                                )}

                                {/* Trending Now */}
                                {trending.length > 0 && (
                                    <section>
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tight">
                                                <div className="p-1.5 bg-rose-500/10 rounded-lg">
                                                    <TrendingUp className="w-4 h-4 text-rose-500" />
                                                </div>
                                                Trending Now
                                            </h2>
                                            <Link
                                                href="/browse"
                                                className="text-xs text-indigo-500 hover:text-indigo-600 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                                            >
                                                Browse All <ArrowRight className="w-3 h-3" />
                                            </Link>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                            {trending.slice(0, 6).map((video: any) => (
                                                <Link
                                                    href={`/watch/${video.id}`}
                                                    key={video.id}
                                                    className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-200/50 dark:border-white/5 hover:border-rose-500/20 transition-all group shadow-sm hover:shadow-md"
                                                >
                                                    <div className="relative aspect-video bg-slate-200 dark:bg-slate-800">
                                                        <Image
                                                            src={video.thumbnailUrl || video.thumbnail_url || '/placeholder-thumb.jpg'}
                                                            alt={video.title}
                                                            fill
                                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                        />
                                                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <Play className="w-8 h-8 text-white fill-white drop-shadow-lg" />
                                                        </div>
                                                    </div>
                                                    <div className="p-3">
                                                        <h3 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1 uppercase tracking-tight group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                                                            {video.title}
                                                        </h3>
                                                        <div className="flex items-center gap-1.5 mt-1">
                                                            <Eye className="w-3 h-3 text-slate-400" />
                                                            <span className="text-[10px] text-slate-400 font-medium">{fmt(video.viewsCount || video.views_count || 0)} views</span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Playlists preview (non-empty) */}
                                {user.playlists.length > 0 && (
                                    <section>
                                        <div className="flex items-center justify-between mb-5">
                                            <h2 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white uppercase tracking-tight">
                                                <div className="p-1.5 bg-purple-500/10 rounded-lg">
                                                    <Music className="w-4 h-4 text-purple-500" />
                                                </div>
                                                My Collections
                                            </h2>
                                            <button
                                                onClick={() => setActiveTab('playlists')}
                                                className="text-xs text-indigo-500 hover:text-indigo-600 font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                                            >
                                                Manage <ArrowRight className="w-3 h-3" />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                                            {user.playlists.slice(0, 4).map((p) => (
                                                <button
                                                    key={p.id}
                                                    onClick={() => setActiveTab('playlists')}
                                                    className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-slate-200/50 dark:border-white/5 hover:border-purple-500/20 transition-all group shadow-sm hover:shadow-md text-left"
                                                >
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-violet-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300">
                                                        <Music className="w-5 h-5 text-purple-500" />
                                                    </div>
                                                    <p className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 uppercase tracking-tight">{p.name}</p>
                                                    <p className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${p.isPublic ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                        {p.isPublic ? 'Public' : 'Private'}
                                                    </p>
                                                </button>
                                            ))}
                                        </div>
                                    </section>
                                )}
                            </div>
                        )}

                        {/* ════════════════════════════
                             CONTENT TAB
                        ════════════════════════════ */}
                        {activeTab === 'content' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                                <ContentManagement videos={videos} reels={reels} categories={categories} />
                            </div>
                        )}

                        {/* ════════════════════════════
                             HISTORY TAB
                        ════════════════════════════ */}
                        {activeTab === 'history' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Watch History</h2>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                                        {combinedHistory.length} Items
                                    </span>
                                </div>
                                <HistoryList initialHistory={combinedHistory} />
                            </div>
                        )}

                        {/* ════════════════════════════
                             WATCHLIST TAB
                        ════════════════════════════ */}
                        {activeTab === 'watchlist' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center justify-between mb-2 px-1">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">My Watchlist</h2>
                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-3 py-1.5 bg-slate-100 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/5">
                                        {watchlist.length} Saved
                                    </span>
                                </div>

                                {watchlist.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {watchlist.map((item: any) => {
                                            const id = item.id || item.videoId;
                                            const title = item.title || item.video?.title || 'Untitled';
                                            const thumb = item.thumbnailUrl || item.thumbnail_url || item.video?.thumbnailUrl || '/placeholder-thumb.jpg';
                                            const creator = item.creatorName || item.creator_name || item.video?.creator?.fullName || '';
                                            return (
                                                <Link
                                                    href={`/watch/${id}`}
                                                    key={id}
                                                    className="bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-200/50 dark:border-white/5 hover:border-indigo-500/20 transition-all group shadow-sm hover:shadow-md"
                                                >
                                                    <div className="relative aspect-video bg-slate-200 dark:bg-slate-800">
                                                        <Image src={thumb} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center">
                                                                <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="p-3">
                                                        <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors uppercase tracking-tight">{title}</h3>
                                                        {creator && <p className="text-[11px] text-slate-400 mt-1 font-medium">{creator}</p>}
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-20 bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-[40px] text-center border border-dashed border-slate-200 dark:border-white/10">
                                        <Bookmark className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Watchlist is Empty</h3>
                                        <p className="text-slate-500 font-medium mb-6 text-sm">Save videos you want to watch later.</p>
                                        <Link href="/browse" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                                            Browse Content <ArrowRight className="w-4 h-4" />
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ════════════════════════════
                             PLAYLISTS TAB
                        ════════════════════════════ */}
                        {activeTab === 'playlists' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">My Playlists</h2>
                                    <Link
                                        href="/u/playlists"
                                        className="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-xs font-black flex items-center gap-2 transition-all uppercase tracking-widest shadow-xl hover:opacity-90 active:scale-95"
                                    >
                                        <Plus className="w-4 h-4" /> New Collection
                                    </Link>
                                </div>

                                {user.playlists.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {user.playlists.map((p) => (
                                            <Link
                                                href="/u/playlists"
                                                key={p.id}
                                                className="bg-white/50 dark:bg-white/5 backdrop-blur-xl group p-6 rounded-[32px] border border-slate-200/50 dark:border-white/5 hover:border-indigo-500/20 transition-all shadow-sm hover:shadow-md"
                                            >
                                                <div className="w-full aspect-square bg-gradient-to-br from-indigo-600/10 to-purple-600/10 dark:from-indigo-600/20 dark:to-purple-600/20 rounded-[24px] flex items-center justify-center mb-5 ring-1 ring-slate-200 dark:ring-white/5 group-hover:scale-95 transition-transform duration-500">
                                                    <Music className="w-14 h-14 text-indigo-600 dark:text-indigo-400 group-hover:rotate-6 transition-transform duration-500" />
                                                </div>
                                                <h4 className="font-black text-lg text-slate-900 dark:text-white mb-1 uppercase tracking-tight line-clamp-1">{p.name}</h4>
                                                <p className={`text-[10px] font-black uppercase tracking-widest ${p.isPublic ? 'text-emerald-500' : 'text-slate-400'}`}>
                                                    {p.isPublic ? '• Public Collection' : '• Private Collection'}
                                                </p>
                                            </Link>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="py-20 bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-[40px] text-center border border-dashed border-slate-200 dark:border-white/10">
                                        <Music className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700" />
                                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">No Playlists Yet</h3>
                                        <p className="text-slate-500 font-medium mb-6 text-sm">Create your first collection to organise content.</p>
                                        <Link href="/u/playlists" className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-600/20 active:scale-95">
                                            <Plus className="w-4 h-4" /> Create Playlist
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ════════════════════════════
                             SETTINGS TAB
                        ════════════════════════════ */}
                        {activeTab === 'settings' && (
                            <div className="bg-white/40 dark:bg-white/5 backdrop-blur-3xl rounded-[40px] p-8 md:p-12 border border-slate-200/50 dark:border-white/10 animate-in fade-in duration-500 shadow-2xl shadow-indigo-500/5">
                                <div className="mb-12">
                                    <h2 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">Account Preferences</h2>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Customize your experience and manage your data</p>
                                </div>

                                <div className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12 border-b border-slate-200/50 dark:border-white/5">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Full Name</label>
                                            <div className="px-6 py-5 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold text-sm uppercase">{user.fullName}</div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-2">Email Address</label>
                                            <div className="px-6 py-5 bg-slate-50 dark:bg-black/20 rounded-2xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-bold text-sm">{user.email}</div>
                                        </div>
                                    </div>

                                    <SettingsForm user={user} />

                                    {!user.isCreator && (
                                        <div className="p-8 bg-gradient-to-br from-amber-500/10 to-orange-600/10 border border-amber-500/20 rounded-[32px] relative overflow-hidden">
                                            <div className="absolute top-0 right-0 -mr-10 -mt-10 w-40 h-40 bg-white/5 blur-[80px] rounded-full pointer-events-none" />
                                            <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
                                                <div>
                                                    <h4 className="text-lg font-black text-amber-600 dark:text-amber-500 mb-2 flex items-center gap-2 uppercase tracking-tight">
                                                        <Star className="w-5 h-5 fill-amber-500" /> Creator Tools
                                                    </h4>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-md">
                                                        Unlock video uploads, analytics, and monetization tools by joining the creator program.
                                                    </p>
                                                    {creatorResult && (
                                                        <div className={`mt-3 flex items-center gap-2 text-xs font-bold ${creatorResult.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
                                                            {creatorResult.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                                            {creatorResult.msg}
                                                        </div>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={handleBecomeCreator}
                                                    disabled={isApplyingCreator}
                                                    className="flex-shrink-0 px-8 py-4 bg-amber-500 hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-black uppercase tracking-widest rounded-2xl transition-all shadow-xl shadow-amber-500/20 flex items-center gap-2 whitespace-nowrap active:scale-95"
                                                >
                                                    {isApplyingCreator ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                                                    {isApplyingCreator ? 'Applying...' : 'Apply Now →'}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ══ MOBILE BOTTOM NAVIGATION ══ */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#0a0a0f]/95 backdrop-blur-2xl border-t border-slate-200/60 dark:border-white/10 shadow-2xl">
                <div className="flex items-center justify-around px-1 py-1.5 safe-area-inset-bottom">
                    {navItems.slice(0, 5).map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`flex flex-col items-center gap-0.5 px-2 py-2 rounded-2xl transition-all min-w-0 ${
                                activeTab === item.id
                                    ? 'text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-400 dark:text-slate-500'
                            }`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all ${activeTab === item.id ? 'bg-indigo-100 dark:bg-indigo-500/20' : ''}`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="text-[9px] font-black uppercase tracking-widest">{item.short}</span>
                        </button>
                    ))}
                </div>
            </div>
        </main>
    );
}
