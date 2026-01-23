'use server';

import { fetchPublicApi } from '@/lib/api';

export async function getLandingPageData() {
    try {
        const [featuredData, trendingData, latestData, reelsData] = await Promise.all([
            fetchPublicApi('/videos?is_featured=1&limit=5'),
            fetchPublicApi('/videos/trending?limit=10'),
            fetchPublicApi('/videos?limit=12'),
            fetchPublicApi('/videos?type=reel&limit=10')
        ]);

        return {
            featuredVideos: featuredData.videos || [],
            trendingVideos: trendingData.videos || [],
            latestVideos: latestData.videos || [],
            reelsVideos: reelsData.videos || []
        };
    } catch (error) {
        console.error("Error fetching landing page data:", error);
        return { featuredVideos: [], trendingVideos: [], latestVideos: [], reelsVideos: [] };
    }
}
