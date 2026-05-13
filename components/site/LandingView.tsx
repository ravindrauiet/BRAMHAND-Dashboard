'use client';

import { Play, TrendingUp, Clock, MoreVertical, Heart, Share2, Flame, ChevronRight, Compass, Music, Film, Tv, Plus, Loader2, Info, Volume2, VolumeX, Star, CheckCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MediaCard } from '@/components/site/MediaCard';
import { toggleWatchlist } from '@/app/actions/video';
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils'; // Assuming you have a utility for class names, if not I'll just use template literals

import { HeroCarousel } from '@/components/site/HeroCarousel';

// --- types ---
interface LandingViewProps {
    heroVideos: any[];
    sections: Array<{
        id: string;
        title: string;
        items: any[];
        type?: 'MOVIE' | 'SERIES' | 'REEL';
        viewAllLink: string;
    }>;
    continueWatching: any[];
}

export function LandingView({ heroVideos, sections, continueWatching }: LandingViewProps) {
    const reelsSection = sections.find((section) => section.id === 'trending-shorts');
    const primarySections = sections.filter((section) => section.id !== 'trending-shorts');
    const originals = heroVideos.slice(1, 5);

    return (
        <div className="min-h-screen bg-[#0a0a14] font-sans selection:bg-[#fbbf24]/30 overflow-x-hidden">
            {/* Cinematic Hero Carousel */}
            <HeroCarousel videos={heroVideos} />

            <main className="relative z-10 -mt-12 md:-mt-20 space-y-16 pb-20">
                {/* Check Filters (Floating) */}
                <div className="px-6 lg:px-20 mx-auto max-w-[1600px] mb-12">
                    <CategoryFilterBar />
                </div>

                <div className="space-y-16 px-6 lg:px-20 mx-auto max-w-[1600px]">
                    {continueWatching.length > 0 && <ContinueWatchingSection items={continueWatching} />}

                    {primarySections.map((section) => (
                        <Section key={section.id} title={section.title} viewAllLink={section.viewAllLink}>
                            <div className="flex gap-4 overflow-x-auto pb-16 pt-20 px-4 no-scrollbar -mx-4">
                                {section.items.map((video, idx) => (
                                    <MediaCard
                                        key={`${section.id}-${video.id}`}
                                        video={video}
                                        type={section.type === 'SERIES' ? 'SERIES' : 'MOVIE'}
                                        rank={section.id === 'trending-now' ? idx + 1 : undefined}
                                    />
                                ))}
                            </div>
                        </Section>
                    ))}

                    {reelsSection && <ReelsSection reels={reelsSection.items} />}

                    {/* Originals / Editor's Choice */}
                    {originals.length > 0 && (
                        <OriginalsSection originals={originals} />
                    )}
                </div>
            </main>
        </div>
    );
}

function ContinueWatchingSection({ items }: { items: any[] }) {
    return (
        <section className="rounded-[32px] border border-white/10 bg-[linear-gradient(135deg,rgba(251,191,36,0.12),rgba(15,23,42,0.75))] p-6 md:p-8">
            <div className="mb-6 flex items-end justify-between">
                <div>
                    <span className="text-[#fbbf24] font-black uppercase tracking-[0.3em] text-xs">For You</span>
                    <h2 className="mt-2 text-3xl font-serif-display font-bold text-white">Continue Watching</h2>
                </div>
                <Link href="/u/history" className="text-sm font-bold text-white/70 hover:text-white uppercase tracking-widest flex items-center gap-1">
                    View History <ChevronRight className="w-4 h-4" />
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((item) => {
                    const duration = Number(item.duration || 0);
                    const lastPosition = Number(item.last_position || 0);
                    const progress = duration > 0 ? Math.min((lastPosition / duration) * 100, 100) : 0;

                    return (
                        <Link
                            href={`/watch/${item.id}`}
                            key={item.view_id || item.id}
                            className="group overflow-hidden rounded-2xl border border-white/10 bg-black/30 transition-colors hover:bg-white/10"
                        >
                            <div className="relative aspect-video overflow-hidden">
                                <Image
                                    src={getThumbnail(item)}
                                    alt={item.title}
                                    fill
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-x-0 bottom-0 h-1.5 bg-white/10">
                                    <div className="h-full bg-[#fbbf24]" style={{ width: `${progress}%` }} />
                                </div>
                            </div>
                            <div className="space-y-2 p-4">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.25em] text-[#fbbf24]">
                                    <Clock className="h-3.5 w-3.5" />
                                    Resume
                                </div>
                                <h3 className="line-clamp-1 text-lg font-bold text-white">{item.title}</h3>
                                <p className="line-clamp-1 text-sm text-white/60">{item.creator_name}</p>
                                <div className="flex items-center justify-between text-xs text-white/60">
                                    <span>{Math.round(progress)}% watched</span>
                                    <span>{formatDuration(duration) || 'In progress'}</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </section>
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
                                    {reel.creator_image ? (
                                        <Image src={reel.creator_image} alt={reel.creator_name || 'Creator'} fill className="object-cover" />
                                    ) : (
                                        <div className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white">
                                            {reel.creator_name?.[0] || 'C'}
                                        </div>
                                    )}
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
                <Link href={`/watch/${main.id}`} className="lg:col-span-2 relative rounded-[32px] overflow-hidden group cursor-pointer border border-white/5 aspect-[4/5] md:aspect-video lg:aspect-auto">
                    <Image
                        src={getThumbnail(main)}
                        alt={main.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-1000"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                    <div className="absolute bottom-0 p-6 md:p-10 max-w-2xl">
                        <div className="bg-[#fbbf24] text-black px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider inline-block mb-4">
                            Premiere
                        </div>
                        <h3 className="text-3xl md:text-5xl font-serif-display font-bold text-white mb-4 leading-tight">{main.title}</h3>
                        <p className="text-white/70 text-sm md:text-lg line-clamp-2 mb-6">{main.description}</p>
                        <div className="flex items-center gap-3 font-semibold text-white/90 text-sm active:scale-95 transition-transform origin-left">
                            <Play className="w-10 h-10 md:w-12 md:h-12 bg-white rounded-full text-black p-3 fill-current" />
                            <span>Watch Now</span>
                        </div>
                    </div>
                </Link>

                {/* Secondary Stack */}
                <div className="flex flex-col gap-6">
                    {secondary.map(video => (
                        <Link href={`/watch/${video.id}`} key={video.id} className="flex-1 relative rounded-[24px] overflow-hidden group cursor-pointer border border-white/5 aspect-video lg:aspect-auto">
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
    if (!seconds) return null;
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
