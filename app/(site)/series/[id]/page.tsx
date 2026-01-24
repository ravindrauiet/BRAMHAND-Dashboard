import { fetchPublicApi } from '@/lib/api';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Calendar, Users, Layers, Clock } from 'lucide-react';

export default async function SeriesDetailPage({ params }: { params: { id: string } }) {
    const data = await fetchPublicApi(`/series/${params.id}`);

    if (!data.success || !data.series) {
        notFound();
    }

    const { series } = data;
    const { episodes } = series;

    // Helper to format duration
    const formatDuration = (seconds: number) => {
        if (!seconds) return '0m';
        const mins = Math.floor(seconds / 60);
        return `${mins}m`;
    };

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-black">
            <PublicNavbar />

            {/* Hero Section */}
            <div className="relative h-[60vh] w-full bg-slate-900">
                {series.cover_image_url ? (
                    <Image
                        src={series.cover_image_url}
                        alt={series.title}
                        fill
                        className="object-cover opacity-60"
                        priority
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-slate-900 opacity-80" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />

                <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-12 lg:p-16 max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row gap-8 items-end">
                        {/* Poster */}
                        <div className="w-48 aspect-[2/3] relative rounded-xl overflow-hidden shadow-2xl border border-white/10 hidden md:block">
                            <Image
                                src={series.thumbnail_url || '/placeholder-thumb.jpg'}
                                alt={series.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        {/* Info */}
                        <div className="flex-1 space-y-4 pb-4">
                            <div className="flex items-center gap-3 text-sm font-medium text-purple-400">
                                <span className="bg-purple-500/20 px-3 py-1 rounded-full border border-purple-500/30 uppercase tracking-wider backdrop-blur-sm">
                                    Series // {series.categoryName || 'General'}
                                </span>
                                {series.is_featured && (
                                    <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full border border-amber-500/30 uppercase tracking-wider backdrop-blur-sm">
                                        Featured
                                    </span>
                                )}
                            </div>

                            <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
                                {series.title}
                            </h1>

                            <p className="text-lg text-slate-300 max-w-2xl line-clamp-3">
                                {series.description}
                            </p>

                            <div className="flex gap-6 text-sm text-slate-400">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    {series.creatorName || 'Unknown Creator'}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Layers className="w-4 h-4" />
                                    {episodes?.length || 0} Episodes
                                </div>
                                <div className="flex items-center gap-2">
                                    <Calendar className="w-4 h-4" />
                                    {new Date(series.created_at).getFullYear()}
                                </div>
                            </div>

                            <div className="pt-4 flex gap-4">
                                {episodes && episodes.length > 0 ? (
                                    <Link
                                        href={`/watch/${episodes[0].id}`}
                                        className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform"
                                    >
                                        <Play className="w-5 h-5 fill-current" />
                                        Start Watching
                                    </Link>
                                ) : (
                                    <button disabled className="bg-slate-700 text-slate-400 px-8 py-3 rounded-full font-bold cursor-not-allowed">
                                        Coming Soon
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Episodes List */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 py-16">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-8 flex items-center gap-2">
                    <Layers className="w-6 h-6 text-purple-500" />
                    Episodes
                </h2>

                <div className="grid gap-6">
                    {episodes && episodes.map((episode: any) => (
                        <Link
                            key={episode.id}
                            href={`/watch/${episode.id}`}
                            className="group flex flex-col sm:flex-row gap-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl hover:border-purple-500 dark:hover:border-purple-500/50 transition-colors shadow-sm"
                        >
                            {/* Thumbnail */}
                            <div className="relative w-full sm:w-64 aspect-video rounded-xl overflow-hidden bg-slate-800 flex-shrink-0">
                                <Image
                                    src={episode.thumbnailUrl || '/placeholder-thumb.jpg'}
                                    alt={episode.title}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform scale-75 group-hover:scale-100">
                                        <Play className="w-6 h-6 text-white fill-current" />
                                    </div>
                                </div>
                                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded font-medium">
                                    {formatDuration(episode.duration)}
                                </div>
                            </div>

                            {/* Details */}
                            <div className="flex-1 py-1">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-purple-600 transition-colors">
                                            {episode.seasonNumber > 0 && `S${episode.seasonNumber} `}
                                            {episode.episodeNumber > 0 && `E${episode.episodeNumber} • `}
                                            {episode.title}
                                        </h3>
                                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2 line-clamp-2">
                                            {episode.description || 'No description available for this episode.'}
                                        </p>
                                    </div>
                                    <div className="text-right flex-shrink-0">
                                        <span className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Views</span>
                                        <span className="block font-medium text-slate-900 dark:text-white">{episode.viewsCount || 0}</span>
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-4 text-xs font-medium text-slate-500">
                                    <div className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5" />
                                        {new Date(episode.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                    {!episodes?.length && (
                        <div className="p-12 text-center bg-slate-100 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
                            <p className="text-slate-500">No episodes have been released for this series yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
