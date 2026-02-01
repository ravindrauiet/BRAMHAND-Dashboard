'use server';

import { fetchFromApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function getUserPlaylists() {
    try {
        const response = await fetchFromApi('/music/my-playlists');
        return { playlists: response.playlists || [] };
    } catch (error) {
        return { error: 'Failed' };
    }
}

export async function createPlaylist(formData: FormData) {
    const name = formData.get('name') as string;
    const isPublic = formData.get('isPublic') === 'on';

    if (!name) return { error: 'Name is required' };

    try {
        await fetchFromApi('/music/playlists', {
            method: 'POST',
            body: JSON.stringify({
                name,
                is_public: isPublic
            })
        });
        revalidatePath('/u/playlists');
        revalidatePath('/u/dashboard');
        return { success: true };
    } catch (error: any) {
        console.error('Create Playlist Error:', error);
        return { error: error.message || 'Failed to create' };
    }
}

export async function deleteUserPlaylist(id: number) {
    try {
        await fetchFromApi(`/music/playlists/${id}`, { method: 'DELETE' });
        revalidatePath('/u/playlists');
        revalidatePath('/u/dashboard');
        return { success: true };
    } catch (error) {
        return { error: 'Failed' };
    }
}
