'use server';

import { fetchFromApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteVideo(id: number) {
    try {
        await fetchFromApi(`/admin/videos/${id}`, { method: 'DELETE' });
        revalidatePath('/dashboard/reels');
    } catch (e) {
        console.error("Delete failed", e);
    }
}

export async function toggleVideoStatus(id: number, isActive: boolean) {
    try {
        await fetchFromApi(`/admin/videos/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ isActive }),
        });
        revalidatePath('/dashboard/reels');
    } catch (e) {
        console.error("Toggle Status failed", e);
    }
}

export async function createVideo(formData: FormData) {
    console.warn("Create Reel Refactor Pending: Requires Backend File Upload Support");
    redirect('/dashboard/reels');
}

export async function updateVideo(id: number, formData: FormData) {
    console.warn("Update Reel Refactor Pending");
    redirect('/dashboard/reels');
}

export async function fetchReelFormData(id?: string) {
    const [categoriesData, creatorsData, videoData] = await Promise.all([
        fetchFromApi('/admin/categories'),
        fetchFromApi('/admin/creators'),
        id ? fetchFromApi(`/admin/videos/${id}`) : Promise.resolve(null)
    ]);

    return {
        categories: categoriesData.categories || [],
        creators: creatorsData.creators || [],
        video: videoData?.video || null
    };
}
