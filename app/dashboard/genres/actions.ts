'use server'

import { db } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Video Genres
export async function getVideoGenres() {
    return await db.videoGenre.findMany({ orderBy: { name: 'asc' } })
}

export async function toggleVideoGenreStatus(id: number, isActive: boolean) {
    await db.videoGenre.update({ where: { id }, data: { isActive } })
    revalidatePath('/dashboard/genres')
}

// Music Genres
export async function getMusicGenres() {
    return await db.musicGenre.findMany({ orderBy: { name: 'asc' } })
}

export async function toggleMusicGenreStatus(id: number, isActive: boolean) {
    await db.musicGenre.update({ where: { id }, data: { isActive } })
    revalidatePath('/dashboard/genres')
}
