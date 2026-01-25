'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MoreVertical, Edit, Trash2, Eye, PlayCircle, Search, Filter, Layers, TrendingUp, Calendar, Hash } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Series {
    id: number;
    title: string;
    description: string;
    thumbnailUrl: string;
    coverImageUrl: string;
    categoryName: string;
    creatorName: string;
    isActive: boolean;
    isFeatured: boolean;
    episodeCount: number;
    totalViews: number;
    createdAt: string;
}

interface SeriesListProps {
    series: Series[];
}

export function SeriesList({ series }: SeriesListProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'active', 'inactive', 'featured'

    const filteredSeries = series.filter(s => {
        const matchesSearch = s.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter =
            filter === 'all' ? true :
                filter === 'active' ? s.isActive :
                    filter === 'inactive' ? !s.isActive :
                        filter === 'featured' ? s.isFeatured : true;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-8">
            {/* Filters & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4 bg-white/80 dark:bg-slate-900/50 backdrop-blur-xl border border-gray-200 dark:border-slate-800 p-4 rounded-xl shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search series by title..."
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="w-5 h-5 text-slate-400" />
                    <select
                        className="px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-purple-500 text-slate-900 dark:text-white min-w-[160px] cursor-pointer"
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                    >
                        <option value="all">All Series</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="featured">Featured</option>
                    </select>
                </div>
            </div>

            {/* Series Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSeries.map((item) => (
                    <div key={item.id} className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 hover:shadow-2xl hover:border-purple-500/30 transition-all duration-300 flex flex-col h-full">

                        {/* Thumbnail / Cover */}
                        <div className="relative aspect-[3/4] overflow-hidden bg-slate-100 dark:bg-slate-800">
                            {item.thumbnailUrl ? (
                                <Image
                                    src={item.thumbnailUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                                    <Layers className="w-12 h-12 mb-2 opacity-50" />
                                    <span className="text-xs font-medium">No Thumbnail</span>
                                </div>
                            )}

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                            {/* Top Badges */}
                            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                                <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${item.isActive
                                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                    }`}>
                                    {item.isActive ? 'Active' : 'Inactive'}
                                </span>
                                {item.isFeatured && (
                                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                        Featured
                                    </span>
                                )}
                            </div>

                            {/* Hover Actions */}
                            <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 scale-90 group-hover:scale-100">
                                <Link
                                    href={`/dashboard/series/${item.id}`}
                                    className="p-3 bg-white/20 hover:bg-white text-white hover:text-purple-600 rounded-full backdrop-blur-md transition-all shadow-lg hover:shadow-purple-500/50"
                                    title="Edit Series"
                                >
                                    <Edit className="w-5 h-5" />
                                </Link>
                                {/* Add Toggle Status Action Here if needed */}
                            </div>

                            {/* Category Badge */}
                            <div className="absolute bottom-3 right-3">
                                <span className="px-2 py-1 rounded-lg text-xs font-medium bg-white/10 text-white backdrop-blur-md border border-white/10">
                                    {item.categoryName || 'Uncategorized'}
                                </span>
                            </div>
                        </div>

                        {/* Content Info */}
                        <div className="p-5 flex-1 flex flex-col">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                                {item.title}
                            </h3>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mb-4">
                                <span className="flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    {item.creatorName || 'Unknown Creator'}
                                </span>
                                <span>•</span>
                                <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                    <div className="p-1.5 rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                                        <Layers className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Episodes</span>
                                        <span className="text-sm font-bold">{item.episodeCount || 0}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                    <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                                        <Eye className="w-3.5 h-3.5" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] text-slate-400 uppercase font-semibold">Views</span>
                                        <span className="text-sm font-bold">{(item.totalViews || 0).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {filteredSeries.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 px-4 text-center bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                    <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full mb-4">
                        <Layers className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">No series found</h3>
                    <p className="text-slate-500 dark:text-slate-400 max-w-sm mx-auto mb-6">
                        We couldn't find any series matching your search or filters. Try adjusting your criteria.
                    </p>
                    <button
                        onClick={() => { setSearchTerm(''); setFilter('all'); }}
                        className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-medium hover:opacity-90 transition-opacity"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
}

function FilmIcon({ className }: { className?: string }) {
    return (
        <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M7 3v18" />
            <path d="M3 7.5h4" />
            <path d="M3 12h18" />
            <path d="M3 16.5h4" />
            <path d="M17 3v18" />
            <path d="M17 7.5h4" />
            <path d="M17 16.5h4" />
        </svg>
    );
}
