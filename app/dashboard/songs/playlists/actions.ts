'use server';

import { fetchFromApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function getPlaylists() {
    const data = await fetchFromApi('/admin/playlists');
    return data.success ? data.playlists : [];
}

export async function deletePlaylist(id: number) {
    // Stub - Backend support needed
    console.warn('deletePlaylist not implemented on backend');
    revalidatePath('/dashboard/songs/playlists');
}
