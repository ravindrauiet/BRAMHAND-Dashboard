import { fetchFromApi } from '@/lib/api';
import Link from 'next/link';
import { Plus, Film, Layers } from 'lucide-react';
import { SeriesList } from './SeriesList';

export default async function SeriesPage() {
    const data = await fetchFromApi('/series');
    const series = data.series || [];

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

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-purple-100 dark:bg-purple-500/10 rounded-xl text-purple-600 dark:text-purple-400">
                        <Layers className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Series</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{series.length}</p>
                    </div>
                </div>
            </div>

            <SeriesList series={series} />
        </div>
    );
}
