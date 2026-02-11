import { fetchPublicApi } from '@/lib/api';
import Image from 'next/image';
import { Play, Music, Mic2, Disc, TrendingUp, Star, Heart, Share2, MoreHorizontal, ListMusic } from 'lucide-react';
import Link from 'next/link';
import { PlayButton, SongCard, TrendingSongCard } from './InteractiveComponents';

export const dynamic = 'force-dynamic';

export default async function MusicPage() {
    const [featuredData, trendingData, newData, genresData, playlistsData] = await Promise.all([
        fetchPublicApi('/music/songs?is_featured=true&limit=1'),
        fetchPublicApi('/music/songs?is_trending=true&limit=10'),
        fetchPublicApi('/music/songs?limit=12'),
        fetchPublicApi('/music/genres'),
        fetchPublicApi('/music/playlists')
    ]);

    const featuredSong = featuredData?.songs?.[0];
    const trendingSongs = trendingData?.songs || [];
    const newReleases = newData?.songs || [];
    const genres = genresData?.genres || [];
    const playlists = playlistsData?.playlists || [];

    return (
        <div className="min-h-screen bg-[#0a0a14] text-white selection:bg-purple-500/30">

            {/* Hero Section - Immersive & Glassmorphism */}
            <section className="relative h-[85vh] w-full overflow-hidden">
                {/* Background Image with Blur */}
                <div className="absolute inset-0">
                    {featuredSong?.cover_image_url ? (
                        <Image
                            src={featuredSong.cover_image_url}
                            alt="Background"
                            fill
                            className="object-cover opacity-60 blur-3xl scale-110"
                            priority
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-purple-900 via-slate-900 to-black" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-[#0a0a14]/60 to-transparent" />
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a14] via-[#0a0a14]/60 to-transparent" />
                </div>

                <div className="relative z-10 h-full max-w-[1920px] mx-auto px-6 lg:px-20 flex flex-col justify-center">
                    <div className="max-w-4xl space-y-8 animate-fade-in-up">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 shadow-xl">
                            <span className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-purple-500"></span>
                            </span>
                            <span className="text-sm font-bold tracking-wider uppercase text-purple-200">Featured Track of the Day</span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-none text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-100 to-purple-200 drop-shadow-2xl">
                            {featuredSong?.title || 'Discover Music'}
                        </h1>

                        <div className="flex items-center gap-6 text-lg md:text-xl text-slate-300">
                            <span className="flex items-center gap-2 font-medium">
                                <Mic2 className="w-5 h-5 text-purple-400" />
                                {featuredSong?.artist || 'Various Artists'}
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                            <span className="flex items-center gap-2">
                                <Disc className="w-5 h-5 text-pink-400" />
                                {featuredSong?.album || 'Single'}
                            </span>
                            {featuredSong?.genre_name && (
                                <>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-600" />
                                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-sm">
                                        {featuredSong.genre_name}
                                    </span>
                                </>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 pt-4">
                            {featuredSong && <PlayButton song={featuredSong} />}

                            <button className="px-6 py-4 rounded-full bg-white/5 backdrop-blur-md border border-white/10 font-semibold hover:bg-white/10 transition-colors flex items-center gap-2 group">
                                <Heart className="w-5 h-5 group-hover:text-pink-500 transition-colors" />
                                <span>Add to Favorites</span>
                            </button>
                            <button className="w-14 h-14 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
                                <Share2 className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Animated visualizer bars decoration */}
                <div className="absolute bottom-0 right-0 p-20 hidden xl:flex gap-1 items-end opacity-20">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="w-4 bg-white rounded-t-full animate-pulse"
                            style={{
                                height: `${Math.random() * 300 + 50}px`,
                                animationDuration: `${Math.random() * 1 + 0.5}s`
                            }}
                        />
                    ))}
                </div>
            </section>

            <div className="relative z-20 -mt-20 pb-20 max-w-[1920px] mx-auto px-6 lg:px-20 space-y-24">

                {/* Browse Genres */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <ListMusic className="w-6 h-6 text-purple-500" /> Browse Genres
                        </h2>
                    </div>
                    <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide mask-fade-right">
                        {genres.map((genre: any, i: number) => (
                            <Link
                                href="#"
                                key={genre.id}
                                className="flex-shrink-0 relative group w-48 h-28 rounded-2xl overflow-hidden cursor-pointer"
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br ${['from-pink-500 to-rose-600', 'from-purple-500 to-indigo-600', 'from-cyan-500 to-blue-600', 'from-amber-500 to-orange-600'][i % 4]
                                    } opacity-80 group-hover:opacity-100 transition-opacity`} />
                                <div className="absolute inset-0 flex items-center justify-center p-4">
                                    <span className="text-xl font-bold text-white drop-shadow-md group-hover:scale-110 transition-transform">{genre.name}</span>
                                </div>
                                <Music className="absolute -bottom-4 -right-4 w-16 h-16 text-white/10 rotate-12 group-hover:rotate-45 transition-transform duration-500" />
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Trending Now */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <TrendingUp className="w-8 h-8 text-amber-500" /> Trending Now
                        </h2>
                        <Link href="#" className="text-sm font-semibold text-purple-400 hover:text-purple-300">View All</Link>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x">
                        {trendingSongs.map((song: any, i: number) => (
                            <TrendingSongCard key={song.id} song={song} rank={i + 1} queue={trendingSongs} />
                        ))}
                    </div>
                </section>

                {/* New Releases Grid */}
                <section>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold flex items-center gap-3">
                            <Star className="w-8 h-8 text-cyan-500" /> New Releases
                        </h2>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-6">
                        {newReleases.map((song: any) => (
                            <SongCard key={song.id} song={song} queue={newReleases} />
                        ))}
                    </div>
                </section>

                {/* Curated Playlists */}
                {playlists.length > 0 && (
                    <section>
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-3xl font-bold flex items-center gap-3">
                                <ListMusic className="w-8 h-8 text-pink-500" /> Curated Playlists
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                            {playlists.map((playlist: any) => (
                                <div key={playlist.id} className="group relative overflow-hidden rounded-2xl aspect-video bg-slate-900 border border-white/10 hover:border-pink-500/50 transition-colors">
                                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-black" />
                                    {/* Abstract shapes for playlist cover */}
                                    <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl group-hover:bg-pink-500/30 transition-colors" />
                                    <div className="absolute top-6 left-6 right-6">
                                        <h3 className="text-xl font-bold text-white mb-1 group-hover:text-pink-400 transition-colors">{playlist.name}</h3>
                                        <p className="text-sm text-slate-400">{playlist.song_count} Tracks • By {playlist.user_name}</p>
                                    </div>
                                    <div className="absolute bottom-6 right-6">
                                        <button className="w-12 h-12 rounded-full bg-white/10 backdrop-blur border border-white/10 flex items-center justify-center text-white group-hover:bg-pink-600 group-hover:border-pink-500 transition-all hover:scale-105">
                                            <Play className="w-5 h-5 fill-current ml-1" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
