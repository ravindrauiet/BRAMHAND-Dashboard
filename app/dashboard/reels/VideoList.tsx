'use client';

import { useState } from 'react';
import { Edit, Trash2, Eye, EyeOff, Play, Film, Search, Filter, ThumbsUp, TrendingUp, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { VideoPlayerModal } from '@/components/VideoPlayerModal';
import { deleteVideo, toggleVideoStatus } from '@/app/dashboard/videos/actions';

interface VideoListProps {
    videos: any[];
    categories: any[];
}

export function VideoList({ videos, categories }: VideoListProps) {
    const [previewVideo, setPreviewVideo] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('all');

    const filteredVideos = videos.filter(video => {
        const matchesSearch = video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.creator.fullName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'all' || video.category.id.toString() === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="space-y-8">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search reels by title or creator..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-pink-500 text-slate-900 dark:text-white transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-pink-500 text-slate-900 dark:text-white min-w-[200px]"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="all">All Categories</option>
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Grid Layout */}
            {filteredVideos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredVideos.map((video) => (
                        <div key={video.id} className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:border-pink-500/30 transition-all duration-300 flex flex-col h-full">
                            {/* Thumbnail / Video Preview */}
                            <div
                                className="relative aspect-[9/16] bg-slate-100 dark:bg-slate-800 cursor-pointer overflow-hidden"
                                onClick={() => setPreviewVideo(video.videoUrl)}
                            >
                                {video.thumbnailUrl ? (
                                    <Image
                                        src={video.thumbnailUrl}
                                        alt={video.title}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                                        <Film className="w-12 h-12 mb-2 opacity-50" />
                                        <span className="text-xs font-medium">No Preview</span>
                                    </div>
                                )}

                                {/* Overlay Gradient */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
                                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/50 text-white">
                                        <Play className="w-5 h-5 fill-current ml-0.5" />
                                    </div>
                                </div>

                                {/* Top Badges */}
                                <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                                    <div className="flex flex-col gap-1">
                                        <span className={`self-start px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md border ${video.isActive ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-rose-500/20 text-rose-300 border-rose-500/30'}`}>
                                            {video.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                        {video.isFeatured && (
                                            <span className="self-start px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                                Featured
                                            </span>
                                        )}
                                        {video.isTrending && (
                                            <span className="self-start px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                                Trending
                                            </span>
                                        )}
                                    </div>

                                    {/* Action Menu (Visible on Hover) */}
                                    <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                        <Link
                                            href={`/dashboard/videos/${video.id}`}
                                            className="p-2 bg-white/20 hover:bg-white text-white hover:text-blue-600 rounded-full backdrop-blur-md transition-all shadow-lg"
                                            onClick={(e) => e.stopPropagation()}
                                            title="Edit Reel"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </Link>
                                        <form action={toggleVideoStatus.bind(null, video.id, !video.isActive)} onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className={`p-2 rounded-full backdrop-blur-md transition-all shadow-lg ${video.isActive ? 'bg-white/20 hover:bg-white text-white hover:text-amber-600' : 'bg-white/20 hover:bg-white text-white hover:text-emerald-600'}`}
                                                title={video.isActive ? "Deactivate" : "Activate"}
                                            >
                                                {video.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                            </button>
                                        </form>
                                        <form action={deleteVideo.bind(null, video.id)} onClick={(e) => e.stopPropagation()}>
                                            <button
                                                className="p-2 bg-white/20 hover:bg-white text-white hover:text-red-600 rounded-full backdrop-blur-md transition-all shadow-lg"
                                                title="Delete Reel"
                                                onClick={(e) => {
                                                    if (!confirm('Are you sure you want to delete this reel?')) {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </form>
                                    </div>
                                </div>

                                {/* Bottom Info (Overlay) */}
                                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
                                    <h3 className="text-white font-bold text-sm line-clamp-2 mb-2 group-hover:text-pink-400 transition-colors">
                                        {video.title}
                                    </h3>

                                    <div className="flex items-center justify-between text-[11px] text-white/80 mb-2">
                                        <span className="flex items-center gap-1">
                                            <Eye className="w-3 h-3" /> {video.viewsCount.toLocaleString()}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <ThumbsUp className="w-3 h-3" /> {video.likesCount.toLocaleString()}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                                        {video.creator.image ? (
                                            <Image
                                                src={video.creator.image}
                                                width={20}
                                                height={20}
                                                alt={video.creator.fullName}
                                                className="rounded-full ring-1 ring-white/50"
                                            />
                                        ) : (
                                            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-[8px] font-bold text-white ring-1 ring-white/50">
                                                {video.creator.fullName.charAt(0)}
                                            </div>
                                        )}
                                        <span className="text-xs text-white/90 truncate flex-1">
                                            {video.creator.fullName}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                /* Empty State */
                <div className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="p-6 bg-white dark:bg-slate-800 rounded-full shadow-xl mb-4">
                        <Film className="w-12 h-12 text-slate-300 dark:text-slate-600" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No Reels Found</h3>
                    <p className="text-slate-500 dark:text-slate-400 text-center max-w-md">
                        We couldn't find any reels matching your criteria. Try adjusting your filters or upload a new reel.
                    </p>
                    <button
                        onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}
                        className="mt-6 text-pink-600 font-medium hover:text-pink-700 hover:underline"
                    >
                        Clear Filters
                    </button>
                </div>
            )}

            <VideoPlayerModal
                videoUrl={previewVideo || ''}
                isOpen={!!previewVideo}
                onClose={() => setPreviewVideo(null)}
            />
        </div>
    );
}
