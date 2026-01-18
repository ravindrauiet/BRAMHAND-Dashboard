import { db } from '@/lib/db';
import Link from 'next/link';
import { Plus, Film, PlayCircle, Eye, Star } from 'lucide-react';
import { VideoList } from './VideoList';

export default async function VideosPage() {
    const [videos, totalVideos, totalViews, activeVideos, categories] = await Promise.all([
        db.video.findMany({
            where: { type: 'REEL' },
            include: {
                category: true,
                creator: true,
            },
            orderBy: { createdAt: 'desc' },
        }),
        db.video.count({ where: { type: 'REEL' } }),
        db.video.aggregate({ where: { type: 'REEL' }, _sum: { viewsCount: true } }),
        db.video.count({ where: { isActive: true, type: 'REEL' } }),
        db.videoCategory.findMany()
    ]);

    const topVideo = await db.video.findFirst({
        orderBy: { viewsCount: 'desc' },
        select: { title: true, viewsCount: true }
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 transition-colors duration-300">Reels Library</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage, track, and curate your short video content</p>
                </div>
                <Link
                    href="/dashboard/reels/new"
                    className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-200 font-medium"
                >
                    <Plus className="h-5 w-5" />
                    <span>Upload Reel</span>
                </Link>
            </div>

            {/* Analytics Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-500/10 rounded-xl text-blue-600 dark:text-blue-400">
                        <Film className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Reels</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalVideos}</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-indigo-100 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                        <PlayCircle className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Views</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalViews._sum.viewsCount?.toLocaleString() || 0}</p>
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
                        <p className="text-xs text-slate-500">{topVideo?.viewsCount.toLocaleString()} views</p>
                    </div>
                </div>
            </div>

            <VideoList videos={videos} categories={categories} />
        </div>
    );
}
