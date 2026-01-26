import { fetchPublicApi } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Info, Plus } from 'lucide-react';

export async function SeriesPage() {
    // Parallel Fetch from Express Backend
    const [featuredData, allSeriesData] = await Promise.all([
        fetchPublicApi('/series?is_featured=true'),
        fetchPublicApi('/series')
    ]);

    const featuredList = featuredData?.series || [];
    const allSeries = allSeriesData?.series || [];

    // 1. Determine Featured Series (Hero)
    // specific formatting needed? The API returns snake_case for raw keys or join fields?
    // Looking at controller: u.full_name as creatorName, c.name as categoryName
    // But direct fields are snake_case if raw query, or Prisma? 
    // The controller uses `pool.query` so it returns snake_case for DB columns: 
    // thumbnail_url, cover_image_url, etc.
    // Need to handle snake_case mapping in UI.

    const featuredSeries = featuredList.length > 0 ? featuredList[0] : (allSeries.length > 0 ? allSeries[0] : null);

    // 2. Mock Trending/New (Just slicing the main list for now as we don't have separate algos yet)
    const trendingSeries = allSeries.slice(0, 10);
    const newSeries = allSeries.slice(0, 10); // Controller sorts by created_at desc by default

    // Helper to get image URL safely (API might return full URL or relative)
    const getImg = (s: any) => s.cover_image_url || s.coverImageUrl || s.thumbnail_url || s.thumbnailUrl || '/placeholder-wide.jpg';
    const getThumb = (s: any) => s.thumbnail_url || s.thumbnailUrl || s.cover_image_url || s.coverImageUrl || '/placeholder-thumb.jpg';

    return (
        <div className="min-h-screen bg-[#141414] text-white -mt-20"> {/* Negative margin to pull behind transparent navbar if needed */}

            {/* HERO SECTION */}
            {featuredSeries ? (
                <div className="relative w-full h-[85vh] flex items-center">
                    {/* Background Image */}
                    <div className="absolute inset-0">
                        <Image
                            src={getImg(featuredSeries)}
                            alt={featuredSeries.title}
                            fill
                            className="object-cover object-top"
                            priority
                        />
                        {/* Gradient Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                    </div>

                    {/* Hero Content */}
                    <div className="relative z-10 max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 w-full pt-32">
                        <div className="max-w-2xl space-y-6 animate-in slide-in-from-left duration-700 fade-in">
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-4 drop-shadow-2xl">
                                {featuredSeries.title}
                            </h1>

                            <div className="flex items-center gap-3 text-lg font-medium text-gray-200">
                                <span className="text-green-400 font-bold">98% Match</span>
                                <span>{new Date(featuredSeries.created_at || featuredSeries.createdAt).getFullYear()}</span>
                                <span className="px-2 py-0.5 border border-gray-500 rounded text-xs text-gray-300">U/A 13+</span>
                                <span>{featuredSeries.categoryName || 'Series'}</span>
                            </div>

                            <p className="text-lg text-gray-300 line-clamp-3 drop-shadow-md leading-relaxed max-w-xl">
                                {featuredSeries.description || "Experience this incredible series exclusively on our platform."}
                            </p>

                            <div className="flex items-center gap-4 pt-4">
                                <Link
                                    href={`/series/${featuredSeries.id}`}
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
            ) : (
                <div className="h-[50vh] flex items-center justify-center">
                    <p className="text-gray-500">No series available.</p>
                </div>
            )}

            {/* CONTENT ROWS */}
            {allSeries.length > 0 && (
                <div className="relative z-10 space-y-12 pb-20 -mt-24 pl-4 sm:pl-6 lg:pl-8 overflow-hidden">
                    <ContentRow title="Trending Now" items={trendingSeries} />
                    <ContentRow title="New Releases" items={newSeries} />
                    <ContentRow title="Watch It Again" items={trendingSeries.slice().reverse()} />
                </div>
            )}

        </div>
    );
}

function ContentRow({ title, items }: { title: string, items: any[] }) {
    if (items.length === 0) return null;

    const getThumb = (s: any) => s.thumbnail_url || s.thumbnailUrl || s.cover_image_url || s.coverImageUrl || '/placeholder-thumb.jpg';

    return (
        <div className="space-y-4">
            <h2 className="text-xl md:text-2xl font-bold text-white hover:text-gray-300 transition-colors cursor-pointer inline-flex items-center gap-2 group">
                {title}
                <span className="text-sm text-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0 duration-300">Explore All</span>
            </h2>

            <div className="relative group/row">
                {/* Scroll Container */}
                <div className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide px-0 snap-x snap-mandatory">
                    {items.map((series) => (
                        <Link
                            href={`/series/${series.id}`}
                            key={series.id}
                            className="flex-shrink-0 w-[160px] md:w-[200px] aspect-[2/3] relative rounded-md overflow-hidden bg-gray-800 transition-all duration-300 hover:scale-105 hover:z-20 hover:ring-2 hover:ring-white snap-center cursor-pointer group/card"
                        >
                            <Image
                                src={getThumb(series)}
                                alt={series.title}
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover/card:opacity-100 transition-opacity flex flex-col justify-end p-3">
                                <h3 className="font-bold text-sm text-white line-clamp-2 leading-tight mb-1">{series.title}</h3>
                                <div className="flex flex-wrap gap-2 text-[10px] text-gray-300">
                                    <span className="text-green-400 font-bold">New</span>
                                    <span>•</span>
                                    <span>{series.categoryName || 'Series'}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                {/* Fade effect on right edge */}
                <div className="absolute right-0 top-0 bottom-8 w-24 bg-gradient-to-l from-[#141414] to-transparent pointer-events-none" />
            </div>
        </div>
    );
}
