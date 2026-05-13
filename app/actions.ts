'use server';

import { fetchFromApi, fetchPublicApi } from '@/lib/api';

export async function getLandingPageData() {
    try {
        const fallbackHomeData = async () => {
            const [featuredData, trendingData, moviesData, seriesData, reelsData] = await Promise.all([
                fetchPublicApi('/videos?is_featured=1&limit=6&exclude_series=true'),
                fetchPublicApi('/videos/trending?limit=12&exclude_series=true'),
                fetchPublicApi('/videos?type=VIDEO&exclude_series=true&limit=12'),
                fetchPublicApi('/series?limit=10'),
                fetchPublicApi('/videos?type=REEL&limit=12')
            ]);

            return {
                hero: featuredData.videos || [],
                sections: [
                    { id: 'trending-now', title: 'Trending Now', items: trendingData.videos || [], type: 'MOVIE', viewAllLink: '/browse?cat=movies' },
                    { id: 'latest-movies', title: 'Latest Movies', items: moviesData.videos || [], type: 'MOVIE', viewAllLink: '/latest' },
                    { id: 'binge-series', title: 'Binge-Worthy Series', items: seriesData.series || [], type: 'SERIES', viewAllLink: '/browse?cat=series' },
                    { id: 'trending-shorts', title: 'Trending Shorts', items: reelsData.videos || [], type: 'REEL', viewAllLink: '/browse?cat=reels' },
                ],
            };
        };

        const [homeData, continueWatchingData] = await Promise.all([
            fetchFromApi('/videos/home-sections')
                .then(async (data) => (data?.hero || data?.sections) ? data : fallbackHomeData())
                .catch(() => fallbackHomeData()),
            fetchFromApi('/user/continue-watching?limit=10').catch(() => ({ items: [] })),
        ]);

        return {
            heroVideos: homeData.hero || [],
            sections: homeData.sections || [],
            continueWatching: continueWatchingData.items || [],
        };
    } catch (error) {
        console.error("Error fetching landing page data:", error);
        return { heroVideos: [], sections: [], continueWatching: [] };
    }
}
