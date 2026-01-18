'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteSong(id: number) {
    await db.song.delete({ where: { id } });
    revalidatePath('/dashboard/songs');
}

export async function toggleSongStatus(id: number, isActive: boolean) {
    await db.song.update({ where: { id }, data: { isActive } });
    revalidatePath('/dashboard/songs');
}

export async function createSong(formData: FormData) {
    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;
    const album = formData.get('album') as string;
    const audioUrl = formData.get('audioUrl') as string;
    const coverImageUrl = formData.get('coverImageUrl') as string;
    const genreId = parseInt(formData.get('genreId') as string);

    // Boolean fields
    const isTrending = formData.get('isTrending') === 'on';
    const isFeatured = formData.get('isFeatured') === 'on';
    const isActive = formData.get('isActive') === 'on';

    await db.song.create({
        data: {
            title,
            artist,
            album,
            audioUrl,
            coverImageUrl,
            genreId,
            isTrending,
            isFeatured,
            isActive,
        },
    });

    revalidatePath('/dashboard/songs');
    redirect('/dashboard/songs');
}

export async function updateSong(id: number, formData: FormData) {
    const title = formData.get('title') as string;
    const artist = formData.get('artist') as string;
    const album = formData.get('album') as string;
    const audioUrl = formData.get('audioUrl') as string;
    const coverImageUrl = formData.get('coverImageUrl') as string;
    const genreId = parseInt(formData.get('genreId') as string);

    const isTrending = formData.get('isTrending') === 'on';
    const isFeatured = formData.get('isFeatured') === 'on';
    const isActive = formData.get('isActive') === 'on';

    await db.song.update({
        where: { id },
        data: {
            title,
            artist,
            album,
            audioUrl,
            coverImageUrl,
            genreId,
            isTrending,
            isFeatured,
            isActive,
        },
    });

    revalidatePath('/dashboard/songs');
    redirect('/dashboard/songs');
}
