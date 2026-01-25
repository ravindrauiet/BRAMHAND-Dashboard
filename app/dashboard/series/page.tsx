import { fetchFromApi } from '@/lib/api';
import Link from 'next/link';
import { Plus, Film, Layers } from 'lucide-react';
import { SeriesList } from './SeriesList';

export default async function SeriesPage() {
    const data = await fetchFromApi('/series');
    const series = data.series || [];

    // Calculate Aggregate Stats
    const totalSeries = series.length;
    const activeSeries = series.filter((s: any) => s.isActive).length;
    const totalViews = series.reduce((acc: number, s: any) => acc + (Number(s.totalViews) || 0), 0);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Series Library</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage your episodic content collections</p>
                </div>
                <Link
                    href="/dashboard/series/new"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 font-medium"
                >
                    <Plus className="h-5 w-5" />
                    <span>Create Series</span>
                </Link>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4 border border-slate-100 dark:border-slate-800">
                    <div className="p-3 bg-purple-100 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Series</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalSeries}</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4 border border-slate-100 dark:border-slate-800">
                    <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                        <Film className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Series Views</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalViews.toLocaleString()}</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4 border border-slate-100 dark:border-slate-800">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Active Series</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeSeries}</p>
                    </div>
                </div>
            </div>

            <SeriesList series={series.map((s: any) => ({
                id: s.id,
                title: s.title,
                description: s.description,
                thumbnailUrl: s.thumbnail_url,
                coverImageUrl: s.cover_image_url,
                categoryName: s.categoryName,
                creatorName: s.creatorName,
                isActive: !!s.is_active,
                isFeatured: !!s.is_featured,
                episodeCount: s.episodeCount || 0,
                totalViews: s.totalViews || 0,
                createdAt: s.created_at
            }))} />
        </div>
    );
}
