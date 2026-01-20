import { fetchFromApi } from '@/lib/api';
import Link from 'next/link';
import { Plus, Music, Mic2, Disc, Star } from 'lucide-react';
import { SongList } from './SongList';

export default async function SongsPage() {
    // 1. Fetch from API
    const data = await fetchFromApi('/admin/songs');
    const statsData = await fetchFromApi('/admin/stats');

    // Ideally fetch genres too if needed for filtering
    // const genresData = await fetchFromApi('/admin/genres/music');

    if (!data.success || !statsData.success) {
        return <div>Error loading songs</div>;
    }

    const songs = data.songs.map((s: any) => ({
        id: s.id,
        title: s.title,
        description: s.description,
        fileUrl: s.file_url,
        thumbnailUrl: s.thumbnail_url,
        duration: s.duration,
        fileSize: s.file_size,
        viewsCount: s.views_count || 0,
        likesCount: s.likes_count || 0,
        sharesCount: s.shares_count || 0,
        downloadsCount: s.downloads_count || 0,
        isActive: !!s.is_active,
        isFeatured: !!s.is_featured,
        isTrending: !!s.is_trending,
        createdAt: s.created_at,
        genre: {
            id: s.genre_id,
            name: s.genre_name || 'Unknown'
        },
        creator: {
            id: s.creator_id,
            fullName: s.creator_name || 'Unknown',
            image: s.creator_image
        }
    }));

    const activeSongs = songs.filter((s: any) => s.isActive).length;
    const totalSongs = statsData.songCount;

    const genreCounts: { [key: string]: number } = {};
    songs.forEach((s: any) => {
        const name = s.genre?.name || 'Unknown';
        genreCounts[name] = (genreCounts[name] || 0) + 1;
    });

    let topGenre = 'N/A';
    let maxCount = 0;
    Object.entries(genreCounts).forEach(([name, count]) => {
        if (count > maxCount) {
            maxCount = count;
            topGenre = name;
        }
    });

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 transition-colors duration-300">Music Library</h1>
                    <p className="text-slate-500 dark:text-slate-400">Manage, organize, and curate your audio content</p>
                </div>
                <Link
                    href="/dashboard/songs/new"
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2.5 rounded-xl flex items-center space-x-2 hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-200 font-medium"
                >
                    <Plus className="h-5 w-5" />
                    <span>Upload Song</span>
                </Link>
            </div>

            {/* Analytics Header */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-pink-100 dark:bg-pink-500/10 rounded-xl text-pink-600 dark:text-pink-400">
                        <Music className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Total Tracks</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{totalSongs}</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-violet-100 dark:bg-violet-500/10 rounded-xl text-violet-600 dark:text-violet-400">
                        <Disc className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Top Genre</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">{topGenre}</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4">
                    <div className="p-3 bg-emerald-100 dark:bg-emerald-500/10 rounded-xl text-emerald-600 dark:text-emerald-400">
                        <Mic2 className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Active Content</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{activeSongs}</p>
                    </div>
                </div>
                <div className="glass-card p-6 rounded-2xl flex items-center space-x-4 border-l-4 border-amber-400">
                    <div className="p-3 bg-amber-100 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                        <Star className="w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Most Featured</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1">
                            {songs.filter((s: any) => s.isFeatured).length} Tracks
                        </p>
                    </div>
                </div>
            </div>

            <SongList songs={songs} genres={[]} />
        </div>
    );
}
