'use server';

import { db } from '@/lib/db';

export async function getLandingPageData() {
    try {
        const [featuredVideos, trendingVideos, latestVideos] = await Promise.all([
            db.video.findMany({
                where: { isActive: true, isFeatured: true },
                include: { creator: true, category: true },
                orderBy: { createdAt: 'desc' },
                take: 5
            }),
            db.video.findMany({
                where: { isActive: true, isTrending: true },
                include: { creator: true },
                orderBy: { viewsCount: 'desc' },
                take: 10
            }),
            db.video.findMany({
                where: { isActive: true },
                include: { creator: true },
                orderBy: { createdAt: 'desc' },
                take: 12
            })
        ]);

        return { featuredVideos, trendingVideos, latestVideos };
    } catch (error) {
        console.error("Error fetching landing page data:", error);
        return { featuredVideos: [], trendingVideos: [], latestVideos: [] };
    }
}
