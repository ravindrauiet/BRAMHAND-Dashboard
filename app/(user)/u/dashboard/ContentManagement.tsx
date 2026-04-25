'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
    Film, PlaySquare, Edit2, Trash2, Eye, Heart, Share2,
    X, Save, AlertCircle, TrendingUp, Star, Play,
    CheckSquare, Square, BarChart3, Layers, ChevronDown, ChevronUp,
    Link2,
} from 'lucide-react';
import { deleteVideo, updateVideo, bulkDeleteVideos } from './actions';
import { VideoPlayerModal } from '@/components/VideoPlayerModal';

// Fix #2: added categoryId fields to interface
interface Video {
    id: number;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    videoUrl: string;
    type: 'VIDEO' | 'REEL';
    viewsCount: number;
    likesCount: number;
    sharesCount: number;
    isActive: boolean;
    categoryName?: string;
    categoryId?: number;
    category_id?: number;
    createdAt: string;
}

interface ContentManagementProps {
    videos: Video[];
    reels: Video[];
    categories: any[];
}

type ContentTab = 'videos' | 'reels' | 'analytics';

export default function ContentManagement({ videos, reels, categories }: ContentManagementProps) {
    const router = useRouter(); // Fix #5
    const [activeTab, setActiveTab] = useState<ContentTab>('videos');
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);
    const [previewVideo, setPreviewVideo] = useState<Video | null>(null); // Fix #20
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Fix #22: bulk selection state
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    // Fix #11: full list toggle for analytics
    const [showFullList, setShowFullList] = useState(false);

    // Fix #21: live thumbnail preview while editing
    const [previewThumb, setPreviewThumb] = useState<string>('');

    const currentContent = activeTab === 'videos' ? videos : reels;
    const allContent = [...videos, ...reels];
    const totalViews = allContent.reduce((s, v) => s + (v.viewsCount || 0), 0);
    const totalLikes = allContent.reduce((s, v) => s + (v.likesCount || 0), 0);
    const totalShares = allContent.reduce((s, v) => s + (v.sharesCount || 0), 0);

    // Fix #6: normalise bar widths against the single top item
    const maxViews = Math.max(...allContent.map((v) => v.viewsCount || 0), 1);

    const resolvedCategoryId = useCallback(
        (video: Video) =>
            video.categoryId ??
            video.category_id ??
            categories.find((c) => c.name === video.categoryName)?.id ??
            '',
        [categories]
    );

    // ── handlers ──────────────────────────────────────────────

    const handleDelete = async (id: number) => {
        if (!confirm(`Delete this ${activeTab === 'videos' ? 'video' : 'reel'}?`)) return;
        setIsDeleting(id);
        setError(null);
        const result = await deleteVideo(id);
        if (result.success) {
            router.refresh(); // Fix #5: use router.refresh() not window.location.reload()
        } else {
            setError(result.error || 'Failed to delete');
            setIsDeleting(null);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedIds.size === 0) return;
        if (!confirm(`Permanently delete ${selectedIds.size} item${selectedIds.size > 1 ? 's' : ''}?`)) return;
        setIsBulkDeleting(true);
        setError(null);
        const result = await bulkDeleteVideos(Array.from(selectedIds));
        if (result.success) {
            setSelectedIds(new Set());
            router.refresh(); // Fix #5
        } else {
            setError(result.error || 'Bulk delete failed');
        }
        setIsBulkDeleting(false);
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            next.has(id) ? next.delete(id) : next.add(id);
            return next;
        });
    };

    const toggleSelectAll = () => {
        if (selectedIds.size === currentContent.length) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(currentContent.map((v) => v.id)));
        }
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingVideo) return;
        setIsSaving(true);
        const formData = new FormData(e.currentTarget);
        const result = await updateVideo(editingVideo.id, formData);
        setIsSaving(false);
        if (result.success) {
            setEditingVideo(null);
            setPreviewThumb('');
            router.refresh(); // Fix #5
        } else {
            setError(result.error || 'Failed to update');
        }
    };

    const openEdit = (video: Video) => {
        setEditingVideo(video);
        setPreviewThumb(video.thumbnailUrl || '');
        setError(null);
    };

    // ── render ─────────────────────────────────────────────────

    return (
        <div className="space-y-6">

            {/* Tab bar */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-sm border border-slate-200 dark:border-slate-800 flex gap-2">
                {([
                    { id: 'videos', label: `Videos (${videos.length})`, icon: Film, active: 'bg-blue-600 shadow-blue-500/25' },
                    { id: 'reels', label: `Reels (${reels.length})`, icon: PlaySquare, active: 'bg-pink-600 shadow-pink-500/25' },
                    { id: 'analytics', label: 'Analytics', icon: BarChart3, active: 'bg-purple-600 shadow-purple-500/25' },
                ] as const).map((t) => (
                    <button
                        key={t.id}
                        onClick={() => { setActiveTab(t.id); setSelectedIds(new Set()); }}
                        className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${activeTab === t.id
                            ? `${t.active} text-white shadow-lg`
                            : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                            }`}
                    >
                        <t.icon className="w-4 h-4" />
                        <span className="hidden sm:inline">{t.label}</span>
                        <span className="sm:hidden">{t.id === 'analytics' ? 'Stats' : t.id.charAt(0).toUpperCase() + t.id.slice(1)}</span>
                    </button>
                ))}
            </div>

            {/* Error banner */}
            {error && (
                <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
                    <p className="flex-1 text-sm font-medium text-rose-800 dark:text-rose-200">{error}</p>
                    <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-600"><X className="w-4 h-4" /></button>
                </div>
            )}

            {/* ── Bulk actions toolbar — Fix #22 ── */}
            {(activeTab === 'videos' || activeTab === 'reels') && currentContent.length > 0 && (
                <div className="flex items-center justify-between px-1">
                    <button
                        onClick={toggleSelectAll}
                        className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors uppercase tracking-widest"
                    >
                        {selectedIds.size === currentContent.length
                            ? <CheckSquare className="w-4 h-4 text-indigo-500" />
                            : <Square className="w-4 h-4" />}
                        {selectedIds.size === 0 ? 'Select All' : `${selectedIds.size} Selected`}
                    </button>

                    {selectedIds.size > 0 && (
                        <button
                            onClick={handleBulkDelete}
                            disabled={isBulkDeleting}
                            className="flex items-center gap-2 px-4 py-2 bg-rose-500 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-500/20"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                            {isBulkDeleting ? 'Deleting...' : `Delete ${selectedIds.size}`}
                        </button>
                    )}
                </div>
            )}

            {/* ── Content grid ── */}
            {(activeTab === 'videos' || activeTab === 'reels') && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {currentContent.length > 0 ? (
                        currentContent.map((video) => (
                            <div
                                key={video.id}
                                className={`bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border transition-all duration-300 group shadow-sm hover:shadow-md ${selectedIds.has(video.id)
                                    ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                                    : 'border-slate-200/60 dark:border-white/10 hover:border-indigo-500/30'
                                    }`}
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-slate-200 dark:bg-slate-800">
                                    {video.thumbnailUrl ? (
                                        <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Film className="w-8 h-8 text-slate-400" />
                                        </div>
                                    )}

                                    {/* Status badge */}
                                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${video.isActive
                                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                        : 'bg-slate-500/20 text-slate-500 border-slate-500/30'
                                        }`}>
                                        {video.isActive ? 'Live' : 'Draft'}
                                    </div>

                                    {/* Fix #22: selection checkbox */}
                                    <button
                                        onClick={() => toggleSelect(video.id)}
                                        className="absolute top-2 right-2 p-1.5 bg-black/30 hover:bg-black/50 backdrop-blur-sm rounded-lg transition-all"
                                    >
                                        {selectedIds.has(video.id)
                                            ? <CheckSquare className="w-4 h-4 text-indigo-400" />
                                            : <Square className="w-4 h-4 text-white/70" />}
                                    </button>

                                    {/* Fix #20: preview overlay */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <button
                                            onClick={() => setPreviewVideo(video)}
                                            className="p-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-all border border-white/30 scale-90 group-hover:scale-100 duration-300"
                                        >
                                            <Play className="w-6 h-6 text-white fill-white" />
                                        </button>
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="p-4 space-y-3">
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-white line-clamp-2 leading-tight uppercase tracking-tight text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                            {video.title}
                                        </h3>
                                        {video.categoryName && (
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-medium">{video.categoryName}</p>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 border-t border-slate-100 dark:border-white/5 pt-3">
                                        <span className="flex items-center gap-1"><Eye className="w-3.5 h-3.5" />{(video.viewsCount || 0).toLocaleString()}</span>
                                        <span className="flex items-center gap-1"><Heart className="w-3.5 h-3.5" />{(video.likesCount || 0).toLocaleString()}</span>
                                        <span className="flex items-center gap-1"><Share2 className="w-3.5 h-3.5" />{(video.sharesCount || 0).toLocaleString()}</span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => openEdit(video)}
                                            className="flex-1 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-all text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-1.5 shadow-sm"
                                        >
                                            <Edit2 className="w-3.5 h-3.5" /> Edit
                                        </button>
                                        <button
                                            onClick={() => setPreviewVideo(video)}
                                            className="px-3 py-2 bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 rounded-lg transition-all border border-slate-200/50 dark:border-white/10"
                                            title="Preview"
                                        >
                                            <Play className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(video.id)}
                                            disabled={isDeleting === video.id}
                                            className="px-3 py-2 bg-rose-500/10 text-rose-500 rounded-lg hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50 border border-rose-500/10"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center bg-white/30 dark:bg-white/5 backdrop-blur-xl rounded-[32px] border border-dashed border-slate-200 dark:border-white/10">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                {activeTab === 'videos' ? <Film className="w-10 h-10 text-slate-400" /> : <PlaySquare className="w-10 h-10 text-slate-400" />}
                            </div>
                            <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">No {activeTab} yet</h3>
                            <p className="text-slate-500 text-sm font-medium">Upload your first {activeTab === 'videos' ? 'video' : 'reel'} to get started.</p>
                        </div>
                    )}
                </div>
            )}

            {/* ── Analytics tab ── */}
            {activeTab === 'analytics' && (
                allContent.length > 0 ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

                        {/* Key stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {([
                                { label: 'Total Views', value: totalViews.toLocaleString(), icon: Eye, color: 'from-blue-600 to-indigo-600' },
                                { label: 'Total Likes', value: totalLikes.toLocaleString(), icon: Heart, color: 'from-pink-600 to-rose-600' },
                                { label: 'Total Shares', value: totalShares.toLocaleString(), icon: Share2, color: 'from-purple-600 to-violet-600' },
                                {
                                    label: 'Engagement',
                                    value: `${totalViews > 0 ? (((totalLikes + totalShares) / totalViews) * 100).toFixed(1) : '0.0'}%`,
                                    icon: TrendingUp,
                                    color: 'from-emerald-600 to-teal-600',
                                },
                            ] as const).map((stat, i) => (
                                <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group`}>
                                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700 pointer-events-none" />
                                    <div className="relative z-10">
                                        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md w-fit mb-4">
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                                        <h3 className="text-2xl font-black tracking-tight">{stat.value}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Top content — Fix #11: Full List button works */}
                            <div className="lg:col-span-2 bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest flex items-center gap-2">
                                        <Layers className="w-4 h-4 text-indigo-500" /> Top Performing Content
                                    </h3>
                                    <button
                                        onClick={() => setShowFullList((v) => !v)}
                                        className="flex items-center gap-1 text-[10px] font-black text-indigo-500 hover:text-indigo-600 uppercase tracking-widest transition-colors"
                                    >
                                        {showFullList ? 'Show Less' : 'Full List'}
                                        {showFullList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {[...allContent]
                                        .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
                                        .slice(0, showFullList ? allContent.length : 4)
                                        .map((video, i) => (
                                            <div key={video.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5 group">
                                                <span className="w-7 text-xs font-black text-slate-300 dark:text-slate-700 text-center">{String(i + 1).padStart(2, '0')}</span>
                                                <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-800">
                                                    {video.thumbnailUrl
                                                        ? <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" />
                                                        : <Film className="w-4 h-4 text-slate-400 absolute inset-0 m-auto" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-black text-slate-800 dark:text-white truncate uppercase tracking-tight">{video.title}</h4>
                                                    <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">{video.type}</p>
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="flex items-center gap-1 justify-end text-emerald-500 text-[10px] font-black">
                                                        <Eye className="w-3 h-3" />
                                                        {(video.viewsCount || 0).toLocaleString()}
                                                    </div>
                                                    {/* Fix #6: normalised by top item's views */}
                                                    <div className="w-20 h-1 bg-slate-100 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700"
                                                            style={{ width: `${((video.viewsCount || 0) / maxViews) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Engagement split */}
                            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-sm flex flex-col">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Engagement Split</h3>
                                <div className="flex-1 flex flex-col justify-center space-y-6">
                                    {([
                                        { label: 'Likes Rate', value: totalViews > 0 ? (totalLikes / totalViews) * 100 : 0, color: 'bg-indigo-500', textColor: 'text-indigo-500', bg: 'bg-indigo-500/10' },
                                        { label: 'Shares Rate', value: totalViews > 0 ? (totalShares / totalViews) * 100 : 0, color: 'bg-pink-500', textColor: 'text-pink-500', bg: 'bg-pink-500/10' },
                                    ]).map((bar) => (
                                        <div key={bar.label}>
                                            <div className="flex justify-between items-center mb-2">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${bar.textColor}`}>{bar.label}</span>
                                                <span className={`text-[10px] font-black ${bar.textColor}`}>{bar.value.toFixed(1)}%</span>
                                            </div>
                                            <div className={`h-2 rounded-full ${bar.bg} overflow-hidden`}>
                                                <div className={`h-full ${bar.color} rounded-full transition-all duration-1000`} style={{ width: `${Math.min(bar.value * 10, 100)}%` }} />
                                            </div>
                                        </div>
                                    ))}

                                    <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 mt-2">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="w-3.5 h-3.5 text-indigo-500 fill-indigo-500" />
                                            <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-widest">Insight</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                            Your {videos.length >= reels.length ? 'long-form videos' : 'short reels'} are your strongest content format with{' '}
                                            {Math.max(totalViews, 1) > 1000 ? 'strong' : 'growing'} audience engagement.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[40px] border border-dashed border-slate-200 dark:border-white/10">
                        <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700 opacity-30" />
                        <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">No Insights Yet</h3>
                        <p className="text-slate-500 font-medium text-sm">Upload content to start seeing your analytics.</p>
                    </div>
                )
            )}

            {/* ── Fix #20: Video preview modal ── */}
            <VideoPlayerModal
                videoUrl={previewVideo?.videoUrl || ''}
                isOpen={!!previewVideo}
                onClose={() => setPreviewVideo(null)}
            />

            {/* ── Edit modal — Fixes #2, #21 ── */}
            {editingVideo && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl">
                        {/* Header */}
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10 rounded-t-3xl">
                            <div>
                                <h2 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                                    Edit {editingVideo.type === 'VIDEO' ? 'Video' : 'Reel'}
                                </h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Update metadata</p>
                            </div>
                            <button onClick={() => { setEditingVideo(null); setPreviewThumb(''); }} className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-5">
                            {/* Error */}
                            {error && (
                                <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/20 rounded-xl p-3 flex items-center gap-2 text-rose-700 dark:text-rose-300 text-sm font-medium">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                                </div>
                            )}

                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Title *</label>
                                <input
                                    name="title"
                                    defaultValue={editingVideo.title}
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium"
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Description</label>
                                <textarea
                                    name="description"
                                    defaultValue={editingVideo.description || ''}
                                    rows={3}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium resize-none"
                                />
                            </div>

                            {/* Fix #2: category uses resolved ID as defaultValue */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Category</label>
                                <select
                                    name="categoryId"
                                    defaultValue={resolvedCategoryId(editingVideo)}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium"
                                >
                                    <option value="">— Select category —</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Fix #21: Thumbnail URL with live preview */}
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 flex items-center gap-1.5">
                                    <Link2 className="w-3 h-3" /> Thumbnail URL
                                </label>
                                <input
                                    name="thumbnailUrl"
                                    value={previewThumb}
                                    onChange={(e) => setPreviewThumb(e.target.value)}
                                    placeholder="https://…"
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white font-medium text-sm placeholder:text-slate-400"
                                />
                                {previewThumb && (
                                    <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 mt-2">
                                        <Image src={previewThumb} alt="Thumbnail preview" fill className="object-cover" onError={() => setPreviewThumb('')} />
                                        <div className="absolute inset-0 bg-black/10 flex items-end p-2">
                                            <span className="text-[9px] font-black text-white/80 uppercase tracking-widest bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-sm">Preview</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Active toggle */}
                            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    id="isActive"
                                    defaultChecked={editingVideo.isActive}
                                    value="true"
                                    className="w-5 h-5 rounded-lg text-indigo-600 bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-600 focus:ring-2 focus:ring-indigo-500"
                                />
                                <label htmlFor="isActive" className="flex-1 cursor-pointer">
                                    <span className="text-sm font-black text-slate-700 dark:text-slate-300 uppercase tracking-tight">Active</span>
                                    <p className="text-[10px] text-slate-400 font-medium">Visible to all viewers when enabled</p>
                                </label>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => { setEditingVideo(null); setPreviewThumb(''); }}
                                    className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-bold text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="flex-1 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl transition-colors font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                                >
                                    {isSaving ? (
                                        <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Saving…</>
                                    ) : (
                                        <><Save className="w-4 h-4" /> Save Changes</>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
