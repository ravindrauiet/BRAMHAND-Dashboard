'use client';

import { useState } from 'react';
import { Edit, Trash2, Eye, EyeOff, Play, Film, Search, Filter, ThumbsUp, MessageCircle, Share2, MoreVertical, TrendingUp, Star } from 'lucide-react';
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
        <div className="space-y-6">
            {/* Filters Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search videos by title or creator..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 dark:text-white min-w-[200px]"
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

            <div className="bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden transition-all duration-300">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 dark:bg-slate-800/50 border-b border-gray-200 dark:border-slate-700">
                            <tr>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Content</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Metrics</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">State</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider">Status</th>
                                <th className="px-6 py-4 font-medium text-slate-500 dark:text-slate-400 uppercase text-xs tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                            {filteredVideos.map((video) => (
                                <tr key={video.id} className="group hover:bg-gray-50 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-4 max-w-[300px]">
                                        <div className="flex items-start space-x-4">
                                            <div
                                                className="relative w-28 h-16 flex-shrink-0 rounded-lg overflow-hidden cursor-pointer group-hover:ring-2 ring-blue-500/50 transition-all shadow-md bg-slate-100 dark:bg-slate-800"
                                                onClick={() => setPreviewVideo(video.videoUrl)}
                                            >
                                                {video.thumbnailUrl ? (
                                                    <Image
                                                        src={video.thumbnailUrl}
                                                        alt={video.title}
                                                        fill
                                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center">
                                                        <Film className="w-6 h-6 text-slate-400" />
                                                    </div>
                                                )}
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Play className="w-4 h-4 text-white fill-current" />
                                                </div>
                                                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[10px] px-1 rounded">
                                                    {video.contentRating}
                                                </span>
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-semibold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1" title={video.title}>
                                                    {video.title}
                                                </h3>
                                                <div className="flex flex-wrap gap-2 mt-1">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
                                                        {video.category.name}
                                                    </span>
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-300 dark:bg-blue-600"></span>
                                                        {video.creator.fullName}
                                                    </span>
                                                    {video.type === 'REEL' && (
                                                        <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-pink-100 text-pink-700 border border-pink-200 dark:bg-pink-900/30 dark:text-pink-400 dark:border-pink-800">
                                                            REEL
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
                                            <div className="flex flex-col items-center gap-1" title="Views">
                                                <Eye className="w-4 h-4 text-slate-400" />
                                                <span>{video.viewsCount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1" title="Likes">
                                                <ThumbsUp className="w-4 h-4 text-slate-400" />
                                                <span>{video.likesCount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex flex-col items-center gap-1" title="Shares">
                                                <Share2 className="w-4 h-4 text-slate-400" />
                                                <span>{video.sharesCount.toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col gap-1.5 items-start">
                                            {video.isTrending && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20">
                                                    <TrendingUp className="w-3 h-3" /> Trending
                                                </span>
                                            )}
                                            {video.isFeatured && (
                                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700 dark:bg-purple-500/10 dark:text-purple-400 border border-purple-200 dark:border-purple-500/20">
                                                    <Star className="w-3 h-3" /> Featured
                                                </span>
                                            )}
                                            {!video.isTrending && !video.isFeatured && (
                                                <span className="text-xs text-slate-400 italic">Standard</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${video.isActive
                                                ? 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20'
                                                : 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20'
                                                }`}
                                        >
                                            <span className={`w-1.5 h-1.5 rounded-full ${video.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                            {video.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <form action={toggleVideoStatus.bind(null, video.id, !video.isActive)}>
                                                <button
                                                    className={`p-2 rounded-lg transition-colors ${video.isActive ? 'text-slate-400 hover:text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10' : 'text-slate-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10'}`}
                                                    title={video.isActive ? "Deactivate" : "Activate"}
                                                >
                                                    {video.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                                </button>
                                            </form>
                                            <Link href={`/dashboard/videos/${video.id}`} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors" title="Edit">
                                                <Edit className="w-4 h-4" />
                                            </Link>
                                            <form action={deleteVideo.bind(null, video.id)}>
                                                <button className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors" title="Delete">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredVideos.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <Film className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                        <p className="text-lg font-medium">No videos found</p>
                                        <p className="text-sm">Try adjusting your search or filters</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <VideoPlayerModal
                videoUrl={previewVideo || ''}
                isOpen={!!previewVideo}
                onClose={() => setPreviewVideo(null)}
            />
        </div>
    );
}
