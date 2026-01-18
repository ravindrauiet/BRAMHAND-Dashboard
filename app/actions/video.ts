'use server';

import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { revalidatePath } from 'next/cache';

export async function toggleVideoLike(videoId: number) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        throw new Error('Unauthorized');
    }

    const userId = parseInt((session.user as any).id);

    const existingLike = await db.videoLike.findUnique({
        where: {
            userId_videoId: {
                userId,
                videoId
            }
        }
    });

    if (existingLike) {
        // Unlike
        await db.videoLike.delete({
            where: {
                userId_videoId: {
                    userId,
                    videoId
                }
            }
        });

        await db.video.update({
            where: { id: videoId },
            data: { likesCount: { decrement: 1 } }
        });

        revalidatePath(`/watch/${videoId}`);
        return { isLiked: false };
    } else {
        // Like
        await db.videoLike.create({
            data: {
                userId,
                videoId
            }
        });

        await db.video.update({
            where: { id: videoId },
            data: { likesCount: { increment: 1 } }
        });

        revalidatePath(`/watch/${videoId}`);
        return { isLiked: true };
    }
}
