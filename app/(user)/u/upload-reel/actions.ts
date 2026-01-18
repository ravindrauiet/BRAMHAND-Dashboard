'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function submitReel(formData: FormData) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return { success: false, error: 'Unauthorized' };
    }

    const userId = parseInt((session as any).user.id);
    const title = formData.get('title') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const categoryId = parseInt(formData.get('categoryId') as string);

    // Basic validation
    if (!title || !videoUrl || isNaN(categoryId)) {
        return { success: false, error: 'Missing required fields' };
    }

    try {
        await db.video.create({
            data: {
                title,
                description: title, // Use title as description for reels
                videoUrl,
                thumbnailUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80', // Default reel thumb
                categoryId,
                creatorId: userId, // The user is the creator
                type: 'REEL',
                isActive: true, // Auto-publish or set to false for moderation
                language: 'Mix',
                contentRating: 'U',
                duration: 60, // Default duration placeholder
            }
        });

        revalidatePath('/u/dashboard');
        return { success: true };
    } catch (e: any) {
        console.error('Reel upload error:', e);
        return { success: false, error: e.message };
    }
}
