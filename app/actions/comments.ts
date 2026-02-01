'use server';

import { fetchFromApi, fetchPublicApi } from '@/lib/api';
import { revalidatePath } from 'next/cache';

export async function getVideoComments(videoId: number) {
    try {
        const response = await fetchPublicApi(`/videos/${videoId}/comments`);
        const apiComments = response.comments || [];

        // Map API format to frontend component expectation
        const comments = apiComments.map((c: any) => ({
            id: c.id,
            parentId: c.parentId,
            comment: c.comment,
            createdAt: c.created_at,
            user: {
                fullName: c.user_name,
                profileImage: c.user_avatar
            }
        }));

        return { comments };
    } catch (error) {
        return { error: 'Failed to fetch comments' };
    }
}

export async function deleteComment(commentId: number, videoId: number) {
    try {
        await fetchFromApi(`/videos/comments/${commentId}`, { method: 'DELETE' });
        revalidatePath(`/dashboard/videos/${videoId}`);
        return { success: true };
    } catch (error) {
        return { error: 'Failed to delete' };
    }
}
