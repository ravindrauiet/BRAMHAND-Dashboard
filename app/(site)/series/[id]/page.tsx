import { fetchPublicApi } from '@/lib/api';
import { PublicNavbar } from '@/components/site/PublicNavbar';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Plus, Share2, ThumbsUp, ChevronDown, Info } from 'lucide-react';

export default async function SeriesDetailPage({ params }: { params: { id: string } }) {
    const data = await fetchPublicApi(`/series/${params.id}`);

    if (!data || !data.success || !data.series) {
        notFound();
    }

    const { series } = data;
    const { episodes } = series;

    const bgImage = series.cover_image_url || series.coverImageUrl;
    const thumbImage = series.thumbnail_url || series.thumbnailUrl;

    return (
        <div className="min-h-screen bg-[#0f171e] text-zinc-100 font-sans selection:bg-pink-500 selection:text-white">
            <PublicNavbar />

            {/* IMMERSIVE HERO - Full Viewport with Vignette */}
            <div className="relative h-[85vh] w-full overflow-hidden group">
                <div className="absolute inset-0">
                    {bgImage ? (
                        <Image
                            src={bgImage}
                            alt={series.title}
                            fill
                            className="object-cover object-top transition-transform duration-[20s] ease-linear group-hover:scale-110"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-black" />
                    )}
                    {/* Multi-layered Gradients for readability and depth */}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f171e] via-[#0f171e]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0f171e] via-[#0f171e]/40 to-transparent lg:via-[#0f171e]/10" />
                </div>

                <div className="absolute inset-x-0 bottom-0 top-0 flex items-end pb-12 lg:pb-24">
                    <div className="w-full max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 grid lg:grid-cols-[1fr_400px] gap-12 items-end">

                        {/* LEFT: Content Info */}
                        <div className="space-y-6 max-w-4xl animate-in slide-in-from-left-10 duration-1000 fade-in">
                            {/* Series Logo or Title */}
                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-400 drop-shadow-2xl">
                                {series.title}
                            </h1>

                            {/* Metadata Pills */}
                            <div className="flex flex-wrap items-center gap-4 text-sm md:text-base font-medium text-zinc-300">
                                <span className="text-green-400 font-bold tracking-wide">98% Match</span>
                                <span className="text-zinc-400">2024</span>
                                <span className="px-2 py-0.5 border border-zinc-600 rounded text-xs bg-zinc-800/50 backdrop-blur-sm">U/A 16+</span>
                                <span>{series.episodes?.length || 0} Episodes</span>
                                <span className="px-2 py-0.5 bg-pink-600 text-white text-xs font-bold rounded uppercase tracking-wider">{series.categoryName || 'Drama'}</span>
                            </div>

                            {/* Description */}
                            <p className="text-lg md:text-xl text-zinc-300 leading-relaxed max-w-2xl line-clamp-3 md:line-clamp-4 drop-shadow-md font-light">
                                {series.description || "A captivating story that unfolds with every episode. Watch the drama, the suspense, and the emotion in this premium original series."}
                            </p>

                            {/* Actions Toolbar */}
                            <div className="flex flex-wrap items-center gap-4 pt-4">
                                {episodes && episodes.length > 0 ? (
                                    <Link
                                        href={`/watch/${episodes[0].id}`}
                                        className="h-14 px-8 rounded bg-white text-black font-bold text-lg flex items-center gap-3 hover:bg-zinc-200 transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                                    >
                                        <Play className="w-6 h-6 fill-current" />
                                        <span>Watch Season 1</span>
                                    </Link>
                                ) : (
                                    <button disabled className="h-14 px-8 rounded bg-zinc-800 text-zinc-500 font-bold text-lg cursor-not-allowed border border-zinc-700">
                                        Coming Soon
                                    </button>
                                )}

                                <button className="h-14 w-14 rounded-full bg-zinc-800/60 backdrop-blur-md border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors group/btn" title="Add to Watchlist">
                                    <Plus className="w-6 h-6 group-hover/btn:rotate-90 transition-transform" />
                                </button>
                                <button className="h-14 w-14 rounded-full bg-zinc-800/60 backdrop-blur-md border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors" title="Like">
                                    <ThumbsUp className="w-6 h-6" />
                                </button>
                                <button className="h-14 w-14 rounded-full bg-zinc-800/60 backdrop-blur-md border border-zinc-700 flex items-center justify-center text-white hover:bg-zinc-700 transition-colors" title="Share">
                                    <Share2 className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* TABS & LIST SECTION */}
            <div className="max-w-[1920px] mx-auto px-4 sm:px-8 lg:px-12 py-8 min-h-screen">

                {/* Fake Tabs for Aesthetics */}
                <div className="flex items-center gap-8 border-b border-zinc-800 mb-8 overflow-x-auto">
                    <button className="pb-4 text-lg font-bold text-white border-b-2 border-pink-500 flex-shrink-0">
                        Episodes
                    </button>
                    <button className="pb-4 text-lg font-medium text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0">
                        More Like This
                    </button>
                    <button className="pb-4 text-lg font-medium text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0">
                        Trailers & More
                    </button>
                    <button className="pb-4 text-lg font-medium text-zinc-500 hover:text-zinc-300 transition-colors flex-shrink-0">
                        Details
                    </button>
                </div>

                <div className="grid lg:grid-cols-[1fr_350px] gap-12">
                    {/* Main: Episodes List */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold flex items-center gap-2">Season 1 <ChevronDown className="w-4 h-4" /></h3>
                            <span className="text-sm text-zinc-500">{episodes?.length || 0} Episodes</span>
                        </div>

                        <div className="space-y-4">
                            {episodes && episodes.map((episode: any, index: number) => (
                                <Link
                                    href={`/watch/${episode.id}`}
                                    key={episode.id}
                                    className="group flex gap-4 md:gap-6 p-4 rounded-xl hover:bg-zinc-800/40 border border-transparent hover:border-zinc-700 transition-all duration-300"
                                >
                                    {/* Thumbnail */}
                                    <div className="relative w-32 md:w-56 aspect-video bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0 group-hover:shadow-lg group-hover:shadow-pink-900/10 transition-shadow">
                                        <Image
                                            src={episode.thumbnailUrl || '/placeholder-thumb.jpg'}
                                            alt={episode.title}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Play className="w-8 h-8 text-white fill-current" />
                                        </div>
                                    </div>

                                    {/* Meta */}
                                    <div className="flex-1 py-1 flex flex-col justify-center">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-base md:text-lg font-bold text-zinc-100 group-hover:text-pink-400 transition-colors line-clamp-1">
                                                {index + 1}. {episode.title}
                                            </h4>
                                            <span className="text-xs font-medium text-zinc-500 md:ml-4 flex-shrink-0">
                                                {Math.floor(episode.duration / 60)}m
                                            </span>
                                        </div>
                                        <p className="text-sm text-zinc-400 mt-2 line-clamp-2 leading-relaxed hidden md:block">
                                            {episode.description || "Episode description not available. Watch to find out what happens next in this exciting series."}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                            {!episodes?.length && (
                                <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
                                    <Info className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                                    <p className="text-zinc-500">No episodes available yet.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar: Cast & Info */}
                    <div className="space-y-8">
                        <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800/50">
                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Cast & Crew</h4>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden relative">
                                        {/* Placeholder or real avatar */}
                                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-zinc-400">DIR</div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">{series.creatorName || 'Unknown'}</p>
                                        <p className="text-xs text-zinc-500">Director</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-zinc-700 overflow-hidden relative">
                                        {/* Mock Actor */}
                                        <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-zinc-400">ACT</div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-white">Ravi Kishan</p>
                                        <p className="text-xs text-zinc-500">Lead Actor</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900/30 p-6 rounded-xl border border-zinc-800/50">
                            <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">About</h4>
                            <div className="text-sm text-zinc-400 space-y-2">
                                <div className="flex justify-between">
                                    <span>Released</span>
                                    <span className="text-zinc-200">2024</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Genre</span>
                                    <span className="text-zinc-200">{series.categoryName}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Language</span>
                                    <span className="text-zinc-200">Hindi, Maithili</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
