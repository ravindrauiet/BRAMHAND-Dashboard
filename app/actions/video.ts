'use server';

import { fetchFromApi } from '@/lib/api';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function toggleVideoLike(videoId: number) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        throw new Error('Unauthorized');
    }

    try {
        // 1. Get current like status from API
        const { video } = await fetchFromApi(`/videos/${videoId}`);
        const currentlyLiked = !!video.is_liked;

        if (currentlyLiked) {
            // 2. Unlike via API
            await fetchFromApi(`/videos/${videoId}/like`, { method: 'DELETE' });
            revalidatePath(`/watch/${videoId}`);
            return { isLiked: false };
        } else {
            // 2. Like via API
            await fetchFromApi(`/videos/${videoId}/like`, { method: 'POST' });
            revalidatePath(`/watch/${videoId}`);
            return { isLiked: true };
        }
    } catch (error) {
        console.error('toggleVideoLike API Error:', error);
        throw error;
    }
}
