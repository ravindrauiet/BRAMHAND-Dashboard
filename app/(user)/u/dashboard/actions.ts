'use server';

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

        console.log(`getMyContent: Fetching ${type || 'all'} content via API`);

        const userId = parseInt((session as any).user.id);
        const headers: any = {};
        if (!isNaN(userId)) {
            headers['x-user-id'] = userId.toString();
        }

        const endpoint = type ? `/videos/my-content?type=${type}` : '/videos/my-content';
        const response = await fetchFromApi(endpoint, { headers });

        if (!response.success) {
            console.error('getMyContent API error:', response);
            return [];
        }

        const videos = response.videos || [];

        console.log(`getMyContent: Found ${videos.length} ${type || 'all'} videos`);

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

export async function removeFromHistory(viewId: number) {
    try {
        await fetchFromApi(`/user/history/${viewId}`, {
            method: 'DELETE'
        });

        revalidatePath('/u/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Remove from history error:', error);
        return { success: false, error: error.message };
    }
}

