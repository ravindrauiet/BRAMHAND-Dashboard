'use server';

import { fetchFromApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteSong(id: number) {
    try {
        await fetchFromApi(`/admin/songs/${id}`, { method: 'DELETE' });
        revalidatePath('/dashboard/songs');
    } catch (e) {
        console.error("Delete failed", e);
    }
}

export async function toggleSongStatus(id: number, isActive: boolean) {
    try {
        await fetchFromApi(`/admin/songs/${id}/status`, {
            method: 'PATCH',
            body: JSON.stringify({ isActive }),
        });
        revalidatePath('/dashboard/songs');
    } catch (e) {
        console.error("Toggle Status failed", e);
    }
}

// See Video Actions note: File Uploads require multipart backend support
export async function createSong(formData: FormData) {
    console.warn("Create Song Refactor Pending: Requires Backend File Upload Support");
    redirect('/dashboard/songs');
}

export async function updateSong(id: number, formData: FormData) {
    console.warn("Update Song Refactor Pending: Requires Backend File Upload Support");
    redirect('/dashboard/songs');
}
