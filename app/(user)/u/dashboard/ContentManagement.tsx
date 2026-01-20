'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Film, PlaySquare, Edit2, Trash2, Eye, Heart, Share2, MoreVertical, X, Save, AlertCircle } from 'lucide-react';
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
    const totalViews = currentContent.reduce((sum, v) => sum + v.viewsCount, 0);
    const totalLikes = currentContent.reduce((sum, v) => sum + v.likesCount, 0);

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
                                className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all group"
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
                                            <Film className="w-12 h-12 text-slate-400" />
                                        </div>
                                    )}
                                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-semibold ${video.isActive
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-500 text-white'
                                        }`}>
                                        {video.isActive ? 'Active' : 'Inactive'}
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-4 space-y-3">
                                    <div>
                                        <h3 className="font-semibold text-slate-900 dark:text-white line-clamp-2 leading-tight">
                                            {video.title}
                                        </h3>
                                        {video.categoryName && (
                                            <p className="text-xs text-slate-500 mt-1">{video.categoryName}</p>
                                        )}
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-4 text-xs text-slate-500">
                                        <div className="flex items-center gap-1">
                                            <Eye className="w-4 h-4" />
                                            {video.viewsCount}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Heart className="w-4 h-4" />
                                            {video.likesCount}
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Share2 className="w-4 h-4" />
                                            {video.sharesCount}
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                                        <button
                                            onClick={() => setEditingVideo(video)}
                                            className="flex-1 px-4 py-2 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                                        >
                                            <Edit2 className="w-4 h-4" />
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(video.id)}
                                            disabled={isDeleting === video.id}
                                            className="flex-1 px-4 py-2 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            {isDeleting === video.id ? 'Deleting...' : 'Delete'}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Film className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-blue-100 text-sm">Total Videos</p>
                                <h3 className="text-3xl font-bold">{videos.length}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-pink-600 to-pink-700 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <PlaySquare className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-pink-100 text-sm">Total Reels</p>
                                <h3 className="text-3xl font-bold">{reels.length}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Eye className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-purple-100 text-sm">Total Views</p>
                                <h3 className="text-3xl font-bold">{totalViews}</h3>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                                <Heart className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-emerald-100 text-sm">Total Likes</p>
                                <h3 className="text-3xl font-bold">{totalLikes}</h3>
                            </div>
                        </div>
                    </div>
                </div>
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
