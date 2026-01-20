'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { fetchFromApi } from '@/lib/api';

export async function getMyContent(type?: 'VIDEO' | 'REEL') {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            console.error('getMyContent: No session found');
            return [];
        }

        const userId = parseInt((session as any).user.id);
        if (isNaN(userId)) {
            console.error('getMyContent: Invalid user ID');
            return [];
        }

        console.log(`getMyContent: Fetching ${type || 'all'} content for user ${userId}`);

        // Query database directly for better reliability
        let videos;
        if (type) {
            videos = await db.$queryRaw`
                SELECT v.*, c.name as categoryName,
                       (SELECT COUNT(*) FROM video_likes WHERE video_id = v.id) as likesCount,
                       (SELECT COUNT(*) FROM video_shares WHERE video_id = v.id) as sharesCount
                FROM videos v
                LEFT JOIN video_categories c ON v.category_id = c.id
                WHERE v.creator_id = ${userId} AND v.type = ${type}
                ORDER BY v.created_at DESC
            `;
        } else {
            videos = await db.$queryRaw`
                SELECT v.*, c.name as categoryName,
                       (SELECT COUNT(*) FROM video_likes WHERE video_id = v.id) as likesCount,
                       (SELECT COUNT(*) FROM video_shares WHERE video_id = v.id) as sharesCount
                FROM videos v
                LEFT JOIN video_categories c ON v.category_id = c.id
                WHERE v.creator_id = ${userId}
                ORDER BY v.created_at DESC
            `;
        }

        console.log(`getMyContent: Found ${(videos as any[]).length} ${type || 'all'} videos for user ${userId}`);

        if ((videos as any[]).length > 0) {
            console.log('getMyContent: First video:', {
                id: (videos as any[])[0].id,
                title: (videos as any[])[0].title,
                type: (videos as any[])[0].type
            });
        }

        return videos as any[];
    } catch (error) {
        console.error('getMyContent error:', error);
        return [];
    }
}

export async function updateVideo(id: number, formData: FormData) {
    try {
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const categoryId = formData.get('categoryId') as string;
        const isActive = formData.get('isActive') === 'true';

        await fetchFromApi(`/videos/${id}`, {
            method: 'PATCH',
            body: JSON.stringify({
                title,
                description,
                categoryId: parseInt(categoryId),
                isActive
            })
        });

        revalidatePath('/u/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Update video error:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteVideo(id: number) {
    try {
        await fetchFromApi(`/videos/${id}`, {
            method: 'DELETE'
        });

        revalidatePath('/u/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Delete video error:', error);
        return { success: false, error: error.message };
    }
}

