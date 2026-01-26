'use client';

import { Play, TrendingUp, Clock, MoreVertical, Heart, Share2, Flame, ChevronRight, Compass, Music, Film, Tv, Plus } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface LandingViewProps {
    featuredVideos: any[];
    trendingVideos: any[];
    latestVideos: any[];
    seriesList: any[];
    reelsVideos: any[];
}

export function LandingView({ featuredVideos, trendingVideos, latestVideos, seriesList, reelsVideos }: LandingViewProps) {
    const heroVideo = featuredVideos[0];
    // Helper to get valid image source
    const getThumbnail = (video: any) => {
        if (!video) return 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1974&auto=format&fit=crop';
        return video.thumbnailUrl || video.thumbnail_url || video.coverImage || video.cover_image || video.coverImageUrl || video.cover_image_url || video.preview || video.preview_image || 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop';
    };

    const getCreatorImage = (video: any) => {
        if (!video) return null;
        return video.creator?.profileImage || video.creator_image || video.creator?.image;
    };

    // Correct mapping from props
    const movies = latestVideos; // "Latest" are now filtered strictly as movies in actions.ts
    const series = seriesList;

    return (
        <div className="min-h-screen bg-[#0a0a14] font-sans selection:bg-[#fbbf24]/30">

            {/* Hero Section */}
            {heroVideo ? (
                <section className="relative h-[95vh] w-full overflow-hidden">
                    <div className="absolute inset-0 scale-105 transition-transform duration-[20000ms] hover:scale-100">
                        <Image
                            src={getThumbnail(heroVideo)}
                            alt={heroVideo.title}
                            fill
                            className="object-cover"
                            priority
                            quality={100}
                        />
                        <div className="hero-gradient-top absolute inset-0"></div>
                        <div className="hero-gradient-bottom absolute inset-0"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a14]/90 via-[#0a0a14]/30 to-transparent"></div>
                    </div>

                    <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-end px-6 pb-28 lg:px-20">
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8 }}
                            className="max-w-4xl space-y-8"
                        >
                            <div className="flex items-center gap-2">
                                <div className="inline-flex items-center gap-3 rounded-full glassmorphism px-4 py-1.5 border-[#fbbf24]/20">
                                    <span className="material-symbols-outlined text-[#fbbf24] text-lg">verified_user</span>
                                    <span className="text-[12px] font-bold uppercase tracking-[0.2em] text-[#fbbf24]">Featured Original</span>
                                </div>
                                <div className="h-[1px] w-20 bg-white/20"></div>
                                <span className="text-xs font-bold tracking-widest text-white/50">TRENDING #1</span>
                            </div>

                            <h1 className="text-4xl md:text-6xl lg:text-7xl font-black leading-[1] font-serif-display italic tracking-tighter">
                                {heroVideo.title}
                            </h1>

                            <div className="flex items-center gap-6 text-sm font-semibold text-white/80">

                                <span>{heroVideo.createdAt && !isNaN(new Date(heroVideo.createdAt).getTime()) ? new Date(heroVideo.createdAt).getFullYear() : '2024'}</span>
                                <span className="px-2 py-0.5 border border-white/20 rounded text-[10px]">4K ULTRA HD</span>
                                {heroVideo.duration > 0 && (
                                    <span>{formatDuration(heroVideo.duration)}</span>
                                )}
                            </div>

                            <p className="text-xl font-medium text-white/70 leading-relaxed max-w-2xl">
                                {heroVideo.description}
                            </p>

                            <div className="flex flex-wrap gap-5 pt-4">
                                <Link
                                    href={`/watch/${heroVideo.id}`}
                                    className="group flex h-14 min-w-[200px] items-center justify-center gap-3 rounded-2xl bg-[#fbbf24] px-8 text-base font-black text-black transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-[#fbbf24]/20"
                                >
                                    <Play className="fill-black w-6 h-6" />
                                    START WATCHING
                                </Link>
                                <button className="flex h-14 min-w-[200px] items-center justify-center gap-3 rounded-2xl glassmorphism px-8 text-base font-bold text-white transition-all hover:bg-white/10 hover:border-white/30">
                                    <Plus className="w-6 h-6" />
                                    ADD TO LIST
                                </button>
                            </div>
                        </motion.div>

                        <div className="absolute bottom-10 right-20 hidden lg:flex gap-4">
                            <div className="w-16 h-1 bg-[#fbbf24] rounded-full"></div>
                            <div className="w-16 h-1 bg-white/20 rounded-full"></div>
                            <div className="w-16 h-1 bg-white/20 rounded-full"></div>
                        </div>
                    </div>
                </section>
            ) : null}

            <main className="mx-auto w-full max-w-[1440px] space-y-24 px-6 py-16 lg:px-20">

                {/* Check Filters */}
                <div className="relative z-20 -mt-24">
                    <div className="no-scrollbar flex items-center gap-4 overflow-x-auto pb-6">
                        <CategoryFilter active icon="movie" label="All Content" />
                        <CategoryFilter icon="theaters" label="Movies" />
                        <CategoryFilter icon="live_tv" label="Series" />
                        <CategoryFilter icon="slow_motion_video" label="Reels" />
                        <CategoryFilter icon="workspace_premium" label="Originals" />
                    </div>
                </div>

                {/* Blockbuster Movies */}
                <Section title="Blockbuster Movies" viewAllLink="/browse?cat=movies">
                    <div className="no-scrollbar flex gap-6 overflow-x-auto pb-8">
                        {movies.map((video) => (
                            <div key={video.id} className="group relative min-w-[220px] md:min-w-[260px] flex-shrink-0 cursor-pointer transition-all duration-500 hover:scale-105">
                                <Link href={`/watch/${video.id}`}>
                                    <div className="aspect-[2/3] w-full rounded-2xl bg-cover bg-center card-glow overflow-hidden relative border border-white/5 bg-slate-800">
                                        <Image
                                            src={getThumbnail(video)}
                                            alt={video.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60"></div>
                                        <div className="absolute top-4 right-4 glassmorphism rounded-lg px-2 py-1 text-[10px] font-black text-[#fbbf24]">HD</div>
                                    </div>
                                    <div className="mt-4 px-1">
                                        <p className="text-base font-bold text-white group-hover:text-[#fbbf24] transition-colors truncate">{video.title}</p>
                                        <p className="text-xs font-semibold text-white/40 mt-1">{video.category?.name || 'Genre'} • {formatDuration(video.duration)}</p>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Popular Series - Using wider cards */}
                <Section title="Popular Series" viewAllLink="/browse?cat=series">
                    <div className="no-scrollbar flex gap-8 overflow-x-auto pb-4">
                        {series.map((video) => (
                            <div key={video.id} className="group min-w-[380px] md:min-w-[440px] flex-shrink-0 cursor-pointer">
                                <Link href={`/series/${video.id}`}>
                                    <div className="aspect-video w-full rounded-3xl bg-slate-800 border border-white/10 overflow-hidden relative shadow-xl">
                                        <Image
                                            src={getThumbnail(video)}
                                            alt={video.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-6 flex flex-col justify-end">
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="bg-[#fbbf24]/20 text-[#fbbf24] text-[10px] font-black px-3 py-1 rounded-full border border-[#fbbf24]/30 uppercase tracking-tighter">New Episodes</span>
                                            </div>
                                            <h3 className="text-2xl font-bold text-white group-hover:text-[#fbbf24] transition-colors">{video.title}</h3>
                                            <p className="text-white/60 text-sm mt-1 line-clamp-1">{video.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Reels Section */}
                <section className="py-4">
                    <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-[#fbbf24] fill-1">bolt</span>
                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#fbbf24]">Trending Reels</span>
                            </div>
                            <h2 className="text-4xl font-serif-display font-bold text-white">Moments of Mithila</h2>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="flex -space-x-3">
                                {reelsVideos.slice(0, 3).map((video: any, idx: number) => (
                                    <div key={idx} className="relative h-10 w-10 rounded-full border-2 border-[#0a0a14] bg-slate-700 overflow-hidden">
                                        <Image
                                            src={getCreatorImage(video) || 'https://ui-avatars.com/api/?name=Creator&background=random'}
                                            alt="Creator"
                                            fill
                                            className="object-cover"
                                        />
                                    </div>
                                ))}
                                <div className="h-10 w-10 rounded-full border-2 border-[#0a0a14] bg-gray-600 flex items-center justify-center text-[10px] font-bold">+5k</div>
                            </div>
                            <span className="text-sm font-medium text-white/40">Creators active now</span>
                        </div>
                    </div>

                    <div className="no-scrollbar flex gap-6 overflow-x-auto pb-8 snap-x">
                        {reelsVideos.length > 0 ? (
                            reelsVideos.map((video: any) => (
                                <div key={video.id} className="min-w-[280px] md:min-w-[320px] aspect-[9/16] relative rounded-[2rem] overflow-hidden border border-white/5 group cursor-pointer bg-slate-800">
                                    <Link href={`/watch/${video.id}`}>
                                        <Image
                                            src={getThumbnail(video)}
                                            alt={video.title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30"></div>
                                        <div className="absolute top-6 left-6 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-white text-lg drop-shadow-lg">visibility</span>
                                            <span className="text-xs font-bold text-white drop-shadow-md">{video.views || '0'}</span>
                                        </div>
                                        <div className="absolute bottom-0 inset-x-0 p-8 space-y-4">
                                            <div className="flex items-center gap-3">
                                                <div className="relative h-10 w-10 rounded-full border-2 border-[#fbbf24] bg-slate-500 overflow-hidden">
                                                    <Image
                                                        src={getCreatorImage(video) || 'https://ui-avatars.com/api/?name=Creator&background=random'}
                                                        alt={video.creator?.name || 'Creator'}
                                                        fill
                                                        className="object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-black text-white">@{video.creator?.name || 'Creator'}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm text-white/90 font-medium line-clamp-2 leading-relaxed">{video.title}</p>
                                        </div>
                                    </Link>
                                </div>
                            ))
                        ) : (
                            <div className="text-white/50 pl-4">No reels found.</div>
                        )}
                    </div>
                </section>

                {/* Originals Collection */}
                {featuredVideos.length > 1 && (
                    <section className="py-12">
                        <div className="mb-10 text-center md:text-left">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[#fbbf24]">Tirhuta Studios Presents</span>
                            <h2 className="text-4xl md:text-5xl font-serif-display font-bold text-white mt-2">The Originals Collection</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 h-full md:h-[600px]">
                            {/* Main Featured Original (2nd Item) */}
                            {featuredVideos[1] && (
                                <Link href={`/watch/${featuredVideos[1].id}`} className="md:col-span-2 group relative overflow-hidden rounded-[2.5rem] cursor-pointer border border-white/10 bg-slate-900 block">
                                    <Image
                                        src={getThumbnail(featuredVideos[1])}
                                        alt={featuredVideos[1].title}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/20 to-transparent"></div>
                                    <div className="absolute bottom-0 p-10 space-y-4">
                                        <div className="flex items-center gap-2 text-[#fbbf24] font-bold text-sm">
                                            <span className="material-symbols-outlined text-sm">verified</span>
                                            EDITOR'S CHOICE
                                        </div>
                                        <h3 className="text-4xl md:text-5xl font-serif-display font-black text-white italic">{featuredVideos[1].title}</h3>
                                        <p className="text-white/60 max-w-lg text-lg line-clamp-2">{featuredVideos[1].description}</p>
                                        <button className="mt-4 px-8 py-4 bg-[#fbbf24] text-black font-black rounded-2xl hover:scale-105 transition-transform uppercase tracking-wider text-sm shadow-xl shadow-[#fbbf24]/20">
                                            WATCH NOW
                                        </button>
                                    </div>
                                </Link>
                            )}

                            {/* Side Originals (3rd & 4th Items) */}
                            <div className="flex flex-col gap-8">
                                {featuredVideos[2] && (
                                    <Link href={`/watch/${featuredVideos[2].id}`} className="flex-1 group relative overflow-hidden rounded-[2rem] cursor-pointer border border-white/10 bg-slate-900 block">
                                        <Image
                                            src={getThumbnail(featuredVideos[2])}
                                            alt={featuredVideos[2].title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14]/80 to-transparent"></div>
                                        <div className="absolute bottom-0 p-6">
                                            <h4 className="text-xl font-bold text-white line-clamp-1">{featuredVideos[2].title}</h4>
                                        </div>
                                    </Link>
                                )}
                                {featuredVideos[3] && (
                                    <Link href={`/watch/${featuredVideos[3].id}`} className="flex-1 group relative overflow-hidden rounded-[2rem] cursor-pointer border border-white/10 bg-slate-900 block">
                                        <Image
                                            src={getThumbnail(featuredVideos[3])}
                                            alt={featuredVideos[3].title}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14]/80 to-transparent"></div>
                                        <div className="absolute bottom-0 p-6">
                                            <h4 className="text-xl font-bold text-white line-clamp-1">{featuredVideos[3].title}</h4>
                                        </div>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </section>
                )}

            </main>
        </div>
    );
}

function Section({ title, viewAllLink, children }: { title: string, viewAllLink: string, children: React.ReactNode }) {
    return (
        <section>
            <div className="mb-8 flex items-end justify-between">
                <div className="space-y-1">
                    <h2 className="text-3xl font-serif-display font-bold text-white tracking-wide">{title}</h2>
                    <div className="h-1 w-12 bg-[#fbbf24] rounded-full"></div>
                </div>
                <Link href={viewAllLink} className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#fbbf24] transition-all">
                    VIEW ALL
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
            </div>
            {children}
        </section>
    );
}

function CategoryFilter({ icon, label, active }: { icon: string, label: string, active?: boolean }) {
    return (
        <div className={`flex h-12 shrink-0 cursor-pointer items-center justify-center gap-3 rounded-2xl px-8 text-sm font-bold transition-all ${active
            ? 'bg-[#fbbf24] text-black premium-glow font-black'
            : 'glassmorphism text-white/90 hover:bg-white/10 font-semibold'
            }`}>
            <span className="material-symbols-outlined text-lg">{icon}</span>
            {label}
        </div>
    )
}

function formatDuration(seconds: number) {
    if (!seconds) return '0m';
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}m ${sec}s`;
}
