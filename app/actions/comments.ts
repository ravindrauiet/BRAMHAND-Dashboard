'use server';

import { db } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getVideoComments(videoId: number) {
    try {
        const comments = await db.comment.findMany({
            where: { videoId },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        profileImage: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
        return { comments };
    } catch (error) {
        return { error: 'Failed to fetch comments' };
    }
}

export async function deleteComment(commentId: number, videoId: number) {
    try {
        await db.comment.delete({
            where: { id: commentId }
        });

        await db.video.update({
            where: { id: videoId },
            data: { commentsCount: { decrement: 1 } }
        });

        revalidatePath(`/dashboard/videos/${videoId}`);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete' };
    }
}
