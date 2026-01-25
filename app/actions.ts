'use server';

import { fetchPublicApi } from '@/lib/api';

export async function getLandingPageData() {
    try {
        const [featuredData, trendingData, moviesData, seriesData, reelsData] = await Promise.all([
            fetchPublicApi('/videos?is_featured=1&limit=5&exclude_series=true'),
            fetchPublicApi('/videos/trending?limit=10&exclude_series=true'),
            fetchPublicApi('/videos?type=VIDEO&exclude_series=true&limit=15'), // Explicit Movies
            fetchPublicApi('/series?limit=10'), // Explicit Series
            fetchPublicApi('/videos?type=REEL&limit=10') // Corrected Enum
        ]);

        return {
            featuredVideos: featuredData.videos || [],
            trendingVideos: trendingData.videos || [],
            latestVideos: moviesData.videos || [],
            seriesList: seriesData.series || [],
            reelsVideos: reelsData.videos || []
        };
    } catch (error) {
        console.error("Error fetching landing page data:", error);
        return { featuredVideos: [], trendingVideos: [], latestVideos: [], seriesList: [], reelsVideos: [] };
    }
}
