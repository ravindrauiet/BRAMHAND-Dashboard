'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getUserPlaylists() {
    const session = await getServerSession(authOptions);
    if (!session) return { error: 'Unauthorized' };
    const userId = parseInt((session as any).user.id);

    try {
        const playlists = await db.playlist.findMany({
            where: { userId },
            include: {
                _count: { select: { songs: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { playlists };
    } catch (error) {
        return { error: 'Failed' };
    }
}

export async function createPlaylist(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: 'Unauthorized' };
    const userId = parseInt((session as any).user.id);
    const name = formData.get('name') as string;
    const isPublic = formData.get('isPublic') === 'on';

    if (!name) return { error: 'Name is required' };

    try {
        await db.playlist.create({
            data: {
                userId,
                name,
                isPublic
            }
        });
        revalidatePath('/u/playlists');
        revalidatePath('/u/dashboard');
        return { success: true };
    } catch (error) {
        return { error: 'Failed to create' };
    }
}

export async function deleteUserPlaylist(id: number) {
    const session = await getServerSession(authOptions);
    if (!session) return { error: 'Unauthorized' };
    const userId = parseInt((session as any).user.id);

    try {
        // Ensure ownership
        const playlist = await db.playlist.findFirst({
            where: { id, userId }
        });
        if (!playlist) return { error: 'Not found or unauthorized' };

        await db.playlist.delete({ where: { id } });
        revalidatePath('/u/playlists');
        revalidatePath('/u/dashboard');
        return { success: true };
    } catch (error) {
        return { error: 'Failed' };
    }
}
