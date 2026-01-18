'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function deleteVideo(id: number) {
    await db.video.delete({
        where: { id },
    });
    revalidatePath('/dashboard/videos');
}

export async function toggleVideoStatus(id: number, isActive: boolean) {
    await db.video.update({
        where: { id },
        data: { isActive },
    });
    revalidatePath('/dashboard/videos');
}

export async function createVideo(formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const thumbnailUrl = formData.get('thumbnailUrl') as string;
    const categoryId = parseInt(formData.get('categoryId') as string);
    const creatorId = parseInt(formData.get('creatorId') as string);

    // Boolean and Enum fields
    const isTrending = formData.get('isTrending') === 'on';
    const isFeatured = formData.get('isFeatured') === 'on';
    const isActive = formData.get('isActive') === 'on';
    const language = formData.get('language') as string;
    const contentRating = formData.get('contentRating') as 'U' | 'UA' | 'A' | 'S' | 'UA_13_PLUS' | 'UA_16_PLUS' | 'PG' | 'PG_13';
    const type = (formData.get('type') as 'VIDEO' | 'REEL') || 'VIDEO';

    await db.video.create({
        data: {
            title,
            description,
            videoUrl,
            thumbnailUrl,
            categoryId,
            creatorId,
            isTrending,
            isFeatured,
            isActive,
            language,
            contentRating,
            type,
        },
    });

    revalidatePath('/dashboard/videos');
    redirect('/dashboard/videos');
}

export async function updateVideo(id: number, formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const videoUrl = formData.get('videoUrl') as string;
    const thumbnailUrl = formData.get('thumbnailUrl') as string;
    const categoryId = parseInt(formData.get('categoryId') as string);

    const isTrending = formData.get('isTrending') === 'on';
    const isFeatured = formData.get('isFeatured') === 'on';
    const isActive = formData.get('isActive') === 'on';
    const language = formData.get('language') as string;
    const contentRating = formData.get('contentRating') as 'U' | 'UA' | 'A' | 'S' | 'UA_13_PLUS' | 'UA_16_PLUS' | 'PG' | 'PG_13';
    const type = (formData.get('type') as 'VIDEO' | 'REEL') || 'VIDEO';

    await db.video.update({
        where: { id },
        data: {
            title,
            description,
            videoUrl,
            thumbnailUrl,
            categoryId,
            isTrending,
            isFeatured,
            isActive,
            language,
            contentRating,
            type,
        },
    });

    revalidatePath('/dashboard/videos');
    redirect('/dashboard/videos');
}
