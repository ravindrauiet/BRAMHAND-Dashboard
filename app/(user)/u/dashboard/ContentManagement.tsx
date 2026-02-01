'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Film, PlaySquare, Edit2, Trash2, Eye, Heart, Share2, MoreVertical, X, Save, AlertCircle, TrendingUp, Star } from 'lucide-react';
import { deleteVideo, updateVideo } from './actions';

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
    createdAt: string;
}

interface ContentManagementProps {
    videos: Video[];
    reels: Video[];
    categories: any[];
}

export default function ContentManagement({ videos, reels, categories }: ContentManagementProps) {
    const [activeTab, setActiveTab] = useState<'videos' | 'reels' | 'analytics'>('videos');
    const [editingVideo, setEditingVideo] = useState<Video | null>(null);
    const [isDeleting, setIsDeleting] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Debug logging
    console.log('ContentManagement component - Props:', {
        videosCount: videos.length,
        reelsCount: reels.length,
        categoriesCount: categories.length
    });

    if (videos.length > 0) {
        console.log('ContentManagement - First video:', videos[0]);
    }

    const currentContent = activeTab === 'videos' ? videos : reels;

    // Aggregate ALL content for the analytics tab
    const allContent = [...videos, ...reels];
    const totalViews = allContent.reduce((sum, v) => sum + (v.viewsCount || 0), 0);
    const totalLikes = allContent.reduce((sum, v) => sum + (v.likesCount || 0), 0);
    const totalShares = allContent.reduce((sum, v) => sum + (v.sharesCount || 0), 0);

    const handleDelete = async (id: number) => {
        if (!confirm(`Are you sure you want to delete this ${activeTab === 'videos' ? 'video' : 'reel'}?`)) {
            return;
        }

        setIsDeleting(id);
        setError(null);

        const result = await deleteVideo(id);

        if (result.success) {
            window.location.reload();
        } else {
            setError(result.error || 'Failed to delete');
            setIsDeleting(null);
        }
    };

    const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!editingVideo) return;

        const formData = new FormData(e.currentTarget);
        const result = await updateVideo(editingVideo.id, formData);

        if (result.success) {
            setEditingVideo(null);
            window.location.reload();
        } else {
            setError(result.error || 'Failed to update');
        }
    };

    return (
        <div className="space-y-6">
            {/* Tab Navigation */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-2 shadow-sm border border-slate-200 dark:border-slate-800 flex gap-2">
                <button
                    onClick={() => setActiveTab('videos')}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'videos'
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                >
                    <Film className="w-5 h-5" />
                    My Videos ({videos.length})
                </button>
                <button
                    onClick={() => setActiveTab('reels')}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'reels'
                        ? 'bg-pink-600 text-white shadow-lg shadow-pink-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                >
                    <PlaySquare className="w-5 h-5" />
                    My Reels ({reels.length})
                </button>
                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${activeTab === 'analytics'
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/25'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                        }`}
                >
                    <Eye className="w-5 h-5" />
                    Analytics
                </button>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <p className="text-sm font-medium text-red-800 dark:text-red-200">{error}</p>
                    </div>
                    <button onClick={() => setError(null)} className="text-red-500">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Content Grid */}
            {(activeTab === 'videos' || activeTab === 'reels') && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentContent.length > 0 ? (
                        currentContent.map((video) => (
                            <div
                                key={video.id}
                                className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-slate-200/60 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-300 group"
                            >
                                {/* Thumbnail */}
                                <div className="relative aspect-video bg-slate-200 dark:bg-slate-800">
                                    {video.thumbnailUrl ? (
                                        <Image
                                            src={video.thumbnailUrl}
                                            alt={video.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Film className="w-8 h-8 text-slate-400" />
                                        </div>
                                    )}
                                    <div className={`absolute top-3 right-3 px-2 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${video.isActive
                                        ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                                        : 'bg-slate-500/20 text-slate-500 border-slate-500/30'
                                        }`}>
                                        {video.isActive ? 'Active' : 'Draft'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-4">
                                    <div>
                                        <h3 className="font-bold text-slate-900 dark:text-white line-clamp-2 leading-tight uppercase tracking-tight text-sm group-hover:text-indigo-600 transition-colors">
                                            {video.title}
                                        </h3>
                                        {video.categoryName && (
                                            <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1 font-medium">{video.categoryName}</p>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 border-t border-slate-100 dark:border-white/5 pt-3">
                                        <div className="flex items-center gap-1.5">
                                            <Eye className="w-3.5 h-3.5" />
                                            <span>{video.viewsCount}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Heart className="w-3.5 h-3.5" />
                                            <span>{video.likesCount}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Share2 className="w-3.5 h-3.5" />
                                            <span>{video.sharesCount}</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setEditingVideo(video)}
                                            className="flex-1 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all text-[10px] font-bold uppercase tracking-widest shadow-sm"
                                        >
                                            Edit
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
                        <div className="col-span-full text-center py-16">
                            <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                                {activeTab === 'videos' ? <Film className="w-10 h-10 text-slate-400" /> : <PlaySquare className="w-10 h-10 text-slate-400" />}
                            </div>
                            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                                No {activeTab} yet
                            </h3>
                            <p className="text-slate-500">Upload your first {activeTab === 'videos' ? 'video' : 'reel'} to get started!</p>
                        </div>
                    )}
                </div>
            )}

            {/* Analytics Tab */}
            {activeTab === 'analytics' && (
                allContent.length > 0 ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Key Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[
                                { label: 'Total Views', value: totalViews, icon: Eye, color: 'from-blue-600 to-indigo-600' },
                                { label: 'Total Likes', value: totalLikes, icon: Heart, color: 'from-pink-600 to-rose-600' },
                                { label: 'Total Shares', value: totalShares, icon: Share2, color: 'from-purple-600 to-violet-600' },
                                { label: 'Engagement', value: `${totalViews > 0 ? (((totalLikes + totalShares) / totalViews) * 100).toFixed(1) : 0}%`, icon: TrendingUp, color: 'from-emerald-600 to-teal-600' }
                            ].map((stat, i) => (
                                <div key={i} className={`bg-gradient-to-br ${stat.color} rounded-2xl p-5 text-white shadow-lg relative overflow-hidden group`}>
                                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-700" />
                                    <div className="flex justify-between items-start mb-4 relative z-10">
                                        <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-md">
                                            <stat.icon className="w-5 h-5" />
                                        </div>
                                    </div>
                                    <div className="relative z-10">
                                        <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest mb-1">{stat.label}</p>
                                        <h3 className="text-2xl font-black tracking-tight">{stat.value.toLocaleString()}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Top Performing Content */}
                            <div className="lg:col-span-2 bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest">Top Performing Content</h3>
                                    <button className="text-[10px] font-bold text-indigo-500 hover:text-indigo-600 uppercase tracking-widest">Full List</button>
                                </div>
                                <div className="space-y-4">
                                    {[...allContent]
                                        .sort((a, b) => (b.viewsCount || 0) - (a.viewsCount || 0))
                                        .slice(0, 4)
                                        .map((video, i) => (
                                            <div key={video.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all border border-transparent hover:border-slate-100 dark:hover:border-white/5 group">
                                                <div className="w-8 text-xs font-black text-slate-300 dark:text-slate-700">0{i + 1}</div>
                                                <div className="relative w-16 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-slate-200 dark:bg-slate-800">
                                                    {video.thumbnailUrl ? (
                                                        <Image src={video.thumbnailUrl} alt={video.title} fill className="object-cover" />
                                                    ) : (
                                                        <Film className="w-4 h-4 text-slate-400 absolute inset-0 m-auto" />
                                                    )}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-xs font-bold text-slate-800 dark:text-white truncate uppercase tracking-tight">{video.title}</h4>
                                                    <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest leading-none mt-1">{video.type}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="flex items-center gap-1 justify-end text-emerald-500 text-[10px] font-black">
                                                        <Eye className="w-3 h-3" />
                                                        {video.viewsCount.toLocaleString()}
                                                    </div>
                                                    <div className="w-24 h-1 bg-slate-100 dark:bg-white/10 rounded-full mt-2 overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-500 rounded-full"
                                                            style={{ width: `${Math.min((video.viewsCount / (totalViews || 1)) * 300, 100)}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            {/* Performance Distribution */}
                            <div className="bg-white/70 dark:bg-white/5 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 dark:border-white/10 shadow-sm flex flex-col">
                                <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Engagement Split</h3>
                                <div className="flex-1 flex flex-col justify-center space-y-6">
                                    <div className="relative pt-1">
                                        <div className="flex mb-2 items-center justify-between">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Likes Rate</div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-black inline-block text-indigo-500">
                                                    {totalViews > 0 ? ((totalLikes / totalViews) * 100).toFixed(1) : 0}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-indigo-500/10">
                                            <div style={{ width: `${totalViews > 0 ? (totalLikes / totalViews) * 100 : 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
                                        </div>
                                    </div>
                                    <div className="relative pt-1">
                                        <div className="flex mb-2 items-center justify-between">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-pink-500">Shares Rate</div>
                                            <div className="text-right">
                                                <span className="text-[10px] font-black inline-block text-pink-500">
                                                    {totalViews > 0 ? ((totalShares / totalViews) * 100).toFixed(1) : 0}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="overflow-hidden h-2 mb-4 text-xs flex rounded-full bg-pink-500/10">
                                            <div style={{ width: `${totalViews > 0 ? (totalShares / totalViews) * 100 : 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-pink-500"></div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-indigo-500/5 rounded-2xl border border-indigo-500/10 mt-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Star className="w-3.5 h-3.5 text-indigo-500" />
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Insights</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                                            Your {videos.length > reels.length ? 'long-form videos' : 'short reels'} are driving {Math.max(totalLikes, totalViews) > 1000 ? 'exponential' : 'steady'} growth this month.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white/50 dark:bg-white/5 backdrop-blur-xl rounded-[40px] border border-dashed border-slate-200 dark:border-white/10">
                        <TrendingUp className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700 opacity-20" />
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">No Insights Yet</h3>
                        <p className="text-slate-500 font-medium">Upload content to start seeing performance analytics.</p>
                    </div>
                )
            )}

            {/* Edit Modal */}
            {editingVideo && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl">
                        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white dark:bg-slate-900 z-10">
                            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit {editingVideo.type === 'VIDEO' ? 'Video' : 'Reel'}</h2>
                            <button
                                onClick={() => setEditingVideo(null)}
                                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Title
                                </label>
                                <input
                                    name="title"
                                    defaultValue={editingVideo.title}
                                    required
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Description
                                </label>
                                <textarea
                                    name="description"
                                    defaultValue={editingVideo.description || ''}
                                    rows={4}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Category
                                </label>
                                <select
                                    name="categoryId"
                                    defaultValue={editingVideo.categoryName}
                                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-900 dark:text-white"
                                >
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    name="isActive"
                                    id="isActive"
                                    defaultChecked={editingVideo.isActive}
                                    value="true"
                                    className="w-5 h-5 text-blue-600 bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 rounded focus:ring-2 focus:ring-blue-500"
                                />
                                <label htmlFor="isActive" className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                    Active (visible to others)
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
                                <button
                                    type="button"
                                    onClick={() => setEditingVideo(null)}
                                    className="flex-1 px-6 py-3 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors font-medium"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors font-medium flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
