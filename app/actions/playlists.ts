'use server';

import { fetchFromApi, fetchPublicApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function getPlaylists() {
    try {
        // Fetch from API
        const response = await fetchPublicApi('/music/playlists');
        const playlists = response.playlists || [];

        // Note: API needs to be updated to include user/counts 
        // to match previous Prisma include.
        return { playlists };
    } catch (error) {
        return { error: 'Failed to fetch playlists' };
    }
}

export async function deletePlaylist(id: number) {
    try {
        await fetchFromApi(`/music/playlists/${id}`, { method: 'DELETE' });
        revalidatePath('/dashboard/songs/playlists');
        return { success: true };
    } catch (error) {
        return { error: 'Failed' };
    }
}
