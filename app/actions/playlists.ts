'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getPlaylists() {
    try {
        const playlists = await db.playlist.findMany({
            include: {
                user: true,
                _count: {
                    select: { songs: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { playlists };
    } catch (error) {
        return { error: 'Failed to fetch playlists' };
    }
}

export async function deletePlaylist(id: number) {
    try {
        await db.playlist.delete({
            where: { id }
        });
        revalidatePath('/dashboard/songs/playlists');
        return { success: true };
    } catch (error) {
        return { error: 'Failed' };
    }
}
