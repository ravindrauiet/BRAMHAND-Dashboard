import { fetchPublicApi } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Info, ChevronRight } from 'lucide-react';

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
        fetchPublicApi('/videos?is_featured=true&type=VIDEO&exclude_series=true&limit=1'),
        // Row 1: Trending
        fetchPublicApi('/videos?type=VIDEO&is_trending=true&limit=15&exclude_series=true'),
        // Row 2: New Arrivals
        fetchPublicApi('/videos?type=VIDEO&limit=15&exclude_series=true&sort=createdAt'),
        // Row 3: Action (Assuming ID 1 is Action, adjust as needed or rely on generic)
        fetchPublicApi('/videos?type=VIDEO&genre_id=1&limit=15&exclude_series=true'),
        // Row 4: Drama (Assuming ID 2 or similar)
        fetchPublicApi('/videos?type=VIDEO&genre_id=2&limit=15&exclude_series=true'),
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
        <div className="min-h-screen bg-[#141414] text-white">

            {/* HERO SECTION */}
            {featured && (
                <div className="relative w-full h-[85vh] flex items-center group">
                    <div className="absolute inset-0">
                        <Image
                            src={featured.thumbnail_url || featured.thumbnailUrl || '/placeholder-wide.jpg'}
                            alt={featured.title}
                            fill
                            className="object-cover object-top"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-12 w-full pt-32">
                        <div className="max-w-2xl space-y-6 animate-in slide-in-from-left duration-1000">
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-4 drop-shadow-2xl">
                                {featured.title}
                            </h1>
                            <div className="flex items-center gap-3 text-lg font-medium text-gray-200">
                                <span className="text-red-500 font-bold">featured Movie</span>
                                <span>2024</span>
                                <span className="px-2 py-0.5 border border-gray-500 rounded text-xs text-gray-300">U/A 13+</span>
                                <span>{featured.category_name || 'Movie'}</span>
                            </div>
                            <p className="text-lg text-gray-300 line-clamp-3 drop-shadow-md leading-relaxed max-w-xl">
                                {featured.description || "Watch this amazing movie exclusively on Tirhuta."}
                            </p>
                            <div className="flex items-center gap-4 pt-4">
                                <Link
                                    href={`/watch/${featured.id}`}
                                    className="px-8 py-3 bg-white text-black font-bold rounded flex items-center gap-2 hover:bg-opacity-80 transition-all text-lg"
                                >
                                    <Play className="w-6 h-6 fill-current" /> Play
                                </Link>
                                <button className="px-8 py-3 bg-gray-600/70 text-white font-bold rounded flex items-center gap-2 hover:bg-gray-600/90 transition-all text-lg backdrop-blur-sm">
                                    <Info className="w-6 h-6" /> More Info
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* CONTENT ROWS Container */}
            <div className={`relative z-10 space-y-12 pb-20 pl-4 sm:pl-12 overflow-hidden ${featured ? '-mt-32' : 'pt-24'}`}>

                {/* Internal Category Filters for Movies */}
                <div className="flex items-center gap-3 overflow-x-auto pb-4 scrollbar-hide pr-4">
                    <CategoryPill label="All Movies" href="/browse?cat=movies" active={true} />
                    {categories.map((c: any) => (
                        <CategoryPill key={c.id} label={c.name} href={`/browse?cat=${c.id}&type=VIDEO`} active={false} />
                    ))}
                </div>

                <ContentRow title="Trending Now" items={trendingMovies} />
                <ContentRow title="New Arrivals" items={newArrivals} />
                <ContentRow title="Action & Adventure" items={actionMovies} />
                <ContentRow title="Drama" items={dramaMovies} />

                <div className="h-20" />
            </div>
        </div>
    );
}

// ---- SUB COMPONENTS ----

function CategoryPill({ label, href, active }: { label: string, href: string, active: boolean }) {
    return (
        <Link
            href={href}
            className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${active
                ? 'bg-red-600 text-white'
                : 'bg-zinc-800 text-gray-300 hover:bg-zinc-700'
                }`}
        >
            {label}
        </Link>
    )
}

// Helper functions for formatting
function formatDuration(seconds: number) {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

function formatViews(num: number) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num.toString();
}

function ContentRow({ title, items }: { title: string, items: any[] }) {
    if (!items || items.length === 0) return null;

    // Movies generally use landscape aspect ratio.
    const widthClass = 'w-[260px] md:w-[320px]';

    return (
        <div className="space-y-3 group/section">
            <h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2 px-1">
                {title}
                <ChevronRight className="w-5 h-5 text-zinc-500 opacity-0 group-hover/section:opacity-100 transition-opacity" />
            </h2>

            <div className="relative group/row">
                <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide px-1 snap-x snap-mandatory">
                    {items.map((item) => (
                        <div key={item.id} className={`flex-shrink-0 ${widthClass} snap-center group/card`}>
                            <Link
                                href={`/watch/${item.id}`} // Movies always go to watch
                                className="block relative w-full aspect-video rounded-md overflow-hidden bg-zinc-800 shadow-lg transition-all duration-300 hover:scale-105 hover:z-20 hover:ring-2 hover:ring-red-600 mb-3"
                            >
                                <Image
                                    src={item.thumbnail_url || item.thumbnailUrl || '/placeholder-thumb.jpg'}
                                    alt={item.title}
                                    fill
                                    className="object-cover"
                                />
                                {/* Optional: Play icon overlay on hover only */}
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/card:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white scale-0 group-hover/card:scale-100 transition-transform duration-300">
                                        <Play className="w-5 h-5 fill-current" />
                                    </div>
                                </div>
                            </Link>

                            {/* Info Section - Always Visible Below Card */}
                            <div className="px-1 space-y-1.5 mt-2">
                                <h3 className="font-bold text-base text-gray-100 line-clamp-1 group-hover/card:text-red-500 transition-colors leading-tight">
                                    {item.title}
                                </h3>

                                {/* Metadata Row 1: Duration | Genre | Year */}
                                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                    <span className="text-white bg-white/10 px-1.5 py-0.5 rounded text-[10px]">
                                        {formatDuration(item.duration || 0)}
                                    </span>
                                    <span>•</span>
                                    <span>{item.category_name || item.categoryName || 'Movie'}</span>
                                    <span>•</span>
                                    <span>{new Date(item.created_at || item.createdAt).getFullYear()}</span>
                                </div>

                                {/* Metadata Row 2: Views | Creator */}
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span>{formatViews(item.views_count || item.viewsCount || 0)} views</span>
                                    <span className="w-0.5 h-0.5 bg-slate-500 rounded-full" />
                                    <span className="truncate max-w-[120px] hover:text-slate-300 transition-colors">
                                        {item.creator?.fullName || item.creator_name || 'Tirhuta Studios'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
