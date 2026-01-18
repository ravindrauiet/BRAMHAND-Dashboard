'use server';

import { fetchFromApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteVideo(id: number) {
    try {
        await fetchFromApi(`/admin/videos/${id}`, { method: 'DELETE' });
        revalidatePath('/dashboard/videos');
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
        revalidatePath('/dashboard/videos');
    } catch (e) {
        console.error("Toggle Status failed", e);
    }
}

// NOTE: Creation/Update often involves File Uploads. 
// For a true Single Backend, we'd need to upload stats to backend as multipart/form-data.
// This is a more complex refactor. We will simplify for now to assume logic is handled
// or point out this complexity.
// For now, we will just use basic fields.

export async function createVideo(formData: FormData) {
    // Ideally map FormData to JSON and send to API
    const data: Record<string, any> = {};
    formData.forEach((value, key) => { data[key] = value });

    // Checkboxes handling
    data.isTrending = formData.get('isTrending') === 'on';
    data.isFeatured = formData.get('isFeatured') === 'on';
    data.isActive = formData.get('isActive') === 'on';

    // In a real scenario with File Uploads, you'd send FormData directly if backend supports multer, modification needed.
    // Assuming backend endpoint `/admin/videos` accepts JSON for metadata.

    // WARNING: This part is complex without file upload logic refactoring on backend.
    // We will assume backend handles JSON creation for now to match the pattern.

    /* 
       To support file uploads, backend needs multer.
       Frontend needs to send multipart/form-data.
       Next.js 'fetch' with FormData automatically sets headers.
    */

    /*
    try {
        await fetchFromApi('/admin/videos', {
             method: 'POST',
             body: JSON.stringify(data) 
        });
    } catch(e) { ... }
    */

    console.warn("Create Video Refactor Pending: Requires File Upload Backend Support");
    // For now, we leave this as a placeholder or incomplete until Backend supports upload.
    redirect('/dashboard/videos');
}

export async function updateVideo(id: number, formData: FormData) {
    console.warn("Update Video Refactor Pending");
    redirect('/dashboard/videos');
}
