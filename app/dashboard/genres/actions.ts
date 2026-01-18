'use server';

import { fetchFromApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function getVideoGenres() {
    return [];
}

export async function getMusicGenres() {
    const data = await fetchFromApi('/admin/genres');
    return data.success ? data.genres : [];
}

export async function toggleVideoGenreStatus(id: number, isActive: boolean) {
    // Stub
    revalidatePath('/dashboard/genres');
}

export async function toggleMusicGenreStatus(id: number, isActive: boolean) {
    // Stub - Backend doesn't support Music Genre status toggle yet?
    // adminCategoryController has deleteMusicGenre but no update status.
    revalidatePath('/dashboard/genres');
}

export async function deleteGenre(id: number, type: 'VIDEO' | 'MUSIC') {
    try {
        if (type === 'MUSIC') {
            await fetchFromApi(`/admin/genres/${id}`, { method: 'DELETE' });
        }
        revalidatePath('/dashboard/genres');
    } catch (e) {
        console.warn(e);
    }
}
