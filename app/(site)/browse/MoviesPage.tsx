import { fetchPublicApi } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Info, ChevronRight, CheckCircle, Plus, Filter } from 'lucide-react';
import { MediaCard } from '@/components/site/MediaCard';

export async function MoviesPage() {
    // Parallel Fetch for Movie-specific data
    const [
        featuredData,
        trendingMoviesData,
        newArrivalsData,
        actionMoviesData,
        dramaMoviesData,
        categoriesData
    ] = await Promise.all([
        // Hero: Featured Movie
        fetchPublicApi('/videos?is_featured=1&type=VIDEO&exclude_series=true&limit=1'),
        // Row 1: Trending
        fetchPublicApi('/videos?type=VIDEO&is_trending=1&limit=10&exclude_series=true'),
        // Row 2: New Arrivals
        fetchPublicApi('/videos?type=VIDEO&limit=12&exclude_series=true&sort=createdAt'),
        // Row 3: Action (Assuming ID 1 is Action, adjust as needed or rely on generic)
        fetchPublicApi('/videos?type=VIDEO&genre_id=1&limit=10&exclude_series=true'),
        // Row 4: Drama (Assuming ID 2 or similar)
        fetchPublicApi('/videos?type=VIDEO&genre_id=2&limit=10&exclude_series=true'),
        fetchPublicApi('/videos/categories')
    ]);

    const featured = featuredData?.videos?.[0] || trendingMoviesData?.videos?.[0] || null;
    const trendingMovies = trendingMoviesData?.videos || [];
    const newArrivals = newArrivalsData?.videos || [];
    const actionMovies = actionMoviesData?.videos || [];
    const dramaMovies = dramaMoviesData?.videos || [];
    const allCategories = categoriesData?.categories || [];

    // Filter out Series-specific categories for the Movies page
    const excludedCategories = ['Series', 'TV Shows', 'Web Series', 'Serials', 'Season', 'Episodes'];
    const categories = allCategories.filter((c: any) => !excludedCategories.includes(c.name));

    return (
        <div className="min-h-screen bg-[#0a0a14] text-white selection:bg-[#fbbf24]/30 font-sans pb-20">

            {/* HERO SECTION - Immersive & Cinematic */}
            {featured && (
                <div className="relative w-full h-[80vh] flex items-center group overflow-hidden">
                    {/* Background with Ken Burns Effect */}
                    <div className="absolute inset-0 animate-ken-burns">
                        <Image
                            src={featured.thumbnail_url || featured.thumbnailUrl || '/placeholder-wide.jpg'}
                            alt={featured.title}
                            fill
                            className="object-cover object-top opacity-70"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a14] via-[#0a0a14]/60 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a14] via-transparent to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-[1920px] mx-auto px-6 sm:px-12 md:px-20 w-full pt-20">
                        <div className="max-w-3xl space-y-6 animate-in slide-in-from-left duration-1000 fade-in-0">
                            <div className="flex items-center gap-3">
                                <span className="bg-[#fbbf24] text-black px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] rounded">
                                    Movie of the Week
                                </span>
                                {featured.is_trending && (
                                    <span className="text-white/80 font-bold tracking-widest text-xs border-l border-white/20 pl-3 uppercase">
                                        #1 in Trending
                                    </span>
                                )}
                            </div>

                            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black font-serif-display tracking-tight leading-[0.9] drop-shadow-2xl text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70">
                                {featured.title}
                            </h1>

                            <div className="flex items-center gap-4 text-sm font-bold text-white/80">
                                <span className="text-green-500">98% Match</span>
                                <span>{new Date(featured.created_at).getFullYear()}</span>
                                <span className="px-2 py-0.5 border border-white/30 rounded text-[10px]">{featured.content_rating || 'U/A 13+'}</span>
                                <span>{formatDuration(featured.duration)}</span>
                                <span className="flex items-center gap-1 text-[#fbbf24]">
                                    <span className="material-symbols-outlined text-sm">hd</span> 4K Ultra HD
                                </span>
                            </div>

                            <p className="text-lg text-white/70 line-clamp-3 leading-relaxed max-w-xl font-medium drop-shadow-md">
                                {featured.description || "Watch this amazing movie exclusively on Tirhuta."}
                            </p>

                            <div className="flex items-center gap-4 pt-4">
                                <Link
                                    href={`/watch/${featured.id}`}
                                    className="px-8 py-4 bg-white text-black font-black rounded-xl flex items-center gap-3 hover:bg-opacity-90 transition-all hover:scale-105 active:scale-95 text-lg shadow-xl shadow-white/10"
                                >
                                    <Play className="w-6 h-6 fill-current" /> Play
                                </Link>
                                <button className="px-8 py-4 bg-white/10 border border-white/20 text-white font-bold rounded-xl flex items-center gap-3 hover:bg-white/20 transition-all hover:scale-105 active:scale-95 text-lg backdrop-blur-md">
                                    <Info className="w-6 h-6" /> More Info
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* GLOBAL FILTERS - Sticky & Glassmorphism */}
            <div className="sticky top-20 z-40 px-6 sm:px-12 md:px-20 py-6 -mt-10 mb-8 pointer-events-none">
                <div className="pointer-events-auto inline-flex items-center gap-2 p-2 rounded-2xl bg-[#0a0a14]/80 backdrop-blur-xl border border-white/10 shadow-2xl">
                    <div className="px-4 py-2 flex items-center gap-2 text-white/50 border-r border-white/10">
                        <Filter className="w-4 h-4" />
                        <span className="text-xs font-bold uppercase tracking-wider">Genres</span>
                    </div>
                    <div className="flex items-center gap-2 overflow-x-auto max-w-[80vw] md:max-w-2xl no-scrollbar px-2">
                        <CategoryPill label="All" href="/browse?cat=movies" active={true} />
                        {categories.map((c: any) => (
                            <CategoryPill key={c.id} label={c.name} href={`/browse?cat=${c.id}&type=VIDEO`} active={false} />
                        ))}
                    </div>
                </div>
            </div>

            {/* CONTENT GRIDS - extra ordinary layout */}
            <div className="relative z-10 px-6 sm:px-12 md:px-20 space-y-20 max-w-[1920px] mx-auto">

                {/* Trending Row - Horizontal Scroll */}
                {trendingMovies.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-serif-display font-bold text-white mb-6 flex items-center gap-3">
                            <span className="w-1 h-8 bg-[#fbbf24] rounded-full"></span>
                            Trending Now
                        </h2>
                        <div className="flex gap-4 overflow-x-auto pb-16 pt-20 px-4 no-scrollbar -mx-4">
                            {trendingMovies.map((movie: any, idx: number) => (
                                <MediaCard key={movie.id} video={movie} rank={idx + 1} />
                            ))}
                        </div>
                    </section>
                )}

                {/* New Arrivals - Grid Layout for Exploration */}
                {newArrivals.length > 0 && (
                    <section>
                        <div className="flex items-end justify-between mb-8">
                            <h2 className="text-3xl font-serif-display font-bold text-white">New Arrivals</h2>
                            <Link href="/browse?sort=newest" className="text-[#fbbf24] text-xs font-black uppercase tracking-widest hover:underline decoration-2 underline-offset-4">View All</Link>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 gap-y-12">
                            {newArrivals.map((movie: any) => (
                                <MediaCard key={movie.id} video={movie} className="w-full md:w-full" />
                            ))}
                        </div>
                    </section>
                )}

                {/* Curated Collections (Mocked Categories for now based on data) */}
                {actionMovies.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-serif-display font-bold text-white mb-6">Action & Adventure</h2>
                        <div className="flex gap-4 overflow-x-auto pb-16 pt-20 px-4 no-scrollbar -mx-4">
                            {actionMovies.map((movie: any) => (
                                <MediaCard key={movie.id} video={movie} />
                            ))}
                        </div>
                    </section>
                )}
                {dramaMovies.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-serif-display font-bold text-white mb-6">Dramatic Hits</h2>
                        <div className="flex gap-4 overflow-x-auto pb-16 pt-20 px-4 no-scrollbar -mx-4">
                            {dramaMovies.map((movie: any) => (
                                <MediaCard key={movie.id} video={movie} />
                            ))}
                        </div>
                    </section>
                )}

            </div>
        </div>
    );
}

// ---- SUB COMPONENTS ----

function CategoryPill({ label, href, active }: { label: string, href: string, active: boolean }) {
    return (
        <Link
            href={href}
            className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${active
                ? 'bg mt-[#fbbf24] bg-[#fbbf24] text-black border-[#fbbf24]'
                : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/30 hover:text-white'
                }`}
        >
            {label}
        </Link>
    )
}

function formatDuration(seconds: number) {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

