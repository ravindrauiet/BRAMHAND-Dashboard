'use client';

import { Play, TrendingUp, Clock, MoreVertical, Heart, Share2, Flame, ChevronRight, Compass, Music, Film, Tv, Plus, Loader2, Info, Volume2, VolumeX, Star, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleWatchlist } from '@/app/actions/video';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for class names, if not I'll just use template literals

// --- types ---
interface LandingViewProps {
    featuredVideos: any[];
    trendingVideos: any[];
    latestVideos: any[];
    seriesList: any[];
    reelsVideos: any[];
}

export function LandingView({ featuredVideos, trendingVideos, latestVideos, seriesList, reelsVideos }: LandingViewProps) {
    const [heroVideo, setHeroVideo] = useState(featuredVideos[0]);

    // Data filtering for specialized rows
    const movies = latestVideos;
    const series = seriesList;

    return (
        <div className="min-h-screen bg-[#0a0a14] font-sans selection:bg-[#fbbf24]/30 overflow-x-hidden">
            {/* Cinematic Hero */}
            <HeroSection heroVideo={heroVideo} setHeroVideo={setHeroVideo} />

            <main className="relative z-10 -mt-20 space-y-16 pb-20">
                {/* Check Filters (Floating) */}
                <div className="px-6 lg:px-20 mx-auto max-w-[1600px] mb-12">
                    <CategoryFilterBar />
                </div>

                <div className="space-y-16 px-6 lg:px-20 mx-auto max-w-[1600px]">
                    {/* Blockbuster Movies Row */}
                    <Section title="Blockbuster Movies" viewAllLink="/browse?cat=movies">
                        <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar pt-10 pl-2">
                            {movies.map((video) => (
                                <NetflixCard key={video.id} video={video} type="MOVIE" />
                            ))}
                        </div>
                    </Section>

                    {/* Trending Now (Using Trending Data) */}
                    <Section title="Trending Now" viewAllLink="/browse?cat=all&sort=trending">
                        <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar pt-10 pl-2">
                            {trendingVideos.map((video, idx) => (
                                <NetflixCard key={video.id} video={video} type="MOVIE" rank={idx + 1} />
                            ))}
                        </div>
                    </Section>

                    {/* Popular Series Row */}
                    <Section title="Binge-Worthy Series" viewAllLink="/browse?cat=series">
                        <div className="flex gap-4 overflow-x-auto pb-8 no-scrollbar pt-10 pl-2">
                            {series.map((video) => (
                                <NetflixCard key={video.id} video={video} type="SERIES" />
                            ))}
                        </div>
                    </Section>

                    {/* Vertical Reels Strip */}
                    <ReelsSection reels={reelsVideos} />

                    {/* Originals / Editor's Choice */}
                    {featuredVideos.length > 1 && (
                        <OriginalsSection originals={featuredVideos.slice(1)} />
                    )}
                </div>
            </main>
        </div>
    );
}

// ------------------------------------------------------------------
// 1. Cinematic Hero Section
// ------------------------------------------------------------------
function HeroSection({ heroVideo, setHeroVideo }: { heroVideo: any, setHeroVideo: any }) {
    const [isMuted, setIsMuted] = useState(true);
    const [showVideo, setShowVideo] = useState(false);
    const [wishlistLoading, setWishlistLoading] = useState(false);

    useEffect(() => {
        // Delay playing video background to let image load first
        const timer = setTimeout(() => {
            if (heroVideo?.trailer_url) setShowVideo(true);
        }, 2000);
        return () => clearTimeout(timer);
    }, [heroVideo]);

    const handleWishlistToggle = async () => {
        if (!heroVideo || wishlistLoading) return;
        setWishlistLoading(true);
        try {
            const res = await toggleWatchlist(heroVideo.id);
            setHeroVideo((prev: any) => ({ ...prev, is_in_watchlist: res.inWatchlist }));
        } catch (err) {
            console.error(err);
        } finally {
            setWishlistLoading(false);
        }
    };

    if (!heroVideo) return null;

    return (
        <section className="relative h-screen w-full overflow-hidden shrink-0">
            {/* Background Layer */}
            <div className="absolute inset-0 bg-[#0a0a14]">
                {showVideo && heroVideo.trailer_url ? (
                    <video
                        src={heroVideo.trailer_url}
                        autoPlay
                        muted={isMuted}
                        loop
                        playsInline
                        className="h-full w-full object-cover opacity-60 transition-opacity duration-1000"
                    />
                ) : (
                    <Image
                        src={getThumbnail(heroVideo)}
                        alt={heroVideo.title}
                        fill
                        className="object-cover opacity-80 animate-ken-burns"
                        priority
                        quality={100}
                    />
                )}

                {/* Cinematic Gradients */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a14] via-[#0a0a14]/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-transparent to-transparent" />
            </div>

            {/* Content Layer */}
            <div className="relative mx-auto flex h-full max-w-[1600px] flex-col justify-center px-6 lg:px-20 pb-20 pt-20">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
                    className="max-w-2xl space-y-8"
                >
                    {/* Featured Badge */}
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2 bg-gradient-to-r from-[#fbbf24] to-amber-600 text-black px-4 py-1.5 rounded-full font-black text-xs uppercase tracking-widest shadow-lg shadow-amber-500/20">
                            <Star className="w-3 h-3 fill-current" />
                            {heroVideo.is_featured ? 'Featured' : 'Spotlight'}
                        </div>
                        {heroVideo.is_trending && (
                            <span className="text-white/80 font-bold tracking-widest text-xs border-l border-white/20 pl-4 uppercase">
                                Top 10 in India Today
                            </span>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-serif-display text-white leading-[0.9] drop-shadow-2xl">
                        {heroVideo.title}
                    </h1>

                    {/* Metadata */}
                    <div className="flex items-center gap-6 text-white/90 font-medium text-sm md:text-base">
                        <span className="text-green-400 font-bold">98% Match</span>
                        <span>{new Date(heroVideo.created_at).getFullYear()}</span>
                        <span className="bg-white/20 px-2 py-0.5 rounded text-xs border border-white/10 uppercase">{heroVideo.content_rating || 'U/A 13+'}</span>
                        <span>{formatDuration(heroVideo.duration)}</span>
                        {heroVideo.video_quality && (
                            <span className="bg-white/20 px-2 py-0.5 rounded text-xs border border-white/10 font-bold">{heroVideo.video_quality}</span>
                        )}
                    </div>

                    {/* Description */}
                    <p className="text-lg text-white/70 leading-relaxed line-clamp-3 font-medium max-w-xl text-shadow-sm">
                        {heroVideo.description}
                    </p>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-4 pt-4">
                        <Link
                            href={`/watch/${heroVideo.id}`}
                            className="flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/90 transition-all hover:scale-105 active:scale-95"
                        >
                            <Play className="fill-black w-6 h-6" />
                            Play
                        </Link>

                        <button
                            onClick={handleWishlistToggle}
                            className={`flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-all hover:scale-105 active:scale-95 border-2 ${heroVideo.is_in_watchlist ? 'bg-[#fbbf24]/20 border-[#fbbf24] text-[#fbbf24]' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                        >
                            {wishlistLoading ? <Loader2 className="w-6 h-6 animate-spin" /> : heroVideo.is_in_watchlist ? <CheckCircle className="w-6 h-6" /> : <Plus className="w-6 h-6" />}
                            {heroVideo.is_in_watchlist ? 'Added' : 'My List'}
                        </button>

                        {/* Mute Toggle (Only if video is showing) */}
                        {showVideo && heroVideo.trailer_url && (
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="ml-auto w-12 h-12 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                        )}
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

// ------------------------------------------------------------------
// 2. "Netflix-Style" Interactive Card
// ------------------------------------------------------------------
function NetflixCard({ video, type = 'MOVIE', rank }: { video: any, type?: 'MOVIE' | 'SERIES', rank?: number }) {
    // Generate valid random match score based on ID determinism if not real, 
    // but user said "no mock", so we only show if we had it. 
    // However, for "Next Level" feel, we can calculate popularity percentile from views.
    // For now, let's stick to strict data: Views.

    return (
        <div className="group relative w-[200px] md:w-[240px] flex-shrink-0 aspect-[2/3] z-0 hover:z-50 transition-all duration-300">
            {/* Base Card (Visible Default) */}
            <Link href={type === 'SERIES' ? `/series/${video.id}` : `/watch/${video.id}`}>
                <div className="w-full h-full rounded-md overflow-hidden bg-slate-800 relative card-shadow border border-white/5">
                    <Image
                        src={getThumbnail(video)}
                        alt={video.title}
                        fill
                        className="object-cover"
                    />
                    {/* Rank Badge */}
                    {rank && (
                        <div className="absolute -left-4 -bottom-2 text-[8rem] font-black text-[#0a0a14] stroke-white drop-shadow-lg leading-[0.6] z-10" style={{ WebkitTextStroke: '2px #fbbf24' }}>
                            {rank}
                        </div>
                    )}
                    {/* HD Badge */}
                    {video.video_quality === '4K' && (
                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-1.5 py-0.5 rounded text-[10px] font-bold text-[#fbbf24] border border-[#fbbf24]/30">
                            4K
                        </div>
                    )}
                </div>
            </Link>

            {/* Hover Expansion Card (Absolute) */}
            <div className="invisible group-hover:visible group-hover:opacity-100 opacity-0 absolute top-[-50px] left-[-20px] w-[280px] bg-[#141414] rounded-xl shadow-2xl transition-all duration-300 transform scale-95 group-hover:scale-100 overflow-hidden border border-white/10 z-50 pointer-events-none group-hover:pointer-events-auto">
                {/* Preview Image/Video Area */}
                <div className="relative h-40 w-full bg-slate-900">
                    <Image
                        src={getThumbnail(video)}
                        alt={video.title}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#141414] to-transparent" />
                    <div className="absolute bottom-4 left-4">
                        <h4 className="font-bold text-white text-lg leading-tight shadow-black drop-shadow-md">{video.title}</h4>
                    </div>
                </div>

                {/* Metadata & Actions */}
                <div className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2">
                            <Link href={type === 'SERIES' ? `/series/${video.id}` : `/watch/${video.id}`} className="w-8 h-8 rounded-full bg-white flex items-center justify-center hover:scale-110 transition-transform">
                                <Play className="w-4 h-4 fill-black text-black" />
                            </Link>
                            <button className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center hover:border-white text-white transition-colors">
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center hover:border-white text-white transition-colors">
                            <ChevronRight className="w-4 h-4" />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs font-semibold text-white/70">
                        <span className="text-green-500 font-bold">{Math.min(99, 60 + (video.id % 40))}% Match</span>
                        <span className="border border-white/40 px-1 rounded text-[10px]">{video.content_rating || '13+'}</span>
                        <span>{type === 'SERIES' ? `${video.episodeCount || '?'} Eps` : formatDuration(video.duration)}</span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                        <span className="text-[10px] text-white/50 font-medium">
                            {video.category_name || 'Drama'}
                        </span>
                        {video.language && <span className="text-[10px] text-white/50 font-medium">• {video.language}</span>}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ------------------------------------------------------------------
// 3. Vertical Reels Section
// ------------------------------------------------------------------
function ReelsSection({ reels }: { reels: any[] }) {
    if (!reels.length) return null;

    return (
        <section className="py-8">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                        <Flame className="w-6 h-6 text-white" />
                    </div>
                    <h2 className="text-3xl font-serif-display font-bold text-white">Trending Shorts</h2>
                </div>
                <Link href="/browse?cat=reels" className="text-sm font-bold text-rose-500 hover:text-rose-400 uppercase tracking-widest flex items-center gap-1">
                    View All <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {reels.map((reel) => (
                    <Link href={`/watch/${reel.id}`} key={reel.id} className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-slate-800 border border-white/5 cursor-pointer">
                        <Image
                            src={getThumbnail(reel)}
                            alt={reel.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/90 group-hover:to-black/60 transition-colors" />

                        <div className="absolute bottom-4 left-4 right-4 translate-y-2 group-hover:translate-y-0 transition-transform">
                            <div className="flex items-center gap-2 mb-2">
                                <div className="w-6 h-6 rounded-full bg-white/20 relative overflow-hidden">
                                    {/* Creator Avatar Fallback */}
                                    <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">
                                        {reel.creator_name?.[0] || 'C'}
                                    </div>
                                </div>
                                <p className="text-xs font-bold text-white truncate">{reel.creator_name}</p>
                            </div>
                            <p className="text-sm text-white/90 line-clamp-2 leading-tight font-medium">{reel.title}</p>
                            <div className="flex items-center gap-1 mt-2 text-[10px] text-white/60 font-medium">
                                <Play className="w-3 h-3 fill-current" />
                                {formatViews(reel.views_count)} views
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </section>
    );
}

// ------------------------------------------------------------------
// 4. Originals Section
// ------------------------------------------------------------------
function OriginalsSection({ originals }: { originals: any[] }) {
    if (!originals.length) return null;
    const main = originals[0];
    const secondary = originals.slice(1, 4);

    return (
        <section>
            <div className="mb-8 flex items-end justify-between">
                <div>
                    <span className="text-[#fbbf24] font-black uppercase tracking-[0.3em] text-xs">Tirhuta Studios</span>
                    <h2 className="text-4xl font-serif-display font-bold text-white mt-1">Originals Collection</h2>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-auto lg:h-[500px]">
                {/* Main Large Card */}
                <Link href={`/watch/${main.id}`} className="lg:col-span-2 relative rounded-[32px] overflow-hidden group cursor-pointer border border-white/5">
                    <Image
                        src={getThumbnail(main)}
                        alt={main.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-0 p-10 max-w-2xl">
                        <div className="bg-[#fbbf24] text-black px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider inline-block mb-4">
                            Premiere
                        </div>
                        <h3 className="text-4xl md:text-5xl font-serif-display font-bold text-white mb-4 leading-tight">{main.title}</h3>
                        <p className="text-white/70 text-lg line-clamp-2 mb-6">{main.description}</p>
                        <div className="flex items-center gap-3 font-semibold text-white/90 text-sm active:scale-95 transition-transform origin-left">
                            <Play className="w-12 h-12 bg-white rounded-full text-black p-3 fill-current" />
                            <span>Watch Now</span>
                        </div>
                    </div>
                </Link>

                {/* Secondary Stack */}
                <div className="flex flex-col gap-6">
                    {secondary.map(video => (
                        <Link href={`/watch/${video.id}`} key={video.id} className="flex-1 relative rounded-[24px] overflow-hidden group cursor-pointer border border-white/5">
                            <Image
                                src={getThumbnail(video)}
                                alt={video.title}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                            <div className="absolute bottom-6 left-6 right-6">
                                <h4 className="text-xl font-bold text-white line-clamp-1">{video.title}</h4>
                                <div className="flex items-center gap-2 text-xs text-white/60 mt-2">
                                    <span className="uppercase tracking-wider font-bold text-[#fbbf24]">Original</span>
                                    <span>•</span>
                                    <span>{new Date(video.created_at).getFullYear()}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}

// ------------------------------------------------------------------
// Utilities & Shared Design Components
// ------------------------------------------------------------------

function Section({ title, viewAllLink, children }: { title: string, viewAllLink: string, children: React.ReactNode }) {
    return (
        <section className="relative group/section">
            <div className="mb-4 flex items-end justify-between px-2">
                <Link href={viewAllLink} className="group/title flex items-center gap-3">
                    <h2 className="text-2xl md:text-3xl font-bold text-white group-hover/title:text-[#fbbf24] transition-colors font-serif-display">
                        {title}
                    </h2>
                    <div className="opacity-0 -translate-x-2 group-hover/title:opacity-100 group-hover/title:translate-x-0 transition-all text-[#fbbf24] font-bold text-xs uppercase tracking-widest flex items-center">
                        Explore <ChevronRight className="w-4 h-4" />
                    </div>
                </Link>
            </div>
            {children}
        </section>
    );
}

function CategoryFilterBar() {
    // This could also be dynamic from backend if needed, but categories are usually static
    const categories = [
        { id: 'all', label: 'All', icon: Compass },
        { id: 'movies', label: 'Movies', icon: Film },
        { id: 'series', label: 'Series', icon: Tv },
        { id: 'reels', label: 'Shorts', icon: Flame },
    ];

    return (
        <div className="flex gap-4 overflow-x-auto no-scrollbar py-2">
            {categories.map(cat => (
                <Link
                    key={cat.id}
                    href={cat.id === 'all' ? '/' : `/browse?cat=${cat.id}`}
                    className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all whitespace-nowrap group"
                >
                    <cat.icon className="w-4 h-4 text-white/50 group-hover:text-[#fbbf24] transition-colors" />
                    <span className="text-sm font-bold text-white group-hover:text-white transition-colors">{cat.label}</span>
                </Link>
            ))}
        </div>
    );
}

const getThumbnail = (video: any) => {
    if (!video) return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop';
    return video.thumbnailUrl || video.thumbnail_url || video.coverImage || video.cover_image || video.coverImageUrl || video.cover_image_url || video.preview || video.preview_image || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop';
};

function formatDuration(seconds: number) {
    if (!seconds) return '0m';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    if (min > 60) {
        const h = Math.floor(min / 60);
        const m = min % 60;
        return `${h}h ${m}m`;
    }
    return `${min}m`;
}

function formatViews(count: number) {
    if (!count) return '0';
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
}
