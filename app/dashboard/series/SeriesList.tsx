'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { MoreVertical, Edit, Trash2, Eye, PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface SeriesListProps {
    series: any[];
}

export function SeriesList({ series }: SeriesListProps) {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredSeries = series.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
                <input
                    type="text"
                    placeholder="Search series..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-900 dark:text-white placeholder-slate-400"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSeries.map((item) => (
                    <div key={item.id} className="group glass-card rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-800">
                        <div className="relative aspect-[2/3] bg-slate-100 dark:bg-slate-800">
                            {item.thumbnailUrl ? (
                                <Image
                                    src={item.thumbnailUrl}
                                    alt={item.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                                    <FilmIcon className="w-12 h-12" />
                                </div>
                            )}

                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                <h3 className="text-lg font-bold text-white line-clamp-1">{item.title}</h3>
                                <p className="text-white/80 text-sm line-clamp-1">{item.categoryName}</p>

                                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-white/20">
                                    <Link
                                        href={`/dashboard/series/${item.id}`}
                                        className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2 rounded-lg text-center text-sm font-medium backdrop-blur-sm transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Edit className="w-4 h-4" /> Edit
                                    </Link>
                                </div>
                            </div>

                            <div className="absolute top-2 right-2">
                                {item.isActive ? (
                                    <span className="bg-emerald-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">Active</span>
                                ) : (
                                    <span className="bg-slate-500/90 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm">Inactive</span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {filteredSeries.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    No series found matching your search.
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
