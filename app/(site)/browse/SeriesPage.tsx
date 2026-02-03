'use client';

import { HeroCarousel } from '@/components/site/HeroCarousel';
import { MediaCard } from '@/components/site/MediaCard';
import { fetchPublicApi } from '@/lib/api';
import Link from 'next/link';

// ---- Shared Section Component (Inline for now, similar to MoviesPage pattern) ----
function Section({ title, children, viewAllLink }: { title: string, children: React.ReactNode, viewAllLink?: string }) {
    return (
        <section>
            <div className="flex items-end justify-between mb-2 px-6 lg:px-20 relative z-10">
                <h2 className="text-2xl md:text-3xl font-serif-display font-bold text-white drop-shadow-md">
                    {title}
                </h2>
                {viewAllLink && (
                    <Link href={viewAllLink} className="text-sm font-bold text-[#fbbf24] hover:text-white transition-colors relative top-1">
                        Explore All &rarr;
                    </Link>
                )}
            </div>
            {children}
        </section>
    )
}

export async function SeriesPage() {
    // Parallel Fetch from Express Backend
    const [featuredData, allSeriesData] = await Promise.all([
        fetchPublicApi('/series?is_featured=1&limit=5'),
        fetchPublicApi('/series?limit=50')
    ]);

    // Data Preparation
    const featuredList = featuredData?.series || [];
    const allSeries = allSeriesData?.series || [];

    // If no specific featured series, take top 5 from all
    const heroSeries = featuredList.length > 0 ? featuredList : allSeries.slice(0, 5);

    // Filter/Sort logic for rows (Mocking categories if backend doesn't serve them pre-grouped)
    const trendingSeries = allSeries.slice(0, 15); // Top 15
    const newReleases = [...allSeries].sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 15);

    const crimeSeries = allSeries.filter((s: any) => s.categoryName === 'Crime' || s.title.includes('Crime'));
    const dramaSeries = allSeries.filter((s: any) => s.categoryName === 'Drama' || !s.categoryName); // Fallback

    return (
        <div className="min-h-screen bg-[#0a0a14] -mt-[80px]"> {/* Negative margin to go behind navbar */}

            {/* 1. HERO CAROUSEL (Top 5) */}
            <HeroCarousel videos={heroSeries} />

            {/* 2. CONTENT SECTIONS */}
            <div className="relative z-10 space-y-16 pb-20 -mt-20 md:-mt-24">

                {/* Trending Row */}
                <Section title="Trending Series" viewAllLink="/browse?cat=series&sort=trending">
                    <div className="flex gap-4 overflow-x-auto pb-16 pt-20 px-6 lg:px-20 no-scrollbar -mx-6 lg:-mx-20">
                        {trendingSeries.map((series: any, idx: number) => (
                            <MediaCard key={series.id} video={series} type="SERIES" rank={idx + 1} />
                        ))}
                    </div>
                </Section>

                {/* New Releases */}
                <Section title="New Arrivals" viewAllLink="/browse?cat=series&sort=new">
                    <div className="flex gap-4 overflow-x-auto pb-16 pt-20 px-6 lg:px-20 no-scrollbar -mx-6 lg:-mx-20">
                        {newReleases.map((series: any) => (
                            <MediaCard key={series.id} video={series} type="SERIES" />
                        ))}
                    </div>
                </Section>

                {/* Genre Rows (Conditional) */}
                {crimeSeries.length > 0 && (
                    <Section title="Crime & Thriller">
                        <div className="flex gap-4 overflow-x-auto pb-16 pt-20 px-6 lg:px-20 no-scrollbar -mx-6 lg:-mx-20">
                            {crimeSeries.map((series: any) => (
                                <MediaCard key={series.id} video={series} type="SERIES" />
                            ))}
                        </div>
                    </Section>
                )}

                {dramaSeries.length > 0 && (
                    <Section title="Dramatic Hits">
                        <div className="flex gap-4 overflow-x-auto pb-16 pt-20 px-6 lg:px-20 no-scrollbar -mx-6 lg:-mx-20">
                            {dramaSeries.map((series: any) => (
                                <MediaCard key={series.id} video={series} type="SERIES" />
                            ))}
                        </div>
                    </Section>
                )}

            </div>
        </div>
    );
}
