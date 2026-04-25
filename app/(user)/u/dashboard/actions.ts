'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { fetchFromApi } from '@/lib/api';

export async function getMyContent(type?: 'VIDEO' | 'REEL') {
    try {
        const session = await getServerSession(authOptions);
        if (!session) return [];

        const userId = parseInt((session as any).user.id);
        const headers: any = {};
        if (!isNaN(userId)) {
            headers['x-user-id'] = userId.toString();
        }

        const endpoint = type ? `/videos/my-content?type=${type}` : '/videos/my-content';
        const response = await fetchFromApi(endpoint, { headers });

        if (!response.success) return [];

        return (response.videos || []) as any[];
    } catch {
        return [];
    }
}

export async function updateVideo(id: number, formData: FormData) {
    try {
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const categoryId = formData.get('categoryId') as string;
        const isActive = formData.get('isActive') === 'true';
        const thumbnailUrl = formData.get('thumbnailUrl') as string;

        const body: Record<string, unknown> = {
            title,
            description,
            categoryId: parseInt(categoryId),
            isActive,
        };
        if (thumbnailUrl?.trim()) {
            body.thumbnailUrl = thumbnailUrl.trim();
        }

        await fetchFromApi(`/videos/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(body),
        });

        revalidatePath('/u/dashboard');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteVideo(id: number) {
    try {
        await fetchFromApi(`/videos/${id}`, { method: 'DELETE' });
        revalidatePath('/u/dashboard');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function bulkDeleteVideos(ids: number[]) {
    try {
        await Promise.all(ids.map((id) => fetchFromApi(`/videos/${id}`, { method: 'DELETE' })));
        revalidatePath('/u/dashboard');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function removeFromHistory(viewId: number) {
    try {
        await fetchFromApi(`/user/history/${viewId}`, { method: 'DELETE' });
        revalidatePath('/u/dashboard');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function becomeCreator() {
    try {
        await fetchFromApi('/user/become-creator', { method: 'POST' });
        revalidatePath('/u/dashboard');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
