import { fetchFromApi } from '@/lib/api';
import Link from 'next/link';
import { Plus, Film, PlayCircle, Eye, Star } from 'lucide-react';
import { VideoList } from './VideoList';

export default async function VideosPage() {
    // 1. Fetch data from API instead of DB
    const data = await fetchFromApi('/admin/videos?type=VIDEO');
    const statsData = await fetchFromApi('/admin/stats'); // Re-use stats for totals

    if (!data.success || !statsData.success) {
        return <div>Error loading videos</div>;
    }

    const videos = data.videos.map((v: any) => ({
        ...v,
        category: { name: v.categoryName },
        creator: { fullName: v.creatorName }
    }));

    // Derive stats from API data or simple calculations for now
    // Ideally backend gives us these stats directly in the /videos endpoint or /stats
    const totalVideos = statsData.videoCount;
    const totalViews = statsData.totalViews;
    const activeVideos = videos.filter((v: any) => v.isActive).length;

    // Simplistic top video logic for frontend (or backend can provide)
    const topVideo = videos.reduce((prev: any, current: any) => (prev.viewsCount > current.viewsCount) ? prev : current, videos[0]);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 transition-colors duration-300">Video Library</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage, track, and curate your video content</p>
                </div>
                <Link
                    href="/dashboard/videos/new"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 font-medium"
                >
                    <Plus className="h-5 w-5" />
                    <span>Upload Video</span>
                </Link>
            </div>

            {/* Analytics Header - Same UI, different data source */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                        <Film className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Videos</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalVideos}</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <PlayCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Views</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalViews.toLocaleString()}</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                        <Eye className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Active Content</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeVideos}</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-amber-400">
                    <div className="p-3 bg-amber-100 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                        <Star className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Top Performer</p>
                        <p className="text-lg font-bold text-slate-900 dark:text-white line-clamp-1" title={topVideo?.title}>
                            {topVideo?.title || 'N/A'}
                        </p>
                        <p className="text-xs text-slate-500">{topVideo?.viewsCount?.toLocaleString() || 0} views</p>
                    </div>
                </div>
            </div>

            <VideoList videos={videos} categories={[]} />
        </div>
    );
}
