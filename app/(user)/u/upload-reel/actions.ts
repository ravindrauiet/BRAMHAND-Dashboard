'use server';

import { fetchFromApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function submitReel(formData: FormData) {
    const title = formData.get('title') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const categoryId = parseInt(formData.get('categoryId') as string);

    // Basic validation
    if (!title || !videoUrl || isNaN(categoryId)) {
        return { success: false, error: 'Missing required fields' };
    }

    try {
        await fetchFromApi('/videos', {
            method: 'POST',
            body: JSON.stringify({
                title,
                video_url: videoUrl,
                category_id: categoryId,
                creator_id: null, // Backend will infer from token
                type: 'REEL'
            })
        });

        revalidatePath('/u/dashboard');
        return { success: true };
    } catch (e: any) {
        console.error('Reel upload error:', e);
        return { success: false, error: e.message };
    }
}
